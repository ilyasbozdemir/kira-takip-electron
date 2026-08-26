import type Database from 'better-sqlite3'
import { defineTable } from './BaseTable'
import { TableSchema } from './types'

export const TablePrefixLogic = {
  DATA: 'OPERASYONEL SÜREÇLER VE DOSYALAR (Rezervasyonlar, Ödemeler, Sözleşmeler)',
  TANIM: 'SİSTEM AYARLARI VE KONFİGÜRASYON (Mekanlar, Salonlar, Etkinlik Türleri)',
  LOG: 'SİSTEM LOGLARI VE KULLANICI HAREKETLERİ'
}

// 🏛️ Kozmik Tablo Tanımları (BaseTable & defineTable Mimarisi)
export const TANIM_MekanSchema: TableSchema = defineTable({
  name: 'TANIM_Mekan',
  description: 'Mekan ve Tesis Tanımları',
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'name', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'district', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'category', type: 'TEXT', defaultValue: "'Genel'" }
  ]
})

export const TANIM_SalonSchema: TableSchema = defineTable({
  name: 'TANIM_Salon',
  description: 'Mekan Salon ve Alan Tanımları',
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'venueId', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES TANIM_Mekan(id) ON DELETE RESTRICT'] },
    { name: 'name', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'floor', type: 'TEXT', defaultValue: "'Zemin Kat'" },
    { name: 'capacity', type: 'INTEGER', defaultValue: '100' },
    { name: 'hourlyPrice', type: 'REAL', defaultValue: '0' }
  ],
  indexes: [
    { columns: ['venueId'] }
  ]
})

export const DATA_RezervasyonSchema: TableSchema = defineTable({
  name: 'DATA_Rezervasyon',
  description: 'Etkinlik ve Salon Rezervasyon Kayıtları',
  columns: [
    { name: 'id', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'venueId', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES TANIM_Mekan(id) ON DELETE RESTRICT'] },
    { name: 'hallId', type: 'TEXT', constraints: ['NOT NULL', 'REFERENCES TANIM_Salon(id) ON DELETE RESTRICT'] },
    { name: 'date', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'startTime', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'endTime', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'customer', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'phone', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'eventType', type: 'TEXT', defaultValue: "'Genel Etkinlik'" },
    { name: 'price', type: 'REAL', defaultValue: '0' },
    { name: 'paid', type: 'REAL', defaultValue: '0' },
    { name: 'note', type: 'TEXT' },
    { name: 'decisionInfo', type: 'TEXT', defaultValue: "''" }
  ],
  indexes: [
    { columns: ['hallId', 'date'] },
    { columns: ['venueId', 'date'] }
  ]
})

export const TANIM_AyarSchema: TableSchema = defineTable({
  name: 'TANIM_Ayar',
  description: 'Sistem ve Proje Konfigürasyon Ayarları',
  hasAudit: false,
  columns: [
    { name: 'key', type: 'TEXT', constraints: ['PRIMARY KEY'] },
    { name: 'value', type: 'TEXT', constraints: ['NOT NULL'] }
  ]
})

export const LOG_HareketSchema: TableSchema = defineTable({
  name: 'LOG_Hareket',
  description: 'Sistem Logları ve Kullanıcı Hareketleri',
  hasAudit: false,
  columns: [
    { name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY AUTOINCREMENT'] },
    { name: 'action', type: 'TEXT', constraints: ['NOT NULL'] },
    { name: 'details', type: 'TEXT' },
    { name: 'createdAt', type: 'DATETIME', constraints: ["DEFAULT CURRENT_TIMESTAMP"] }
  ]
})

export const schema = {
  TANIM_Mekan: TANIM_MekanSchema,
  TANIM_Salon: TANIM_SalonSchema,
  DATA_Rezervasyon: DATA_RezervasyonSchema,
  TANIM_Ayar: TANIM_AyarSchema,
  LOG_Hareket: LOG_HareketSchema
}

export function buildCreateTableSQL(tableSchema: TableSchema): string[] {
  const columnDefs = tableSchema.columns.map((col) => {
    let def = `"${col.name}" ${col.type}`
    if (col.defaultValue !== undefined) {
      def += ` DEFAULT ${col.defaultValue}`
    }
    if (col.constraints && col.constraints.length > 0) {
      def += ` ${col.constraints.join(' ')}`
    }
    return def
  })

  const sqls: string[] = []
  sqls.push(`CREATE TABLE IF NOT EXISTS "${tableSchema.name}" (\n  ${columnDefs.join(',\n  ')}\n);`)

  if (tableSchema.indexes) {
    tableSchema.indexes.forEach((idx) => {
      const idxName = idx.name || `idx_${tableSchema.name.toLowerCase()}_${idx.columns.join('_')}`
      const uniqueStr = idx.unique ? 'UNIQUE ' : ''
      const colsStr = idx.columns.map((c) => `"${c}"`).join(', ')
      sqls.push(`CREATE ${uniqueStr}INDEX IF NOT EXISTS "${idxName}" ON "${tableSchema.name}" (${colsStr});`)
    })
  }

  return sqls
}

export function initializeDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `)

  // Execute Table Schemas via SQL Generator
  const allSchemas = [TANIM_MekanSchema, TANIM_SalonSchema, DATA_RezervasyonSchema, TANIM_AyarSchema, LOG_HareketSchema]
  db.transaction(() => {
    for (const s of allSchemas) {
      const statements = buildCreateTableSQL(s)
      for (const sql of statements) {
        db.exec(sql)
      }
    }

    // Legacy Compatibility Views & Indexes
    db.exec(`
      CREATE VIEW IF NOT EXISTS venues AS 
      SELECT id, name, district, category FROM TANIM_Mekan WHERE isDeleted = 0;

      CREATE VIEW IF NOT EXISTS halls AS 
      SELECT id, venueId AS venue_id, name, floor, capacity, hourlyPrice AS hourly_price FROM TANIM_Salon WHERE isDeleted = 0;

      CREATE VIEW IF NOT EXISTS reservations AS 
      SELECT id, venueId AS venue_id, hallId AS hall_id, date, startTime AS start_time, endTime AS end_time, customer, phone, eventType AS event_type, price, paid, note FROM DATA_Rezervasyon WHERE isDeleted = 0;

      CREATE VIEW IF NOT EXISTS settings AS 
      SELECT key, value FROM TANIM_Ayar;
    `)

    // Insert Default Metadata & meta.json Specification
    const stmt = db.prepare("INSERT OR REPLACE INTO TANIM_Ayar (key, value) VALUES (?, ?)")
    stmt.run("app_name", "VenueKeeper App Pro")
    stmt.run("file_format", ".vke")
    stmt.run("file_format_version", "2.0")
    stmt.run("schema_version", "5")
    stmt.run("created_at", new Date().toISOString())

    const metaJson = JSON.stringify({
      dtal_version: "1.0",
      app_version: "2.4.0",
      schema_version: 5,
      file_version: 12,
      institution: "Ankara İl Milli Eğitim Müdürlüğü",
      active_db_file: "VenueKeeper.vke",
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
      platform: process.platform || "win32",
      integrity_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      warnings: []
    })
    stmt.run("meta.json", metaJson)
  })()
}
