import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import pkg from "electron-updater";
import {
  initDatabase,
  getStoreData,
  addVenue,
  deleteVenue,
  addHall,
  deleteHall,
  addReservation,
  deleteReservation,
  updatePaid,
  getCurrentDbPath,
  getSetting,
  setSetting,
  getAllSettings,
  updateReservationStatus,
  updateReservationDetails,
  getPersonnelList,
  addPersonnel,
  deletePersonnel,
} from "./database";
import { workspaceManager } from "./database/workspace";

const { autoUpdater } = pkg;

const _dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

process.env.DIST = path.join(_dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(_dirname, "../public");

let win: BrowserWindow | null = null;
let openedFilePath: string | null = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();

      const filePath = extractFilePathFromArgs(commandLine);
      if (filePath) {
        openedFilePath = filePath;
        initDatabase(filePath);
        win.webContents.send("db-updated");
      }
    }
  });

  app.whenReady().then(() => {
    // Initial DB init
    const initialFilePath = extractFilePathFromArgs(process.argv);
    if (initialFilePath) {
      openedFilePath = initialFilePath;
      initDatabase(initialFilePath);
    } else {
      const defaultDbPath = path.join(app.getPath("userData"), "venuekeeper-default.vke");
      if (!fs.existsSync(defaultDbPath)) {
        try {
          workspaceManager.create(defaultDbPath, "Mekan & Tesis Yönetimi");
        } catch {}
      }
      openedFilePath = defaultDbPath;
      initDatabase(defaultDbPath);
    }

    createWindow();
    buildAppMenu();
    initAutoUpdater();
  });
}

function extractFilePathFromArgs(args: string[]): string | null {
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (
      arg &&
      !arg.startsWith("-") &&
      fs.existsSync(arg) &&
      (arg.endsWith(".vke") || arg.endsWith(".evrak") || arg.endsWith(".sqlite") || arg.endsWith(".db"))
    ) {
      return path.resolve(arg);
    }
  }
  return null;
}

