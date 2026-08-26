import { contextBridge, ipcRenderer } from "electron";

export const electronAPI = {
  // SQLite Database IPCs
  db: {
    getCurrentPath: () => ipcRenderer.invoke("db:get-current-path"),
    getStore: () => ipcRenderer.invoke("db:get-store"),
    addVenue: (data: { name: string; district: string; category?: string }) =>
      ipcRenderer.invoke("db:add-venue", data),
    deleteVenue: (venueId: string) => ipcRenderer.invoke("db:delete-venue", venueId),
    addHall: (data: {
      venueId: string;
      hall: { name: string; floor: string; capacity: number; hourlyPrice: number };
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
    }) => ipcRenderer.invoke("db:add-reservation", res),
    deleteReservation: (id: string) => ipcRenderer.invoke("db:delete-reservation", id),
    updatePaid: (id: string, paid: number) => ipcRenderer.invoke("db:update-paid", { id, paid }),
    switchDatabase: (filePath: string) => ipcRenderer.invoke("db:switch-path", filePath),
  },

  // File & Custom Extension IPCs
  getOpenedFilePath: () => ipcRenderer.invoke("get-opened-file-path"),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  saveFileDialog: (data: { defaultName?: string }) => ipcRenderer.invoke("save-file-dialog", data),

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
  openExternalLink: (url: string) => ipcRenderer.invoke("open-external-link", url),

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
