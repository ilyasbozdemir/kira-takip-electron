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

export type Venue = {
  id: string;
  name: string;
  district: string;
  category?: string;
  halls: Hall[];
};

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
};

export type StoreData = {
  venues: Venue[];
  reservations: Reservation[];
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
  } catch {
    db = new Database(targetPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchemaDatabase(db);
    runMigrations(db);
  }

  return targetPath;
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
        d.exec(`
          CREATE INDEX IF NOT EXISTS idx_reservations_hall_date ON reservations(hall_id, date);
          CREATE INDEX IF NOT EXISTS idx_reservations_venue_date ON reservations(venue_id, date);
          CREATE INDEX IF NOT EXISTS idx_halls_venue ON halls(venue_id);
        `);
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

export function getStoreData(): StoreData {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  if (!db) return { venues: [], reservations: [] };

  const rawVenues = db.prepare("SELECT * FROM venues").all() as any[];
  const rawHalls = db.prepare("SELECT * FROM halls").all() as any[];
  const rawReservations = db.prepare("SELECT * FROM reservations").all() as any[];

  const venues: Venue[] = rawVenues.map((v) => ({
    id: v.id,
    name: v.name,
    district: v.district,
    category: v.category,
    halls: rawHalls
      .filter((h) => h.venue_id === v.id)
      .map((h) => ({
        id: h.id,
        venueId: h.venue_id,
        name: h.name,
        floor: h.floor,
        capacity: h.capacity,
        hourlyPrice: h.hourly_price,
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
  }));

  return { venues, reservations };
}

export function addVenue(name: string, district: string, category: string = "Genel"): Venue {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  const newId = uid();
  db!.prepare("INSERT INTO venues (id, name, district, category) VALUES (?, ?, ?, ?)").run(newId, name, district, category);
  saveWorkspaceIfActive();
  return { id: newId, name, district, category, halls: [] };
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

export function addHall(venueId: string, hall: { name: string; floor: string; capacity: number; hourlyPrice: number }): Hall {
  if (!db && currentDbPath) initDatabase(currentDbPath);
  const newId = uid();
  db!.prepare("INSERT INTO halls (id, venue_id, name, floor, capacity, hourly_price) VALUES (?, ?, ?, ?, ?, ?)").run(
    newId,
    venueId,
    hall.name,
    hall.floor || "Zemin Kat",
    hall.capacity || 100,
    hall.hourlyPrice || 0
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
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function overlaps(aS: string, aE: string, bS: string, bE: string) {
  return toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE);
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
    "INSERT INTO reservations (id, venue_id, hall_id, date, start_time, end_time, customer, phone, event_type, price, paid, note, decision_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
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
    res.decisionInfo || ""
  );
  saveWorkspaceIfActive();

  return { success: true, id: newId };
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
