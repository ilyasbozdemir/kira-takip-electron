import AdmZip from "adm-zip";
import Database from "better-sqlite3";
import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { initializeDatabase } from "./index";

export interface WorkspaceMeta {
  dtal_version: string;
  app_version: string;
  created_at: string;
  institution: string;
  schema_version: number;
  platform: string;
  file_version: number;
  active_db_file?: string;
  updated_at?: string;
  integrity_hash?: string;
  warnings?: string[];
}

export const CURRENT_SCHEMA_VERSION = 5;

export function calculateIntegrityHash(meta: Partial<WorkspaceMeta>): string {
  const payload = {
    dtal_version: meta.dtal_version,
    app_version: meta.app_version,
    schema_version: meta.schema_version,
    created_at: meta.created_at,
    institution: meta.institution,
    platform: meta.platform,
  };
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function normalizeMeta(raw: any): WorkspaceMeta {
  return {
    dtal_version: raw.dtal_version || raw.dtm_version || "1.0",
    app_version: raw.app_version || raw.version || "2.4.0",
    created_at:
      raw.created_at ||
      (raw.createdAt ? raw.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
    institution: raw.institution || raw.institutionName || "Ankara İl Milli Eğitim Müdürlüğü",
    schema_version: parseInt(raw.schema_version || raw.schemaVersion || "5", 10) || 5,
    platform: raw.platform || process.platform || "win32",
    file_version: raw.file_version || parseInt(raw.fileVersion || "12", 10) || 12,
    active_db_file: raw.active_db_file || "database.sqlite",
    updated_at: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    integrity_hash: raw.integrity_hash,
    warnings: [],
  };
}

export function ensureSchemaIntegrity(db: Database.Database): void {
  try {
    initializeDatabase(db);
  } catch (err: any) {
    console.error("[Schema Self-Healing] Error running initializeDatabase:", err.message);
  }
}

export class DtmWorkspace {
  private tempDir: string;
  private db: Database.Database | null = null;
  private currentFilePath: string | null = null;
  private meta: WorkspaceMeta | null = null;

  constructor() {
    this.tempDir = path.join(app.getPath("userData"), "dtm_temp", Date.now().toString());
  }

  public openWorkspace(filePath: string, _allowMigration: boolean = false): WorkspaceMeta {
    const lockPath = filePath + ".lock";
    if (fs.existsSync(lockPath)) {
      try {
        const pidStr = fs.readFileSync(lockPath, "utf-8");
        const pid = parseInt(pidStr, 10);
        if (!isNaN(pid) && pid !== process.pid) {
          let isRunning = false;
          try {
            process.kill(pid, 0);
            isRunning = true;
          } catch {
            isRunning = false;
          }
          if (!isRunning) {
            fs.unlinkSync(lockPath);
          } else {
            throw new Error(
              "LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız."
            );
          }
        } else if (isNaN(pid)) {
          throw new Error(
            "LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda. Çakışmayı önlemek için önce diğer taraftan kapatmalısınız."
          );
        }
      } catch (err: any) {
        if (err.message.startsWith("LOCKED|")) throw err;
        throw new Error(
          "LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda."
        );
      }
    }

    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: "utf-8" });
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`);
    }

    this.currentFilePath = filePath;
    this.ensureTempDir();

    // Check if it is a raw SQLite file or ZIP .vke package
    let isZip = false;
    try {
      const zipBuffer = fs.readFileSync(filePath);
      if (zipBuffer.length === 0) {
        if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
        return this.createWorkspace(filePath, "Ankara İl Milli Eğitim Müdürlüğü");
      }
      const zip = new AdmZip(zipBuffer);
      zip.extractAllTo(this.tempDir, true);
      isZip = true;
    } catch {
      isZip = false;
    }

    if (!isZip) {
      // Direct SQLite file opening fallback (.vke / .sqlite)
      const dbPath = path.join(this.tempDir, "database.sqlite");
      fs.copyFileSync(filePath, dbPath);
      this.db = new Database(dbPath);
      this.db.pragma("journal_mode = WAL");
      this.db.pragma("foreign_keys = ON");
      ensureSchemaIntegrity(this.db);

      const meta: WorkspaceMeta = {
        dtal_version: "1.0",
        app_version: app.getVersion() || "2.4.0",
        created_at: new Date().toISOString().split("T")[0],
        institution: "Ankara İl Milli Eğitim Müdürlüğü",
        schema_version: CURRENT_SCHEMA_VERSION,
        platform: process.platform || "win32",
        file_version: 12,
        active_db_file: "database.sqlite",
        updated_at: new Date().toISOString(),
        warnings: [],
      };
      meta.integrity_hash = calculateIntegrityHash(meta);
      this.meta = meta;

      const metaPath = path.join(this.tempDir, "meta.json");
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      return meta;
    }

    const metaPath = path.join(this.tempDir, "meta.json");
    let rawMeta: any = {};
    if (fs.existsSync(metaPath)) {
      const rawMetaContent = fs.readFileSync(metaPath, "utf-8");
      rawMeta = JSON.parse(rawMetaContent);
    } else {
      rawMeta = {
        dtal_version: "1.0",
        app_version: "2.4.0",
        schema_version: 5,
        file_version: 12,
        institution: "Ankara İl Milli Eğitim Müdürlüğü",
        active_db_file: "database.sqlite",
      };
    }

    const meta = normalizeMeta(rawMeta);

    const dbFileName = meta.active_db_file || "database.sqlite";
    const dbPath = path.join(this.tempDir, dbFileName);
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    ensureSchemaIntegrity(this.db);

    this.meta = meta;
    return meta;
  }

  public createWorkspace(filePath: string, institutionName: string): WorkspaceMeta {
    const lockPath = filePath + ".lock";
    if (fs.existsSync(lockPath)) {
      throw new Error("LOCKED|Bu dosya şu anda başka bir pencerede veya programda açık durumda.");
    }

    try {
      fs.writeFileSync(lockPath, process.pid.toString(), { encoding: "utf-8" });
    } catch (err: any) {
      throw new Error(`Kilit dosyası oluşturulamadı: ${err.message}`);
    }

    this.currentFilePath = filePath;
    this.ensureTempDir();

    const dbPath = path.join(this.tempDir, "database.sqlite");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    initializeDatabase(this.db);

    const meta: WorkspaceMeta = {
      dtal_version: "1.0",
      app_version: app.getVersion() || "2.4.0",
      created_at: new Date().toISOString().split("T")[0],
      institution: institutionName || "Ankara İl Milli Eğitim Müdürlüğü",
      schema_version: CURRENT_SCHEMA_VERSION,
      platform: process.platform || "win32",
      file_version: 12,
      active_db_file: "database.sqlite",
      updated_at: new Date().toISOString(),
      warnings: [],
    };
    meta.integrity_hash = calculateIntegrityHash(meta);

    const metaPath = path.join(this.tempDir, "meta.json");
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    const attachmentsDir = path.join(this.tempDir, "attachments");
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true });
    }

    this.saveWorkspace();

    this.meta = meta;
    return meta;
  }

  public saveWorkspace(): void {
    if (!this.currentFilePath || !this.db) {
      throw new Error("Hiçbir veri dosyası açık değil.");
    }

    try {
      this.db.pragma("wal_checkpoint(TRUNCATE)");
    } catch (err) {
      console.error("WAL Checkpoint failed:", err);
    }

    const metaPath = path.join(this.tempDir, "meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as WorkspaceMeta;
        meta.updated_at = new Date().toISOString();
        meta.app_version = app.getVersion() || "2.4.0";
        meta.platform = process.platform;
        meta.integrity_hash = calculateIntegrityHash(meta);
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        this.meta = meta;
      } catch {}
    }

    try {
      const zip = new AdmZip();
      zip.addLocalFolder(this.tempDir);
      zip.writeZip(this.currentFilePath);
    } catch (zipErr: any) {
      // If saving as ZIP fails, fall back to direct file copy of database.sqlite to currentFilePath
      const dbFileName = this.meta?.active_db_file || "database.sqlite";
      const dbPath = path.join(this.tempDir, dbFileName);
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, this.currentFilePath);
      }
    }
  }

  public closeWorkspace(): void {
    if (this.db) {
      try {
        this.db.close();
      } catch {}
      this.db = null;
    }

    if (this.currentFilePath) {
      const lockPath = this.currentFilePath + ".lock";
      if (fs.existsSync(lockPath)) {
        try {
          fs.unlinkSync(lockPath);
        } catch {}
      }
    }

    this.currentFilePath = null;
    this.meta = null;

    if (fs.existsSync(this.tempDir)) {
      try {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      } catch {}
    }
  }

  public replaceDatabase(sourceSqlitePath: string): void {
    if (!this.currentFilePath || !this.db || !this.meta) {
      throw new Error("Açık bir çalışma alanı yok.");
    }

    this.db.close();

    const newDbName = `database_${Date.now()}.sqlite`;
    const dbPath = path.join(this.tempDir, newDbName);
    fs.copyFileSync(sourceSqlitePath, dbPath);

    this.meta.active_db_file = newDbName;

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    ensureSchemaIntegrity(this.db);
    this.saveWorkspace();
  }

  public getDb(): Database.Database {
    if (!this.db) throw new Error("Veritabanı bağlı değil.");
    return this.db;
  }

  public getDbPath(): string {
    if (!this.tempDir) throw new Error("Geçici dizin yok.");
    const dbFileName = this.meta?.active_db_file || "database.sqlite";
    return path.join(this.tempDir, dbFileName);
  }

  public getMeta(): WorkspaceMeta | null {
    return this.meta;
  }

  public getCurrentFilePath(): string | null {
    return this.currentFilePath;
  }

  private ensureTempDir() {
    if (fs.existsSync(this.tempDir)) {
      try {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      } catch {}
    }
    fs.mkdirSync(this.tempDir, { recursive: true });
  }
}

let activeWorkspace: DtmWorkspace | null = null;

export const workspaceManager = {
  create: (filePath: string, institutionName: string) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace();
    activeWorkspace = new DtmWorkspace();
    return activeWorkspace.createWorkspace(filePath, institutionName);
  },
  open: (filePath: string, allowMigration: boolean = false) => {
    if (activeWorkspace) activeWorkspace.closeWorkspace();
    activeWorkspace = new DtmWorkspace();
    return activeWorkspace.openWorkspace(filePath, allowMigration);
  },
  save: () => {
    if (activeWorkspace) activeWorkspace.saveWorkspace();
  },
  close: () => {
    if (activeWorkspace) {
      activeWorkspace.closeWorkspace();
      activeWorkspace = null;
    }
  },
  getDb: () => {
    if (!activeWorkspace) throw new Error("Açık bir veri dosyası yok.");
    return activeWorkspace.getDb();
  },
  getMeta: () => {
    if (!activeWorkspace) return null;
    return activeWorkspace.getMeta();
  },
  getCurrentFilePath: () => {
    if (!activeWorkspace) return null;
    return activeWorkspace.getCurrentFilePath();
  },
  getDbPath: () => {
    if (!activeWorkspace) throw new Error("Açık bir çalışma dosyası yok.");
    return activeWorkspace.getDbPath();
  },
  replaceDatabase: (sourceSqlitePath: string) => {
    if (!activeWorkspace) throw new Error("Açık bir çalışma dosyası yok.");
    activeWorkspace.replaceDatabase(sourceSqlitePath);
  },
};

process.on("exit", () => {
  if (activeWorkspace) {
    try {
      activeWorkspace.closeWorkspace();
    } catch {}
  }
});
