import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  RotateCcw,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Clock3,
} from "lucide-react";
import { sqliteStore } from "@/lib/db-client";
import { money, type Venue } from "@/lib/rental-store";
import { toast } from "sonner";

interface DeletedReservation {
  id: string;
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
  deletedAt?: string;
}

interface TrashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: "dark" | "light";
  venues: Venue[];
  onReservationRestored?: () => void;
}

export function TrashModal({
  open,
  onOpenChange,
  theme = "dark",
  venues,
  onReservationRestored,
}: TrashModalProps): React.JSX.Element {
  const isDark = theme === "dark";
  const [deletedList, setDeletedList] = useState<DeletedReservation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [retentionDays, setRetentionDays] = useState("30");

  const loadDeletedItems = async () => {
    setLoading(true);
    try {
      const items = await sqliteStore.getDeletedReservations();
      setDeletedList(items || []);
    } catch (err: any) {
      toast.error(`Çöp kutusu yüklenirken hata oluştu: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDeletedItems();
      const savedRetention = localStorage.getItem("venue-keeper-trash-retention-days");
      if (savedRetention) setRetentionDays(savedRetention);
    }
  }, [open]);

  const handleRestore = async (res: DeletedReservation) => {
    try {
      await sqliteStore.restoreReservation(res.id);
      toast.success(`"${res.customer}" (${res.date}) etkinliği başarıyla geri yüklendi!`);
      loadDeletedItems();
      if (onReservationRestored) onReservationRestored();
    } catch (err: any) {
      toast.error(`Geri yükleme hatası: ${err?.message || err}`);
    }
  };

  const handlePermanentDelete = async (res: DeletedReservation) => {
    const confirm = window.confirm(
      `⚠️ DİKKAT: "${res.customer}" (${res.date}) etkinliği KALICI OLARAK silinecektir.\n\nBu işlem geri alınamaz! Devam etmek istiyor musunuz?`
    );
    if (!confirm) return;

    try {
      await sqliteStore.permanentDeleteReservation(res.id);
      toast.success(`Etkinlik kaydı kalıcı olarak silindi.`);
      loadDeletedItems();
    } catch (err: any) {
      toast.error(`Kalıcı silme hatası: ${err?.message || err}`);
    }
  };

  const handleEmptyTrash = async () => {
    if (deletedList.length === 0) return;
    const confirm = window.confirm(
      `⚠️ ÇÖP KUTUSUNU BOŞALT:\n\nÇöp kutusundaki toplam ${deletedList.length} adet etkinlik kaydı KALICI OLARAK silinecektir.\n\nBu işlem kesinlikle geri alınamaz! Onaylıyor musunuz?`
    );
    if (!confirm) return;

    try {
      await sqliteStore.emptyRecycleBin();
      toast.success(`Geri dönüşüm kutusu tamamen boşaltıldı.`);
      loadDeletedItems();
    } catch (err: any) {
      toast.error(`Çöp kutusu boşaltılırken hata: ${err?.message || err}`);
    }
  };

  const handleCleanupOld = async () => {
    const days = parseInt(retentionDays, 10) || 30;
    try {
      await sqliteStore.cleanupOldTrash(days);
      localStorage.setItem("venue-keeper-trash-retention-days", retentionDays);
      toast.success(`${days} günden eski silinmiş kayıtlar kalıcı olarak temizlendi.`);
      loadDeletedItems();
    } catch (err: any) {
      toast.error(`Otomatik temizleme hatası: ${err?.message || err}`);
    }
  };

  const filteredItems = deletedList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const v = venues.find((x) => x.id === item.venueId);
    return (
      (item.customer && item.customer.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.eventType && item.eventType.toLowerCase().includes(q)) ||
      (item.date && item.date.includes(q)) ||
      (v?.name && v.name.toLowerCase().includes(q))
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-black flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <span>Geri Dönüşüm Kutusu (Silinen Etkinlikler)</span>
                <Badge className="bg-rose-600 text-white text-xs px-2 py-0.5 font-bold ml-1">
                  {deletedList.length} Silinen Kayıt
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Silinen etkinlikler bu alanda güvenle saklanır. İhtiyaç halinde tek tıkla geri yükleyebilir veya kalıcı olarak temizleyebilirsiniz.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {deletedList.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleEmptyTrash}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 font-bold px-3 shadow-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Çöpü Boşalt ({deletedList.length})
                </Button>
              )}
            </div>
          </div>

          {/* Auto-Retention & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Silinenlerde ara (Müşteri adı, telefon, salon, tarih)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`text-xs pl-8 h-8 rounded-xl ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {/* Auto Cleanup Settings */}
            <div className="flex items-center gap-1.5">
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className={`text-xs h-8 px-2 rounded-xl border font-semibold flex-1 ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
                title="Otomatik Temizleme Süresi"
              >
                <option value="15">15 gün sonra kalıcı sil</option>
                <option value="30">30 gün sonra kalıcı sil (Önerilen)</option>
                <option value="60">60 gün sonra kalıcı sil</option>
                <option value="90">90 gün sonra kalıcı sil</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCleanupOld}
                className="h-8 px-2.5 text-[11px] font-bold shrink-0 border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10"
                title="Eski Silinenleri Şimdi Temizle"
              >
                <Clock3 className="h-3.5 w-3.5 mr-1" /> Temizle
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="text-center py-16 space-y-2">
              <Clock className="h-8 w-8 mx-auto text-indigo-500 animate-spin opacity-50" />
              <p className="text-xs text-slate-400">Çöp kutusu yükleniyor...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 opacity-60" />
              <h4 className="font-bold text-sm text-slate-400">
                {searchQuery ? "Aramanızla eşleşen silinmiş kayıt bulunamadı." : "Geri dönüşüm kutusu tertemiz! Silinmiş etkinlik kaydı yok."}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Bir etkinliği sildiğinizde kaybolmaz, buraya taşınır ve 30 gün boyunca güvenle geri yüklenebilir.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr
                    className={`border-b text-[11px] uppercase font-black tracking-wider ${
                      isDark ? "bg-slate-950 text-slate-300 border-slate-800" : "bg-slate-100 text-slate-900 border-slate-300"
                    }`}
                  >
                    <th className="p-3">Silinme Tarihi</th>
                    <th className="p-3">Müşteri / Kurum</th>
                    <th className="p-3">Mekan & Salon</th>
                    <th className="p-3">Etkinlik Tarihi & Saati</th>
                    <th className="p-3 text-right">Tutar</th>
                    <th className="p-3 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/70" : "divide-slate-200"}`}>
                  {filteredItems.map((r) => {
                    const v = venues.find((x) => x.id === r.venueId);
                    const h = v?.halls?.find((x) => x.id === r.hallId);

                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          isDark ? "hover:bg-slate-800/40 bg-slate-900/30" : "hover:bg-rose-50/40 bg-white"
                        }`}
                      >
                        {/* Deletion Date */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-mono text-[11px] font-bold text-rose-500 flex items-center gap-1">
                            🗑️ {r.deletedAt || "Bilinmiyor"}
                          </div>
                          <div className="text-[10px] text-slate-400">Silindi</div>
                        </td>

                        {/* Customer */}
                        <td className="p-3">
                          <div className={`font-black text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {r.customer}
                          </div>
                          {r.phone && (
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              📞 {r.phone}
                            </div>
                          )}
                        </td>

                        {/* Venue & Hall */}
                        <td className="p-3">
                          <div className={`font-bold text-xs ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                            {v?.name || "Mekan"}
                          </div>
                          <div className="text-[11px] text-indigo-500 font-semibold">📍 {h?.name || "Salon"}</div>
                        </td>

                        {/* Event Date & Time */}
                        <td className="p-3 whitespace-nowrap font-mono">
                          <div className={`font-black text-xs ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            📅 {r.date}
                          </div>
                          <div className="text-[11px] text-emerald-500 font-bold">
                            ⏰ {r.start} - {r.end}
                          </div>
                        </td>

                        {/* Financial Price */}
                        <td className="p-3 text-right whitespace-nowrap font-mono font-black text-emerald-500 text-xs">
                          {money(r.price)}
                        </td>

                        {/* Actions: Restore & Permanent Delete */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(r)}
                              className="h-7 px-2.5 text-[11px] font-black border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                              title="Bu etkinliği takvime geri yükle"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" /> Geri Yükle
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePermanentDelete(r)}
                              className="h-7 px-2 text-[11px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                              title="Kalıcı olarak yok et"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
