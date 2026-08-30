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
  const [activeDosyaId, setActiveDosyaId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isStartingFile, setIsStartingFile] = useState<boolean>(true);
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

  const addRecentFile = useCallback((fPath: string, fName?: string) => {
    try {
      const saved = localStorage.getItem("recent_vke_files");
      const list: RecentFileItem[] = saved ? JSON.parse(saved) : [];
      const name = fName || fPath.split(/[\\/]/).pop() || "Veritabanı (.vke)";
      const now = new Date().toLocaleDateString("tr-TR") + " " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

      const filtered = list.filter((x) => x.path !== fPath);
      const updated = [{ id: fPath, name, path: fPath, lastOpened: now }, ...filtered].slice(0, 10);
      localStorage.setItem("recent_vke_files", JSON.stringify(updated));
      setRecentFiles(updated);
    } catch {}
  }, []);

  useEffect(() => {
    fetchRecentFiles();

    // Check opened file path on mount (e.g. file double-clicked from Explorer)
    if (window.electronAPI?.getOpenedFilePath) {
      window.electronAPI.getOpenedFilePath().then((p: string | null) => {
        if (p) {
          setCurrentFilePath(p);
          const name = p.split(/[\\/]/).pop() || "Veritabanı (.vke)";
          setFileName(name);
          setActiveDosyaId(p);
          addRecentFile(p, name);
          sqliteStore.loadFromDb();
          setIsStartingFile(false);
        } else {
          setIsStartingFile(true);
        }
      });
    } else {
      setIsStartingFile(true);
    }
  }, [fetchRecentFiles, addRecentFile]);

  const removeRecentFile = useCallback((fPath: string) => {
    try {
      const saved = localStorage.getItem("recent_vke_files");
      if (saved) {
        const list: RecentFileItem[] = JSON.parse(saved);
        const filtered = list.filter((x) => x.path !== fPath);
        localStorage.setItem("recent_vke_files", JSON.stringify(filtered));
        setRecentFiles(filtered);
      }
    } catch {}
  }, []);

  const openFile = async (filePath?: string) => {
    try {
      let targetPath: string | null = null;
      let targetName: string | undefined = undefined;

      if (filePath) {
        // Direct switch to specific path (e.g. from recent list)
        if (window.electronAPI?.switchPath) {
          const res = await window.electronAPI.switchPath(filePath);
          if (res && res.success) {
            targetPath = res.path || filePath;
            targetName = (targetPath ? targetPath.split(/[\\/]/).pop() : undefined) || "Veritabanı (.vke)";
          } else {
            removeRecentFile(filePath);
            toast.error(res?.error || "Dosya açılamadı veya diskte bulunamadı.");
            return;
          }
        }
      } else {
        // Open native file dialog to browse and select
        if (window.electronAPI?.openFileDialog) {
          const res = await window.electronAPI.openFileDialog();
          if (!res || !res.filePath) {
            return; // User canceled dialog
          }
          targetPath = res.filePath;
          targetName = res.filePath.split(/[\\/]/).pop() || "Veritabanı (.vke)";
        }
      }

      if (targetPath) {
        setCurrentFilePath(targetPath);
        setFileName(targetName || "Veritabanı (.vke)");
        setActiveDosyaId(targetPath);
        localStorage.setItem("active_dosya_id", targetPath);
        addRecentFile(targetPath, targetName);
        await sqliteStore.loadFromDb();
        setIsStartingFile(false);
        toast.success(`"${targetName}" veritabanı başarıyla açıldı.`);
      }
    } catch (err: any) {
      toast.error(`Dosya açma hatası: ${err.message || err}`);
    }
  };

  const createFile = async (newFileName?: string) => {
    try {
      if (window.electronAPI?.saveFileDialog) {
        const res = await window.electronAPI.saveFileDialog({
          defaultName: newFileName || "yeni-isletme-veritabani.vke",
        });
        if (!res) {
          return; // User canceled save dialog
        }

        const createdPath = typeof res === "string" ? res : res.filePath;
        if (createdPath) {
          const createdName = createdPath.split(/[\\/]/).pop() || "Yeni Veritabanı (.vke)";
          setCurrentFilePath(createdPath);
          setFileName(createdName);
          setActiveDosyaId(createdPath);
          localStorage.setItem("active_dosya_id", createdPath);
          addRecentFile(createdPath, createdName);
          await sqliteStore.loadFromDb();
          setIsStartingFile(false);
          toast.success(`"${createdName}" başarıyla oluşturuldu ve bağlandı.`);
        }
      }
    } catch (err: any) {
      toast.error(`Dosya oluşturma hatası: ${err.message || err}`);
    }
  };

  const saveFileAs = async () => {
    try {
      if (window.electronAPI?.saveAsDatabase) {
        const res = await window.electronAPI.saveAsDatabase({
          defaultName: currentFilePath ? `Yedek_${fileName}` : "isletme-yedek.vke",
        });
        if (!res || !res.filePath) {
          return; // User canceled
        }

        const newPath = res.filePath;
        const newName = res.fileName || newPath.split(/[\\/]/).pop() || "Veritabanı (.vke)";
        setCurrentFilePath(newPath);
        setFileName(newName);
        setActiveDosyaId(newPath);
        localStorage.setItem("active_dosya_id", newPath);
        addRecentFile(newPath, newName);
        await sqliteStore.loadFromDb();
        toast.success(`Veritabanı farklı kaydedildi: ${newName}`);
      } else {
        toast.info("Veritabanı anlık SQLite senkronizasyonundadır.");
      }
    } catch (err: any) {
      toast.error(`Farklı kaydetme hatası: ${err?.message || err}`);
    }
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
    removeRecentFile,
    fetchRecentFiles,
  };
}
