import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { sqliteStore } from "@/lib/db-client";

export interface RecentFileItem {
  id: string;
  name: string;
  path: string;
  lastOpened: string;
}

export function useWorkspaceStore() {
  const [activeDosyaId, setActiveDosyaId] = useState<string | null>(() => {
    return localStorage.getItem("active_dosya_id") || "default";
  });
  const [fileName, setFileName] = useState<string>("İşletme Takip Veritabanı (.vke)");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isStartingFile, setIsStartingFile] = useState<boolean>(false);
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>([]);

  const fetchRecentFiles = useCallback(async () => {
    try {
      const saved = localStorage.getItem("recent_vke_files");
      if (saved) {
        setRecentFiles(JSON.parse(saved));
      }
    } catch {
      setRecentFiles([]);
    }
  }, []);

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  const openFile = async (filePath?: string) => {
    try {
      if (window.electronAPI?.switchPath) {
        const res = await window.electronAPI.switchPath(filePath);
        if (res && res.success) {
          setCurrentFilePath(res.filePath || filePath || null);
          setFileName(res.fileName || "Veritabanı (.vke)");
          setActiveDosyaId(res.filePath || "default");
          localStorage.setItem("active_dosya_id", res.filePath || "default");
          await sqliteStore.loadFromDb();
          toast.success("Veritabanı dosyası başarıyla açıldı.");
        }
      }
    } catch (err: any) {
      toast.error(`Dosya açma hatası: ${err.message || err}`);
    }
  };

  const createFile = async (newFileName?: string) => {
    try {
      if (window.electronAPI?.switchPath) {
        const res = await window.electronAPI.switchPath();
        if (res && res.success) {
          setCurrentFilePath(res.filePath || null);
          setFileName(res.fileName || newFileName || "Yeni Veritabanı (.vke)");
          setActiveDosyaId(res.filePath || "new");
          localStorage.setItem("active_dosya_id", res.filePath || "new");
          await sqliteStore.loadFromDb();
          toast.success("Yeni veritabanı dosyası oluşturuldu.");
        }
      }
    } catch (err: any) {
      toast.error(`Dosya oluşturma hatası: ${err.message || err}`);
    }
  };

  const saveFileAs = async () => {
    toast.info("Veritabanı otomatik olarak anlık SQLite senkronizasyonundadır.");
  };

  const closeFile = () => {
    setIsStartingFile(true);
  };

  return {
    activeDosyaId,
    fileName,
    currentFilePath,
    isStartingFile,
    recentFiles,
    openFile,
    createFile,
    saveFileAs,
    closeFile,
    fetchRecentFiles,
  };
}
