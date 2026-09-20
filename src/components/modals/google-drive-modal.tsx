import React, { useEffect, useState } from "react";
import {
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Folder,
  Key,
  HardDrive,
  Database,
  ExternalLink,
  ShieldCheck,
  Check,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface GoogleDriveModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  theme?: "dark" | "light";
  currentFilePath?: string | null;
  onDatabaseRestored?: (newPath: string) => void;
}

interface GDriveFile {
  id: string;
  name: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export function GoogleDriveModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  theme = "dark",
  currentFilePath,
  onDatabaseRestored,
}: GoogleDriveModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isDark = theme === "dark";

  const [token, setToken] = useState(() => localStorage.getItem("gdrive_token") || "");
  const [folderId, setFolderId] = useState(() => localStorage.getItem("gdrive_folder_id") || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email?: string; name?: string; quota?: any } | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [isListing, setIsListing] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GDriveFile[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // Listen for custom event 'open-gdrive-modal'
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-gdrive-modal", handleOpen);
    return () => window.removeEventListener("open-gdrive-modal", handleOpen);
  }, [setOpen]);

  // Verify on initial open if token exists
  useEffect(() => {
    if (isOpen && token && !userInfo && !verifyError) {
      handleVerify(token);
    }
  }, [isOpen, token]);

  const handleSaveSettings = () => {
    localStorage.setItem("gdrive_token", token.trim());
    localStorage.setItem("gdrive_folder_id", folderId.trim());
    toast.success("Google Drive ayarları yerel hafızaya kaydedildi.");
  };

  const handleVerify = async (tokenToTest = token) => {
    if (!tokenToTest.trim()) {
      toast.error("Lütfen bir Google Drive erişim belirteci (Access Token) girin.");
      return;
    }
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const res = await (window.electronAPI as any)?.gdrive?.verify(tokenToTest.trim());
      if (res?.success) {
        setUserInfo({
          email: res.user?.emailAddress || res.user?.displayName,
          name: res.user?.displayName,
          quota: res.storageQuota,
        });
        localStorage.setItem("gdrive_token", tokenToTest.trim());
        toast.success("Google Drive bağlantısı doğrulandı!");
      } else {
        setUserInfo(null);
        setVerifyError(res?.error || "Erişim belirteci geçersiz veya süresi dolmuş.");
        toast.error("Google Drive bağlantısı başarısız!");
      }
    } catch (err: any) {
      setUserInfo(null);
      setVerifyError(err?.message || "Bağlantı hatası oluştu.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadBackup = async () => {
    if (!token.trim()) {
      toast.error("Lütfen önce geçerli bir Google Drive belirteci kaydedin.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const nowStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const dbBaseName = currentFilePath ? currentFilePath.split(/[\\/]/).pop()?.replace(".vke", "") : "isletme-takip";
      const fileName = `${dbBaseName}-backup-${nowStr}.vke`;

      const res = await (window.electronAPI as any)?.gdrive?.upload({
        token: token.trim(),
        filePath: currentFilePath,
        fileName,
        folderId: folderId.trim() || undefined,
      });

      if (res?.success) {
        setUploadSuccess(res.fileName);
        toast.success(`Yedek başarıyla yüklendi: ${res.fileName}`);
        handleListFiles();
      } else {
        toast.error(`Yükleme hatası: ${res?.error || "Bilinmeyen hata"}`);
      }
    } catch (err: any) {
      toast.error(`Yükleme başarısız: ${err?.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleListFiles = async () => {
    if (!token.trim()) {
      toast.error("Lütfen önce geçerli bir Google Drive belirteci kaydedin.");
      return;
    }

    setIsListing(true);
    setListError(null);
    try {
      const res = await (window.electronAPI as any)?.gdrive?.list({
        token: token.trim(),
        folderId: folderId.trim() || undefined,
      });

      if (res?.success) {
        setDriveFiles(res.files || []);
        if ((res.files || []).length === 0) {
          toast.info("Google Drive üzerinde henüz .vke uzantılı yedek dosyası bulunamadı.");
        }
      } else {
        setListError(res?.error || "Yedekler listelenemedi.");
        toast.error(`Listeleme hatası: ${res?.error}`);
      }
    } catch (err: any) {
      setListError(err?.message || "Bilinmeyen hata oluştu.");
    } finally {
      setIsListing(false);
    }
  };

  const handleDownloadAndRestore = async (file: GDriveFile) => {
    const confirmRestore = window.confirm(
      `⚠️ DİKKAT: "${file.name}" isimli yedek dosyası Google Drive'dan indirilecek ve aktif çalışma veritabanı olarak yüklenecektir.\n\nDevam etmek istiyor musunuz?`
    );
    if (!confirmRestore) return;

    setDownloadingFileId(file.id);
    try {
      const res = await (window.electronAPI as any)?.gdrive?.download({
        token: token.trim(),
        fileId: file.id,
      });

      if (res?.success && res.filePath) {
        toast.success("Dosya Google Drive'dan indirildi. Veritabanına geçiş yapılıyor...");

        if (window.electronAPI?.db?.switchDatabase) {
          await window.electronAPI.db.switchDatabase(res.filePath);
        } else if ((window.electronAPI as any)?.switchPath) {
          await (window.electronAPI as any).switchPath(res.filePath);
        }

        if (onDatabaseRestored) {
          onDatabaseRestored(res.filePath);
        }
        setOpen(false);
        toast.success("Veritabanı başarıyla geri yüklendi ve aktif edildi!");
      } else {
        toast.error(`İndirme hatası: ${res?.error || "Dosya indirilemedi."}`);
      }
    } catch (err: any) {
      toast.error(`Geri yükleme hatası: ${err?.message || err}`);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const formatFileSize = (bytes?: string | number) => {
    if (!bytes) return "Bilinmiyor";
    const num = Number(bytes);
    if (isNaN(num)) return "Bilinmiyor";
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className={`w-[95vw] sm:max-w-2xl p-0 overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 pb-4 border-b flex items-center justify-between ${
            isDark ? "border-slate-800/80 bg-slate-950/40" : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Cloud className="h-5 w-5" />
              </div>
              <span>Google Drive Bulut Depolama & Eşitleme Yöneticisi</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 pl-8">
              Kira ve etkinlik veritabanınızı (.vke) Google Drive bulutunda saklayın, arşivleyin ve dilediğiniz zaman geri yükleyin.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body Tabs */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Connection Status Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              userInfo
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : verifyError
                ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    userInfo
                      ? "bg-emerald-500/20 text-emerald-600"
                      : verifyError
                      ? "bg-rose-500/20 text-rose-600"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {userInfo ? <ShieldCheck className="h-5 w-5" /> : verifyError ? <AlertCircle className="h-5 w-5" /> : <Key className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    {userInfo ? (
                      <>
                        <span>Bağlantı Aktif: {userInfo.email || userInfo.name}</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">
                          DOĞRULANDI
                        </span>
                      </>
                    ) : verifyError ? (
                      <span>Bağlantı Başarısız</span>
                    ) : (
                      <span>Google Drive Belirteci Tanımlanmadı</span>
                    )}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {userInfo
                      ? `Google Drive API entegrasyonu hazır. Yedekler buluta aktarılabilir.`
                      : verifyError
                      ? verifyError
                      : `Yedekleme ve indirme işlemleri için geçerli bir OAuth Access Token girin.`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !token.trim()}
                  className="text-xs h-8 font-bold"
                >
                  {isVerifying && <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  {isVerifying ? "Sınanıyor..." : "Bağlantıyı Sına"}
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid grid-cols-3 h-9 mb-3">
              <TabsTrigger value="upload" className="text-xs font-bold gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Buluta Yükle (Export)
              </TabsTrigger>
              <TabsTrigger
                value="download"
                className="text-xs font-bold gap-1.5"
                onClick={() => {
                  if (driveFiles.length === 0 && token.trim()) {
                    handleListFiles();
                  }
                }}
              >
                <Download className="h-3.5 w-3.5" /> Buluttan İndir (Import)
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs font-bold gap-1.5">
                <Key className="h-3.5 w-3.5" /> API & Token Ayarı
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: UPLOAD */}
            <TabsContent value="upload" className="space-y-4">
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      Aktif Veritabanı: {currentFilePath ? currentFilePath.split(/[\\/]/).pop() : "isletme-takip.vke"}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{currentFilePath || "Yerel dosya"}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Çalışma alanındaki tüm salonları, tahsis kayıtlarını, kasa hareketlerini ve ayarları paketleyip Google Drive bulut hesabınıza yeni bir zaman damgalı .vke yedeği olarak yükler.
                </p>

                {uploadSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Son yüklenen: {uploadSuccess}</span>
                  </div>
                )}

                <Button
                  onClick={handleUploadBackup}
                  disabled={isUploading || !token.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 shadow-sm"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Google Drive'a Yükleniyor...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5" />
                      Aktif Dosyayı Buluta Yükle
                    </span>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: DOWNLOAD & LIST */}
            <TabsContent value="download" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drive'daki .vke Yedekleri ({driveFiles.length})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleListFiles}
                  disabled={isListing || !token.trim()}
                  className="text-xs h-7.5 font-semibold"
                >
                  {isListing && <RefreshCw className="h-3 w-3 animate-spin mr-1" />}
                  {isListing ? "Yenileniyor..." : "Yenile"}
                </Button>
              </div>

              {listError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                  {listError}
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {driveFiles.length === 0 && !isListing ? (
                  <div
                    className={`p-6 rounded-xl border text-center text-xs text-slate-400 ${
                      isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    Henüz listelenmiş yedek dosyası yok. Yukarıdaki "Yenile" butonuna tıklayarak Google Drive'ı tarayabilirsiniz.
                  </div>
                ) : (
                  driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isDark
                          ? "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <HardDrive className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                          <span>Boyut: {formatFileSize(file.size)}</span>
                          {file.createdTime && (
                            <span>
                              Tarih: {new Date(file.createdTime).toLocaleString("tr-TR")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => (window.electronAPI as any)?.openExternalLink?.(file.webViewLink)}
                            title="Drive'da Göster"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleDownloadAndRestore(file)}
                          disabled={downloadingFileId === file.id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8"
                        >
                          {downloadingFileId === file.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Download className="h-3.5 w-3.5 mr-1" />
                          )}
                          İndir & Aç
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* TAB 3: SETTINGS */}
            <TabsContent value="settings" className="space-y-3">
              <div className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold block mb-1">
                    Google Drive OAuth Access Token (Erişim Belirteci)
                  </Label>
                  <Input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Google Cloud Console veya OAuth Playground üzerinden alınan geçerli bir Google Drive yetkilendirme belirteci (Bear token).
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold block mb-1">
                    Hedef Google Drive Klasör ID (İsteğe Bağlı)
                  </Label>
                  <Input
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="1A2b3C4d5E..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Belirli bir klasöre yedeklemek isterseniz klasör URL'sindeki ID'yi buraya yapıştırın. Boş bırakılırsa ana dizine yedeklenir.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerify()}
                    disabled={isVerifying || !token.trim()}
                    className="text-xs font-semibold"
                  >
                    Bağlantıyı Sına
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSettings}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Ayarları Kaydet
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div
          className={`p-4 px-5 border-t flex items-center justify-end ${
            isDark ? "border-slate-800/80 bg-slate-950/40" : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-xs h-8 font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          >
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