function createWindow() {
  win = new BrowserWindow({
    title: "VenueKeeper App Pro - Mekan, Salon ve Etkinlik Yönetim Sistemi",
    icon: path.join(process.env.VITE_PUBLIC || "", "app-logo.png"),
    width: 1350,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    webPreferences: {
      preload: path.join(_dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
  });

  win.webContents.on("before-input-event", (event, input) => {
    if ((input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) && input.type === "keyDown") {
      win?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }

  win.webContents.on("did-finish-load", () => {
    if (openedFilePath) {
      win?.webContents.send("file-opened", openedFilePath);
    }
  });

  win.on("closed", () => {
    win = null;
  });
}

function buildAppMenu() {
  const template: any[] = [
    {
      label: "Dosya",
      submenu: [
        {
          label: "Yeni Veritabanı Projesi (.vke)",
          accelerator: "CmdOrCtrl+N",
          click: async () => {
            if (!win) return;
            const res = await dialog.showSaveDialog(win, {
              title: "Yeni VenueKeeper Pro SQLite Veritabanı Oluştur",
              defaultPath: "venuekeeper-proje.vke",
              filters: [
                { name: "VenueKeeper Veritabanı (*.vke)", extensions: ["vke"] },
                { name: "SQLite Veritabanı (*.db)", extensions: ["db"] },
              ],
            });
            if (!res.canceled && res.filePath) {
              initDatabase(res.filePath);
              openedFilePath = res.filePath;
              win.webContents.send("file-opened", res.filePath);
              win.webContents.send("db-updated");
            }
          },
        },
        {
          label: "Veritabanı Dosyası Aç...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            if (!win) return;
            const res = await dialog.showOpenDialog(win, {
              title: "VenueKeeper Veritabanı Dosyası Aç",
              filters: [
                { name: "VenueKeeper Dosyası (*.vke, *.db)", extensions: ["vke", "db", "sqlite"] },
                { name: "Tüm Dosyalar", extensions: ["*"] },
              ],
              properties: ["openFile"],
            });
            if (!res.canceled && res.filePaths.length > 0) {
              const filePath = res.filePaths[0];
              initDatabase(filePath);
              openedFilePath = filePath;
              win.webContents.send("file-opened", filePath);
              win.webContents.send("db-updated");
            }
          },
        },
        { type: "separator" },
        {
          label: "Çıkış",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Düzen",
      submenu: [
        { label: "Geri Al", role: "undo" },
        { label: "Yinele", role: "redo" },
        { type: "separator" },
        { label: "Kes", role: "cut" },
        { label: "Kopyala", role: "copy" },
        { label: "Yapıştır", role: "paste" },
        { label: "Tümünü Seç", role: "selectAll" },
      ],
    },
    {
      label: "Görünüm",
      submenu: [
        { label: "Yeniden Yükle", role: "reload", accelerator: "F5" },
        { label: "Tam Ekran Yap", role: "togglefullscreen" },
        { type: "separator" },
        { label: "Geliştirici Araçları (F12)", role: "toggleDevTools", accelerator: "F12" },
      ],
    },
    {
      label: "Yardım",
      submenu: [
        {
          label: "VenueKeeper Pro Hakkında",
          click: () => {
            if (win) {
              dialog.showMessageBox(win, {
                type: "info",
                title: "VenueKeeper Pro",
                message: "VenueKeeper Pro — Mekan, Salon & Etkinlik Yönetim Sistemi",
                detail: "Sürüm: 1.0.0\nYerel SQLite Veritabanı Motoru\nTüm Hakları Saklıdır.",
              });
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on("open-file", (event, filePath) => {
  event.preventDefault();
  openedFilePath = filePath;
  initDatabase(filePath);
  if (win) {
    win.webContents.send("file-opened", filePath);
    win.webContents.send("db-updated");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/* ========================================================================== */
/* SQLITE & FILE IPC HANDLERS                                                */
/* ========================================================================== */

ipcMain.handle("db:get-current-path", () => {
  return getCurrentDbPath();
});

ipcMain.handle("db:get-store", () => {
  return getStoreData();
});

ipcMain.handle("db:add-venue", (_event, venueArg, district, category) => {
  if (typeof venueArg === "string") {
    return addVenue({ name: venueArg, district: district || "", category: category || "Genel" });
  }
  return addVenue(venueArg);
});

ipcMain.handle("db:get-personnel", () => {
  return getPersonnelList();
});

ipcMain.handle("db:add-personnel", (_event, p) => {
  return addPersonnel(p);
});

ipcMain.handle("db:delete-personnel", (_event, id: string) => {
  return deletePersonnel(id);
});

ipcMain.handle("db:delete-venue", (_event, venueId: string) => {
  return deleteVenue(venueId);
});

ipcMain.handle("db:add-hall", (_event, { venueId, hall }) => {
  return addHall(venueId, hall);
});

ipcMain.handle("db:delete-hall", (_event, { venueId, hallId }) => {
  return deleteHall(venueId, hallId);
});

ipcMain.handle("db:add-reservation", (_event, res) => {
  return addReservation(res);
});

ipcMain.handle("db:delete-reservation", (_event, id: string) => {
  deleteReservation(id);
  return true;
});

ipcMain.handle("db:update-paid", (_event, { id, paid }) => {
  updatePaid(id, paid);
  return true;
});

ipcMain.handle("db:update-reservation-status", (_event, { id, status }: { id: string; status: string }) => {
  updateReservationStatus(id, status);
  return true;
});

ipcMain.handle("db:update-reservation-details", (_event, { id, details }: { id: string; details: any }) => {
  updateReservationDetails(id, details);
  return true;
});

ipcMain.handle("db:get-setting", (_event, key: string) => {
  return getSetting(key);
});

ipcMain.handle("db:set-setting", (_event, { key, value }: { key: string; value: string }) => {
  setSetting(key, value);
  return true;
});

ipcMain.handle("db:get-all-settings", () => {
  return getAllSettings();
});

ipcMain.handle("db:switch-path", (_event, filePath: string) => {
  if (filePath && fs.existsSync(filePath)) {
    initDatabase(filePath);
    openedFilePath = filePath;
    if (win) {
      win.setTitle(`VenueKeeper App Pro - ${path.basename(filePath)}`);
      win.webContents.send("file-opened", filePath);
      win.webContents.send("db-updated");
    }
    return { success: true, path: filePath, store: getStoreData() };
  }
  return { success: false, error: "Dosya bulunamadı veya veritabanı açılamadı." };
});

// Window Controls IPCs
ipcMain.handle("win:minimize", () => {
  win?.minimize();
});

ipcMain.handle("win:maximize", () => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.handle("win:close", () => {
  win?.close();
});

ipcMain.handle("win:is-maximized", () => {
  return win?.isMaximized() ?? false;
});

// File dialog IPCs
ipcMain.handle("get-opened-file-path", () => {
  return openedFilePath;
});

ipcMain.handle("open-file-dialog", async () => {
  if (!win) return null;
  const result = await dialog.showOpenDialog(win, {
    title: "VenueKeeper Veritabanı Dosyası Aç",
    filters: [
      { name: "VenueKeeper Dosyaları (*.vke, *.evrak, *.db)", extensions: ["vke", "evrak", "db", "sqlite"] },
      { name: "Tüm Dosyalar", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  initDatabase(filePath);
  openedFilePath = filePath;
  win.setTitle(`VenueKeeper App Pro - ${path.basename(filePath)}`);
  win.webContents.send("file-opened", filePath);
  win.webContents.send("db-updated");
  return { filePath, content: JSON.stringify(getStoreData()) };
});

ipcMain.handle("save-file-dialog", async (_event, { defaultName }) => {
  if (!win) return null;
  const result = await dialog.showSaveDialog(win, {
    title: "Yeni VenueKeeper Veritabanı Kaydet",
    defaultPath: defaultName || "venuekeeper-proje.vke",
    filters: [{ name: "VenueKeeper Dosyası (*.vke)", extensions: ["vke"] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  initDatabase(result.filePath);
  openedFilePath = result.filePath;
  win.setTitle(`VenueKeeper App Pro - ${path.basename(result.filePath)}`);
  win.webContents.send("file-opened", result.filePath);
  win.webContents.send("db-updated");
  return result.filePath;
});

// SMTP Mail Sending IPC
ipcMain.handle("send-email", async (_event, { smtpConfig, mailData }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: smtpConfig.secure ?? false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${smtpConfig.senderName || "VenueKeeper Pro"}" <${smtpConfig.user}>`,
      to: mailData.to,
      subject: mailData.subject,
      text: mailData.text,
      html: mailData.html,
      attachments: mailData.attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    return { success: false, error: error.message || "Mail gönderimi başarısız oldu." };
  }
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("get-local-ip", () => {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch {}
  return "127.0.0.1";
});

ipcMain.handle("backup-database", () => {
  const currentPath = getCurrentDbPath();
  if (currentPath && fs.existsSync(currentPath)) {
    const backupDir = path.join(app.getPath("userData"), "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const destName = `backup_${path.basename(currentPath, ".vke")}_${timestamp}.vke`;
    const destPath = path.join(backupDir, destName);
    fs.copyFileSync(currentPath, destPath);
    return { success: true, path: destPath };
  }
  return { success: false, error: "Veritabanı dosyası bulunamadı." };
});

ipcMain.handle("open-external-link", (_event, url: string) => {
  shell.openExternal(url);
});

/* ========================================================================== */
/* AUTO-UPDATER                                                               */
/* ========================================================================== */

function initAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    win?.webContents.send("updater-status", { status: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    win?.webContents.send("updater-status", { status: "available", version: info.version });
  });

  autoUpdater.on("update-not-available", () => {
    win?.webContents.send("updater-status", { status: "not-available" });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    win?.webContents.send("updater-status", {
      status: "downloading",
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    win?.webContents.send("updater-status", { status: "downloaded", version: info.version });
  });

  autoUpdater.on("error", (err) => {
    win?.webContents.send("updater-status", { status: "error", error: err.message });
  });

  ipcMain.handle("check-for-updates", async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo;
    } catch (err: any) {
      return { error: err.message };
    }
  });

  ipcMain.handle("download-update", async () => {
    await autoUpdater.downloadUpdate();
    return true;
  });

  ipcMain.handle("quit-and-install", () => {
    autoUpdater.quitAndInstall();
  });
}
