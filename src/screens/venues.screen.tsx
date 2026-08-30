import React, { useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Users,
  Search,
  Layers,
  Sparkles,
  ExternalLink,
  Navigation,
  CheckCircle2,
  DollarSign,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { money, type Hall, type Venue, type Personnel } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { toast } from "sonner";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { normalizeTRPhoneInput, formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface VenuesScreenProps {
  theme: "dark" | "light";
  store: {
    venues: Venue[];
    personnel?: Personnel[];
  };
  onOpenVenueModal: () => void;
  onOpenHallModal: (venueId: string) => void;
  onPromptDelete: (type: "venue" | "hall", id: string, title: string, venueId?: string) => void;
}

export function VenuesScreen({
  theme,
  store,
  onOpenVenueModal,
  onOpenHallModal,
  onPromptDelete,
}: VenuesScreenProps): React.JSX.Element {
  const isDark = theme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Editing state for Venue
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editVenueName, setEditVenueName] = useState("");
  const [editVenueDistrict, setEditVenueDistrict] = useState("");
  const [editVenueCategory, setEditVenueCategory] = useState("");
  const [editVenueAddress, setEditVenueAddress] = useState("");
  const [editVenueMapUrl, setEditVenueMapUrl] = useState("");
  const [editVenueManagerPersonnelId, setEditVenueManagerPersonnelId] = useState("");
  const [editVenueManagerName, setEditVenueManagerName] = useState("");
  const [editVenueManagerPhone, setEditVenueManagerPhone] = useState("");
  const [editVenueManagerTitle, setEditVenueManagerTitle] = useState("");

  // Editing state for Hall
  const [editingHall, setEditingHall] = useState<{ venueId: string; hall: Hall } | null>(null);
  const [editHallName, setEditHallName] = useState("");
  const [editHallFloor, setEditHallFloor] = useState("");
  const [editHallCapacity, setEditHallCapacity] = useState<number>(100);
  const [editHallPrice, setEditHallPrice] = useState<number>(0);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    store.venues.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [store.venues]);

  // Filtered venues
  const filteredVenues = useMemo(() => {
    return store.venues.filter((v) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.district || "").toLowerCase().includes(q) ||
        (v.category || "").toLowerCase().includes(q) ||
        (v.address || "").toLowerCase().includes(q) ||
        (v.managerName || "").toLowerCase().includes(q) ||
        v.halls.some((h) => h.name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory !== "all" && v.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [store.venues, searchTerm, selectedCategory]);

  // Overall Stats
  const totalVenues = store.venues.length;
  const totalHalls = store.venues.reduce((acc, v) => acc + (v.halls ? v.halls.length : 0), 0);
  const totalCapacity = store.venues.reduce(
    (acc, v) => acc + (v.halls ? v.halls.reduce((hAcc, h) => hAcc + (Number(h.capacity) || 0), 0) : 0),
    0
  );

  const startEditVenue = (v: Venue) => {
    setEditingVenue(v);
    setEditVenueName(v.name || "");
    setEditVenueDistrict(v.district || "");
    setEditVenueCategory(v.category || "Genel");
    setEditVenueAddress(v.address || "");
    setEditVenueMapUrl(v.mapUrl || "");
    setEditVenueManagerPersonnelId(v.managerPersonnelId || "");
    setEditVenueManagerName(v.managerName || "");
    setEditVenueManagerPhone(v.managerPhone || "");
    setEditVenueManagerTitle(v.managerTitle || "");
  };

  const handleSaveVenueEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;
    try {
      await sqliteStore.updateVenue({
        id: editingVenue.id,
        name: editVenueName.trim(),
        district: editVenueDistrict.trim(),
        category: editVenueCategory.trim(),
        address: editVenueAddress.trim(),
        mapUrl: editVenueMapUrl.trim(),
        managerPersonnelId: editVenueManagerPersonnelId || undefined,
        managerName: editVenueManagerName.trim(),
        managerPhone: editVenueManagerPhone.trim(),
        managerTitle: editVenueManagerTitle.trim(),
      });
      toast.success(`"${editVenueName}" mekanı başarıyla güncellendi.`);
      setEditingVenue(null);
    } catch (err: any) {
      toast.error(`Mekan güncelleme hatası: ${err.message || err}`);
    }
  };

  const startEditHall = (venueId: string, h: Hall) => {
    setEditingHall({ venueId, hall: h });
    setEditHallName(h.name || "");
    setEditHallFloor(h.floor || "Zemin Kat");
    setEditHallCapacity(h.capacity || 100);
    setEditHallPrice(h.hourlyPrice || 0);
  };

  const handleSaveHallEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHall) return;
    try {
      await sqliteStore.updateHall({
        id: editingHall.hall.id,
        name: editHallName.trim(),
        floor: editHallFloor.trim(),
        capacity: Number(editHallCapacity) || 100,
        hourlyPrice: Number(editHallPrice) || 0,
      });
      toast.success(`"${editHallName}" salonu başarıyla güncellendi.`);
      setEditingHall(null);
    } catch (err: any) {
      toast.error(`Salon güncelleme hatası: ${err.message || err}`);
    }
  };

  const openAppleMaps = (address: string) => {
    const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const openGoogleMaps = (addressOrUrl: string) => {
    const url = addressOrUrl.startsWith("http")
      ? addressOrUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrUrl)}`;
    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(url);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-lg font-black tracking-tight flex items-center gap-2 ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}>
            <Building2 className="h-5 w-5 text-indigo-500" />
            Mekanlar, Tesisler & Salonlar
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Kurum bünyesindeki tesisleri, salon kapasitelerini ve seanslık tarife esaslarını yönetin.
          </p>
        </div>
        <Button
          onClick={onOpenVenueModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-bold shadow-sm flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Yeni Mekan Ekle
        </Button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Kayıtlı Tesis Sayısı
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {totalVenues} <span className="text-xs font-normal text-slate-400">Mekan</span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Aktif Salon / Birim
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {totalHalls} <span className="text-xs font-normal text-slate-400">Salon</span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Toplam Misafir Kapasitesi
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {totalCapacity.toLocaleString("tr-TR")} <span className="text-xs font-normal text-slate-400">Kişi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Mekan, ilçe, salon veya sorumlu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-8 text-xs h-8.5 rounded-lg ${
              isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`text-xs h-8.5 px-3 rounded-lg border font-medium cursor-pointer ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <option value="all">🏢 Tüm Kategoriler ({totalVenues})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Venues Grid Showcase */}
      {filteredVenues.length === 0 ? (
        <Card className={`p-10 text-center rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            {searchTerm || selectedCategory !== "all" ? "Aramanıza uygun mekan bulunamadı." : "Henüz mekan tanımlanmadı."}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== "all"
              ? "Lütfen arama teriminizi veya filtre seçiminizi kontrol edin."
              : "Üst kısımdaki 'Yeni Mekan Ekle' düğmesine tıklayarak ilk tesisinizi sisteme kaydedebilirsiniz."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVenues
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((v) => (
              <Card
                key={v.id}
                className={`rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                  isDark
                    ? "bg-slate-900/90 border-slate-800 hover:border-indigo-500/40"
                    : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
                }`}
              >
                {/* Venue Header Presentation Card */}
                <div>
                  <CardHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="h-11 w-11 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="truncate">
                          <CardTitle className={`text-base font-black truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {v.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <Badge variant="outline" className="text-[10px] font-bold bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                              📍 {v.district || "Merkez"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-semibold bg-slate-200/50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                              🏷️ {v.category || "Genel Tesis"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-bold bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400">
                              🏛️ {v.halls.length} Salon
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Venue Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditVenue(v)}
                          className="h-8 w-8 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
                          title="Mekan Bilgilerini Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onPromptDelete("venue", v.id, v.name)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                          title="Mekanı Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs">
                    {/* Address & Navigation Details */}
                    <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold block text-slate-800 dark:text-slate-200">
                            Mekan Açık Adresi:
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                            {v.address || "Açık adres bilgisi henüz tanımlanmamış."}
                          </p>
                        </div>
                      </div>

                      {/* Live Maps Navigation Action Chips */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => openGoogleMaps(v.mapUrl || v.address || `${v.name} ${v.district}`)}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Google Haritalar Canlı Navigasyon"
                        >
                          <Compass className="h-3.5 w-3.5" /> Google Maps
                        </button>

                        <button
                          type="button"
                          onClick={() => openAppleMaps(v.address || `${v.name} ${v.district}`)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Apple Haritalar (iPhone / iPad / Mac)"
                        >
                          <Navigation className="h-3.5 w-3.5" /> Apple Maps
                        </button>
                      </div>
                    </div>

                    {/* Manager & Supervisor Card */}
                    {v.managerName ? (
                      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                      }`}>
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">
                            👤
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs truncate">
                                {v.managerName}
                              </span>
                              {v.managerPersonnelId && (
                                <Badge variant="outline" className="text-[9px] font-bold bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 py-0">
                                  ✅ Kadrolu Personel
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {v.managerTitle || "Tesis Sorumlusu"}
                            </span>
                          </div>
                        </div>

                        {v.managerPhone && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={getWhatsAppUrl(v.managerPhone)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                if (window.electronAPI?.openExternalLink) {
                                  e.preventDefault();
                                  window.electronAPI.openExternalLink(getWhatsAppUrl(v.managerPhone));
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
                              title="WhatsApp Mesajı Aç"
                            >
                              <MessageCircle className="h-3 w-3" /> {formatTRPhone(v.managerPhone)}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Halls & Capacities Showcase */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-indigo-500" />
                          Bağlı Salonlar & Birimler ({v.halls.length})
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenHallModal(v.id)}
                          className={`text-[11px] h-7 font-bold text-indigo-600 dark:text-indigo-400 ${
                            isDark ? "border-slate-800 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Salon Ekle
                        </Button>
                      </div>

                      {v.halls.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed text-center text-slate-400 text-xs">
                          Bu mekanda tanımlı salon bulunmuyor.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {v.halls.map((h) => (
                            <div
                              key={h.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                                isDark
                                  ? "bg-slate-950/80 border-slate-800/90 hover:border-slate-700"
                                  : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs truncate">
                                    {h.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                    {h.floor || "Zemin Kat"} • Kapasite: <strong className="text-slate-700 dark:text-slate-300">{h.capacity} Kişi</strong>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] px-2 py-0.5">
                                  {money(h.hourlyPrice)} / Seans
                                </Badge>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEditHall(v.id, h)}
                                  className="h-7 w-7 text-indigo-500 hover:bg-indigo-500/10 rounded-lg"
                                  title="Salonu Düzenle"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onPromptDelete("hall", h.id, h.name, v.id)}
                                  className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                  title="Salonu Sil"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {/* Venues Pagination Controls */}
          {filteredVenues.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredVenues.length}
              pageSize={pageSize}
              pageSizeOptions={[4, 6, 12, 24, 48]}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(s) => setPageSize(s)}
              theme={theme}
              itemLabel="mekan"
            />
          )}
        </div>
      )}

      {/* Edit Venue Dialog Modal */}
      <Dialog open={Boolean(editingVenue)} onOpenChange={(open) => !open && setEditingVenue(null)}>
        <DialogContent className={`sm:max-w-md ${isDark ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}>
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Pencil className="h-4 w-4 text-indigo-500" /> Mekan Bilgilerini Düzenle
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mekan adı, açık adresi, kategori ve tesis amiri bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVenueEdit} className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="text-xs font-bold">Mekan / Tesis Adı *</Label>
              <Input
                required
                value={editVenueName}
                onChange={(e) => setEditVenueName(e.target.value)}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">İlçe / Bölge *</Label>
                <Input
                  required
                  value={editVenueDistrict}
                  onChange={(e) => setEditVenueDistrict(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Kategori</Label>
                <Input
                  value={editVenueCategory}
                  onChange={(e) => setEditVenueCategory(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold flex items-center gap-1">
                📍 Mekan Açık Adresi (Google & Apple Haritalar İçin)
              </Label>
              <Input
                placeholder="örn: Atatürk Mah. Cumhuriyet Cad. No:142 Kadıköy / İstanbul"
                value={editVenueAddress}
                onChange={(e) => setEditVenueAddress(e.target.value)}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                ℹ️ Bu adres, müşterilere gönderilen e-posta ve davetiyelerdeki <strong>"Google Maps"</strong> ve <strong>"Apple Maps"</strong> butonlarına otomatik aktarılır.
              </p>
            </div>

            <div>
              <Label className="text-xs font-bold flex items-center gap-1">
                🗺️ Harita / Konum Linki (İsteğe Bağlı)
              </Label>
              <Input
                placeholder="örn: https://maps.app.goo.gl/... veya https://maps.google.com/..."
                value={editVenueMapUrl}
                onChange={(e) => setEditVenueMapUrl(e.target.value)}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            {/* Personnel Selector Dropdown */}
            {store.personnel && store.personnel.length > 0 && (
              <div className="p-2.5 rounded-xl border bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 space-y-1.5">
                <Label className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
                  <span>👤 Kayıtlı Personel Kadrosundan Seç (ID Bağlantılı)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Otomatik Doldurur</span>
                </Label>
                <select
                  value={editVenueManagerPersonnelId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setEditVenueManagerPersonnelId(pId);
                    if (pId) {
                      const p = store.personnel?.find((item) => item.id === pId);
                      if (p) {
                        setEditVenueManagerName(p.name);
                        setEditVenueManagerTitle(p.title || "Tesis Sorumlusu");
                        setEditVenueManagerPhone(p.phone || "");
                      }
                    }
                  }}
                  className={`w-full text-xs h-9 px-2.5 rounded-lg border font-semibold cursor-pointer ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="">(Kadro Dışı / Manuel Giriş)</option>
                  {store.personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      👤 {p.name} — {p.title || "Tesis Sorumlusu"} {p.phone ? `(📞 ${p.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs font-bold">Sorumlu Adı</Label>
                <Input
                  value={editVenueManagerName}
                  onChange={(e) => setEditVenueManagerName(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold flex items-center justify-between">
                  <span>Telefon</span>
                  <span className="text-[9px] text-slate-400 font-mono">🇹🇷 +90</span>
                </Label>
                <Input
                  placeholder="05XX XXX XX XX"
                  value={editVenueManagerPhone}
                  onChange={(e) => setEditVenueManagerPhone(normalizeTRPhoneInput(e.target.value))}
                  className={`text-xs mt-1 h-9 font-mono ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Unvan</Label>
                <Input
                  value={editVenueManagerTitle}
                  onChange={(e) => setEditVenueManagerTitle(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingVenue(null)}>
                Vazgeç
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                Değişiklikleri Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Hall Dialog Modal */}
      <Dialog open={Boolean(editingHall)} onOpenChange={(open) => !open && setEditingHall(null)}>
        <DialogContent className={`sm:max-w-sm ${isDark ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}>
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Pencil className="h-4 w-4 text-indigo-500" /> Salon Bilgilerini Düzenle
            </DialogTitle>
            <DialogDescription className="text-xs">
              Salon adı, kat, kapasite ve seanslık tarife ücretini güncelleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveHallEdit} className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="text-xs font-bold">Salon Adı *</Label>
              <Input
                required
                value={editHallName}
                onChange={(e) => setEditHallName(e.target.value)}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Kat / Konum</Label>
                <Input
                  value={editHallFloor}
                  onChange={(e) => setEditHallFloor(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Kapasite (Kişi)</Label>
                <Input
                  type="number"
                  value={editHallCapacity}
                  onChange={(e) => setEditHallCapacity(Number(e.target.value))}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Seanslık / Paket Kira Ücreti (₺)</Label>
              <Input
                type="number"
                value={editHallPrice}
                onChange={(e) => setEditHallPrice(Number(e.target.value))}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingHall(null)}>
                Vazgeç
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                Değişiklikleri Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
