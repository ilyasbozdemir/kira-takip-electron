import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { initializeDatabase as initSchemaDatabase } from "./database/index";
import { workspaceManager } from "./database/workspace";

export type Hall = {
  id: string;
  venueId?: string;
  name: string;
  floor: string;
  capacity: number;
  hourlyPrice: number;
};

export type Personnel = {
  id: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

export type Venue = {
  id: string;
  name: string;
  district: string;
  category?: string;
  address?: string;
  mapUrl?: string;
  managerName?: string;
  managerPhone?: string;
  managerTitle?: string;
  halls: Hall[];
};

export type ReservationStatus = "option" | "confirmed" | "cancelled";

export type Reservation = {
  id: string;
  venueId: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  customer: string;
  phone: string;
  eventType: string; // Düğün, Nişan, Konferans, Toplantı, Konser, Lansman, Balo, İftar, Özel Etkinlik
  price: number;
  paid: number;
  note?: string;
  decisionInfo?: string; // Encümen / Meclis Kararı / Resmi Tarife Dayanağı
  status?: ReservationStatus | string;
  receiptNo?: string;
  paymentMethod?: string;
};

export type StoreData = {
  venues: Venue[];
  reservations: Reservation[];
  personnel?: Personnel[];
};

let db: Database.Database | null = null;
let currentDbPath: string | null = null;

export const uid = () => Math.random().toString(36).slice(2, 10);

export function initDatabase(dbFilePath?: string): string | null {
  if (db) {
    try {
      db.close();
    } catch {}
    db = null;
  }

  let targetPath = dbFilePath || currentDbPath;
  if (!targetPath) {
    currentDbPath = null;
    db = null;
    return null;
  }

  currentDbPath = targetPath;

  try {
    workspaceManager.open(targetPath);
    db = workspaceManager.getDb();
    if (db) {
      initSchemaDatabase(db);
      runMigrations(db);
      ensureDynamicColumns(db);
    }
  } catch {
    db = new Database(targetPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchemaDatabase(db);
    runMigrations(db);
    ensureDynamicColumns(db);
  }

  return targetPath;
}

function ensureDynamicColumns(d: Database.Database) {
  const ensureCols = (table: string, cols: { name: string; def: string }[]) => {
    try {
      const existing = (d.prepare(`PRAGMA table_info(${table})`).all() as any[]).map((c) => c.name);
      for (const col of cols) {
        if (!existing.includes(col.name)) {
          d.exec(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.def}`);
        }
      }
    } catch {}
  };

  ensureCols("DATA_Rezervasyon", [
    { name: "decisionInfo", def: "TEXT DEFAULT ''" },
    { name: "status", def: "TEXT DEFAULT 'confirmed'" },
    { name: "receiptNo", def: "TEXT DEFAULT ''" },
    { name: "paymentMethod", def: "TEXT DEFAULT 'Nakit'" },
    { name: "note", def: "TEXT DEFAULT ''" },
    { name: "isDeleted", def: "INTEGER DEFAULT 0" },
  ]);

  ensureCols("TANIM_Mekan", [
    { name: "address", def: "TEXT DEFAULT ''" },
    { name: "mapUrl", def: "TEXT DEFAULT ''" },
    { name: "managerName", def: "TEXT DEFAULT ''" },
    { name: "managerPhone", def: "TEXT DEFAULT ''" },
    { name: "managerTitle", def: "TEXT DEFAULT ''" },
    { name: "color", def: "TEXT DEFAULT '#6366f1'" },
    { name: "isDeleted", def: "INTEGER DEFAULT 0" },
  ]);

  ensureCols("TANIM_Salon", [
    { name: "color", def: "TEXT DEFAULT '#8b5cf6'" },
    { name: "isDeleted", def: "INTEGER DEFAULT 0" },
  ]);

  try {
    d.exec(`
      CREATE TABLE IF NOT EXISTS TANIM_Personel (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT DEFAULT 'Tesis Sorumlusu',
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        notes TEXT DEFAULT ''
      );
    `);
  } catch {}

  try {
    d.exec(`
      DROP VIEW IF EXISTS venues;
      DROP VIEW IF EXISTS halls;
      DROP VIEW IF EXISTS reservations;
      DROP VIEW IF EXISTS settings;

      CREATE VIEW venues AS 
      SELECT id, name, district, category, address, mapUrl AS map_url, managerName AS manager_name, managerPhone AS manager_phone, managerTitle AS manager_title, color FROM TANIM_Mekan WHERE isDeleted = 0;

      CREATE VIEW halls AS 
      SELECT id, venueId AS venue_id, name, floor, capacity, hourlyPrice AS hourly_price, color FROM TANIM_Salon WHERE isDeleted = 0;

      CREATE VIEW reservations AS 
      SELECT id, venueId AS venue_id, hallId AS hall_id, date, startTime AS start_time, endTime AS end_time, customer, phone, eventType AS event_type, price, paid, note, decisionInfo AS decision_info, status, receiptNo AS receipt_no, paymentMethod AS payment_method FROM DATA_Rezervasyon WHERE isDeleted = 0;

      CREATE VIEW settings AS 
      SELECT key, value FROM TANIM_Ayar;
    `);
  } catch {}
}

function runMigrations(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = database.prepare("SELECT version FROM schema_migrations").all() as { version: number }[];
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  const migrations = [
    {
      version: 1,
      name: "001_base_tables",
      up: (d: Database.Database) => {
        d.exec(`
          CREATE TABLE IF NOT EXISTS venues (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            district TEXT NOT NULL,
            category TEXT DEFAULT 'Genel'
          );

          CREATE TABLE IF NOT EXISTS halls (
            id TEXT PRIMARY KEY,
            venue_id TEXT NOT NULL,
            name TEXT NOT NULL,
            floor TEXT DEFAULT 'Zemin Kat',
            capacity INTEGER DEFAULT 100,
            hourly_price REAL DEFAULT 0,
            FOREIGN KEY(venue_id) REFERENCES venues(id) ON DELETE RESTRICT
          );

          CREATE TABLE IF NOT EXISTS reservations (
            id TEXT PRIMARY KEY,
            venue_id TEXT NOT NULL,
            hall_id TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            customer TEXT NOT NULL,
            phone TEXT NOT NULL,
            event_type TEXT DEFAULT 'Genel Etkinlik',
            price REAL DEFAULT 0,
            paid REAL DEFAULT 0,
            note TEXT,
            decision_info TEXT DEFAULT '',
            FOREIGN KEY(venue_id) REFERENCES venues(id) ON DELETE RESTRICT,
            FOREIGN KEY(hall_id) REFERENCES halls(id) ON DELETE RESTRICT
          );
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );
        `);
      },
    },
    {
      version: 2,
      name: "002_performance_indexes",
      up: (d: Database.Database) => {
        try {
          d.exec(`
            CREATE INDEX IF NOT EXISTS idx_data_rezervasyon_hall_date ON DATA_Rezervasyon(hallId, date);
            CREATE INDEX IF NOT EXISTS idx_data_rezervasyon_venue_date ON DATA_Rezervasyon(venueId, date);
            CREATE INDEX IF NOT EXISTS idx_tanim_salon_venue ON TANIM_Salon(venueId);
          `);
        } catch {}
      },
    },
    {
      version: 3,
      name: "003_decision_info_column",
      up: (d: Database.Database) => {
        try {
          d.exec("ALTER TABLE reservations ADD COLUMN decision_info TEXT DEFAULT ''");
        } catch {}
      },
    },
    {
      version: 4,
      name: "004_status_receipt_columns",
      up: (d: Database.Database) => {
        try {
          d.exec("ALTER TABLE DATA_Rezervasyon ADD COLUMN status TEXT DEFAULT 'confirmed'");
        } catch {}
        try {
          d.exec("ALTER TABLE DATA_Rezervasyon ADD COLUMN receiptNo TEXT DEFAULT ''");
        } catch {}
        try {
          d.exec("ALTER TABLE DATA_Rezervasyon ADD COLUMN paymentMethod TEXT DEFAULT 'Nakit'");
        } catch {}
      },
    },
    {
      version: 5,
      name: "005_venue_address_manager_personnel",
      up: (d: Database.Database) => {
        try { d.exec("ALTER TABLE TANIM_Mekan ADD COLUMN address TEXT DEFAULT ''"); } catch {}
        try { d.exec("ALTER TABLE TANIM_Mekan ADD COLUMN mapUrl TEXT DEFAULT ''"); } catch {}
        try { d.exec("ALTER TABLE TANIM_Mekan ADD COLUMN managerName TEXT DEFAULT ''"); } catch {}
        try { d.exec("ALTER TABLE TANIM_Mekan ADD COLUMN managerPhone TEXT DEFAULT ''"); } catch {}
        try { d.exec("ALTER TABLE TANIM_Mekan ADD COLUMN managerTitle TEXT DEFAULT ''"); } catch {}
        try {
          d.exec(`
            CREATE TABLE IF NOT EXISTS TANIM_Personel (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              title TEXT DEFAULT 'Tesis Sorumlusu',
              phone TEXT DEFAULT '',
              email TEXT DEFAULT '',
              notes TEXT DEFAULT ''
            );
          `);
        } catch {}
      },
    },
  ];

  for (const m of migrations) {
    if (!appliedVersions.has(m.version)) {
      database.transaction(() => {
        m.up(database);
        database
          .prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)")
          .run(m.version, m.name, new Date().toISOString());
      })();
    }
  }
}

function saveWorkspaceIfActive() {
  try {
    workspaceManager.save();
  } catch {}
}

export function getCurrentDbPath(): string | null {
  return currentDbPath;
}

export function getPersonnelList(): Personnel[] {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (!db) return [];
  try {
    const rows = db.prepare("SELECT * FROM TANIM_Personel").all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.title || "Tesis Sorumlusu",
      phone: r.phone || "",
      email: r.email || "",
      notes: r.notes || "",
    }));
  } catch {
    return [];
  }
}

export function addPersonnel(personnel: { name: string; title?: string; phone?: string; email?: string; notes?: string }): Personnel {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  const newId = uid();
  db!.prepare(
    "INSERT INTO TANIM_Personel (id, name, title, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    newId,
    personnel.name,
    personnel.title || "Tesis Sorumlusu",
    personnel.phone || "",
    personnel.email || "",
    personnel.notes || ""
  );
  saveWorkspaceIfActive();
  return { id: newId, ...personnel };
}

export function deletePersonnel(id: string): { success: boolean } {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  db!.prepare("DELETE FROM TANIM_Personel WHERE id = ?").run(id);
  saveWorkspaceIfActive();
  return { success: true };
}

export function getStoreData(): StoreData {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (!db) return { venues: [], reservations: [], personnel: [] };

  const rawVenues = db.prepare("SELECT * FROM TANIM_Mekan WHERE isDeleted = 0").all() as any[];
  const rawHalls = db.prepare("SELECT * FROM halls").all() as any[];
  const rawReservations = db.prepare("SELECT * FROM reservations").all() as any[];
  const personnel = getPersonnelList();

  const venues: Venue[] = rawVenues.map((v) => ({
    id: v.id,
    name: v.name,
    district: v.district,
    category: v.category,
    address: v.address || "",
    mapUrl: v.mapUrl || "",
    managerName: v.managerName || "",
    managerPhone: v.managerPhone || "",
    managerTitle: v.managerTitle || "",
    color: v.color || "#6366f1",
    halls: rawHalls
      .filter((h) => h.venue_id === v.id)
      .map((h) => ({
        id: h.id,
        venueId: h.venue_id,
        name: h.name,
        floor: h.floor,
        capacity: h.capacity,
        hourlyPrice: h.hourly_price,
        color: h.color || "#8b5cf6",
      })),
  }));

  const reservations: Reservation[] = rawReservations.map((r) => ({
    id: r.id,
    venueId: r.venue_id,
    hallId: r.hall_id,
    date: r.date,
    start: r.start_time,
    end: r.end_time,
    customer: r.customer,
    phone: r.phone,
    eventType: r.event_type || "Genel Etkinlik",
    price: r.price,
    paid: r.paid,
    note: r.note || "",
    decisionInfo: r.decision_info || r.decisionInfo || "",
    status: r.status || "confirmed",
    receiptNo: r.receipt_no || r.receiptNo || "",
    paymentMethod: r.payment_method || r.paymentMethod || "Nakit",
  }));

  return { venues, reservations, personnel };
}

export function addVenue(venueData: {
  name: string;
  district: string;
  category?: string;
  address?: string;
  mapUrl?: string;
  managerName?: string;
  managerPhone?: string;
  managerTitle?: string;
  color?: string;
}): Venue {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  const newId = uid();
  db!.prepare(
    "INSERT INTO TANIM_Mekan (id, name, district, category, address, mapUrl, managerName, managerPhone, managerTitle, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    newId,
    venueData.name,
    venueData.district,
    venueData.category || "Genel",
    venueData.address || "",
    venueData.mapUrl || "",
    venueData.managerName || "",
    venueData.managerPhone || "",
    venueData.managerTitle || "",
    venueData.color || "#6366f1"
  );
  saveWorkspaceIfActive();
  return { id: newId, ...venueData, halls: [] };
}

export function deleteVenue(venueId: string): { success: boolean; error?: string } {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  
  // Check foreign key dependencies
  const hallCount = (db!.prepare("SELECT COUNT(*) as count FROM halls WHERE venue_id = ?").get(venueId) as any).count;
  const resCount = (db!.prepare("SELECT COUNT(*) as count FROM reservations WHERE venue_id = ?").get(venueId) as any).count;

  if (hallCount > 0 || resCount > 0) {
    return {
      success: false,
      error: `Bu mekana ait ${hallCount} salon ve ${resCount} kayıtlı etkinlik bulunmaktadır. Önce mekana bağlı salon ve etkinlikleri temizlemelisiniz!`,
    };
  }

  db!.prepare("DELETE FROM venues WHERE id = ?").run(venueId);
  saveWorkspaceIfActive();
  return { success: true };
}

export function addHall(venueId: string, hall: { name: string; floor: string; capacity: number; hourlyPrice: number; color?: string }): Hall {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  const newId = uid();
  db!.prepare("INSERT INTO TANIM_Salon (id, venueId, name, floor, capacity, hourlyPrice, color) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    newId,
    venueId,
    hall.name,
    hall.floor || "Zemin Kat",
    hall.capacity || 100,
    hall.hourlyPrice || 0,
    hall.color || "#8b5cf6"
  );
  saveWorkspaceIfActive();
  return { id: newId, venueId, ...hall };
}

export function deleteHall(venueId: string, hallId: string): { success: boolean; error?: string } {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  
  // Check foreign key dependencies
  const resCount = (db!.prepare("SELECT COUNT(*) as count FROM reservations WHERE hall_id = ?").get(hallId) as any).count;

  if (resCount > 0) {
    return {
      success: false,
      error: `Bu salona kayıtlı ${resCount} aktif etkinlik rezervasyonu bulunmaktadır. Önce salona bağlı etkinlikleri silmelisiniz!`,
    };
  }

  db!.prepare("DELETE FROM halls WHERE id = ?").run(hallId);
  saveWorkspaceIfActive();
  return { success: true };
}

function toMin(t: string) {
  if (t === "24:00") return 24 * 60;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function overlaps(aS: string, aE: string, bS: string, bE: string) {
  let aEnd = toMin(aE);
  if (aEnd === 0 && toMin(aS) > 0) aEnd = 24 * 60;
  let bEnd = toMin(bE);
  if (bEnd === 0 && toMin(bS) > 0) bEnd = 24 * 60;
  return toMin(aS) < bEnd && toMin(bS) < aEnd;
}

export function addReservation(res: {
  venueId: string;
  hallId: string;
  date: string;
  start: string;
  end: string;
  customer: string;
  phone: string;
  eventType: string;
  price: number;
  paid: number;
  note?: string;
  decisionInfo?: string;
  status?: string;
  receiptNo?: string;
  paymentMethod?: string;
}): { success: boolean; id?: string; error?: string } {
  if (!db && currentDbPath) initDatabase(currentDbPath);

  // Check clash
  const existing = db!.prepare("SELECT start_time, end_time FROM reservations WHERE hall_id = ? AND date = ?").all(res.hallId, res.date) as any[];
  const clash = existing.some((x) => overlaps(res.start, res.end, x.start_time, x.end_time));

  if (clash) {
    return { success: false, error: "Seçilen tarih ve saat aralığında bu salonda çakışan başka bir etkinlik var!" };
  }

  const newId = uid();
  db!.prepare(
    "INSERT INTO DATA_Rezervasyon (id, venueId, hallId, date, startTime, endTime, customer, phone, eventType, price, paid, note, decisionInfo, status, receiptNo, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    newId,
    res.venueId,
    res.hallId,
    res.date,
    res.start,
    res.end,
    res.customer,
    res.phone,
    res.eventType || "Genel Etkinlik",
    res.price,
    res.paid || 0,
    res.note || "",
    res.decisionInfo || "",
    res.status || "confirmed",
    res.receiptNo || "",
    res.paymentMethod || "Nakit"
  );
  saveWorkspaceIfActive();

  return { success: true, id: newId };
}

export function updateReservationStatus(id: string, status: string): void {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  db!.prepare("UPDATE DATA_Rezervasyon SET status = ? WHERE id = ?").run(status, id);
  saveWorkspaceIfActive();
}

export function updateReservationDetails(id: string, details: { receiptNo?: string; paymentMethod?: string; paid?: number; status?: string; note?: string }): void {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (details.receiptNo !== undefined) {
    db!.prepare("UPDATE DATA_Rezervasyon SET receiptNo = ? WHERE id = ?").run(details.receiptNo, id);
  }
  if (details.paymentMethod !== undefined) {
    db!.prepare("UPDATE DATA_Rezervasyon SET paymentMethod = ? WHERE id = ?").run(details.paymentMethod, id);
  }
  if (details.paid !== undefined) {
    db!.prepare("UPDATE DATA_Rezervasyon SET paid = ? WHERE id = ?").run(details.paid, id);
  }
  if (details.status !== undefined) {
    db!.prepare("UPDATE DATA_Rezervasyon SET status = ? WHERE id = ?").run(details.status, id);
  }
  if (details.note !== undefined) {
    db!.prepare("UPDATE DATA_Rezervasyon SET note = ? WHERE id = ?").run(details.note, id);
  }
  saveWorkspaceIfActive();
}

export function deleteReservation(id: string): { success: boolean } {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  db!.prepare("DELETE FROM reservations WHERE id = ?").run(id);
  saveWorkspaceIfActive();
  return { success: true };
}

export function updatePaid(id: string, paid: number) {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  db!.prepare("UPDATE reservations SET paid = ? WHERE id = ?").run(paid, id);
  saveWorkspaceIfActive();
}

export function getSetting(key: string): string | null {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (!db) return null;
  try {
    const row = db.prepare("SELECT value FROM TANIM_Ayar WHERE key = ?").get(key) as { value: string } | undefined;
    return row ? row.value : null;
  } catch {
    return null;
  }
}

export function setSetting(key: string, value: string): void {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (!db) return;
  db.prepare("INSERT OR REPLACE INTO TANIM_Ayar (key, value) VALUES (?, ?)").run(key, value);
  saveWorkspaceIfActive();
}

export function getAllSettings(): Record<string, string> {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (!db) return {};
  try {
    const rows = db.prepare("SELECT key, value FROM TANIM_Ayar").all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return settings;
  } catch {
    return {};
  }
}

