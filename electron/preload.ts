import { contextBridge, ipcRenderer } from "electron";

export const electronAPI = {
  // SQLite Database IPCs
  db: {
    getCurrentPath: () => ipcRenderer.invoke("db:get-current-path"),
    getStore: () => ipcRenderer.invoke("db:get-store"),
    addVenue: (data: { name: string; district: string; category?: string; address?: string; mapUrl?: string; managerName?: string; managerPhone?: string; managerTitle?: string; color?: string }) =>
      ipcRenderer.invoke("db:add-venue", data),
    deleteVenue: (venueId: string) => ipcRenderer.invoke("db:delete-venue", venueId),
    addHall: (data: {
      venueId: string;
      hall: { name: string; floor: string; capacity: number; hourlyPrice: number; color?: string };
    }) => ipcRenderer.invoke("db:add-hall", data),
    deleteHall: (venueId: string, hallId: string) =>
      ipcRenderer.invoke("db:delete-hall", { venueId, hallId }),
    addReservation: (res: {
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
    }) => ipcRenderer.invoke("db:add-reservation", res),
    deleteReservation: (id: string) => ipcRenderer.invoke("db:delete-reservation", id),
    updatePaid: (id: string, paid: number) => ipcRenderer.invoke("db:update-paid", { id, paid }),
    updateReservationStatus: (id: string, status: string) => ipcRenderer.invoke("db:update-reservation-status", { id, status }),
    updateReservationDetails: (id: string, details: any) => ipcRenderer.invoke("db:update-reservation-details", { id, details }),
    switchDatabase: (filePath: string) => ipcRenderer.invoke("db:switch-path", filePath),
    getSetting: (key: string) => ipcRenderer.invoke("db:get-setting", key),
    setSetting: (key: string, value: string) => ipcRenderer.invoke("db:set-setting", { key, value }),
    getAllSettings: () => ipcRenderer.invoke("db:get-all-settings"),
    getPersonnel: () => ipcRenderer.invoke("db:get-personnel"),
    addPersonnel: (p: { name: string; title?: string; phone?: string; email?: string; notes?: string }) => ipcRenderer.invoke("db:add-personnel", p),
    deletePersonnel: (id: string) => ipcRenderer.invoke("db:delete-personnel", id),
  },

  // File & Custom Extension IPCs
  getOpenedFilePath: () => ipcRenderer.invoke("get-opened-file-path"),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  saveFileDialog: (data: { defaultName?: string }) => ipcRenderer.invoke("save-file-dialog", data),
  switchPath: (filePath?: string) => ipcRenderer.invoke("db:switch-path", filePath),

  onFileOpened: (callback: (filePath: string) => void) => {
    const subscription = (_event: any, filePath: string) => callback(filePath);
    ipcRenderer.on("file-opened", subscription);
    return () => ipcRenderer.removeListener("file-opened", subscription);
  },

  onDbUpdated: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("db-updated", subscription);
    return () => ipcRenderer.removeListener("db-updated", subscription);
  },

  // Mail IPC
  sendEmail: (data: {
    smtpConfig: {
      host: string;
      port: number;
      secure?: boolean;
      user: string;
      pass: string;
      senderName?: string;
    };
    mailData: {
      to: string;
      subject: string;
      text?: string;
      html?: string;
      attachments?: Array<{ filename: string; content: string; encoding?: string }>;
    };
  }) => ipcRenderer.invoke("send-email", data),

  // Auto Updater IPCs
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),
  onUpdaterStatus: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on("updater-status", subscription);
    return () => ipcRenderer.removeListener("updater-status", subscription);
  },

  // Utility & Window Controls IPCs
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getLocalIp: () => ipcRenderer.invoke("get-local-ip"),
  backupDatabase: () => ipcRenderer.invoke("backup-database"),
  openExternalLink: (url: string) => ipcRenderer.invoke("open-external-link", url),

  minimizeWindow: () => ipcRenderer.invoke("win:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("win:maximize"),
  closeWindow: () => ipcRenderer.invoke("win:close"),

  windowControls: {
    minimize: () => ipcRenderer.invoke("win:minimize"),
    maximize: () => ipcRenderer.invoke("win:maximize"),
    close: () => ipcRenderer.invoke("win:close"),
    isMaximized: () => ipcRenderer.invoke("win:is-maximized"),
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
