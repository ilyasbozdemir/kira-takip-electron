import React, { useState } from "react";
import { Building2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { money, type Hall, type Venue } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { toast } from "sonner";

interface VenuesScreenProps {
  theme: "dark" | "light";
  store: {
    venues: Venue[];
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

  // Editing state for Venue
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editVenueName, setEditVenueName] = useState("");
  const [editVenueDistrict, setEditVenueDistrict] = useState("");
  const [editVenueCategory, setEditVenueCategory] = useState("");
  const [editVenueAddress, setEditVenueAddress] = useState("");
  const [editVenueMapUrl, setEditVenueMapUrl] = useState("");
  const [editVenueManagerName, setEditVenueManagerName] = useState("");
  const [editVenueManagerPhone, setEditVenueManagerPhone] = useState("");
  const [editVenueManagerTitle, setEditVenueManagerTitle] = useState("");

  // Editing state for Hall
  const [editingHall, setEditingHall] = useState<{ venueId: string; hall: Hall } | null>(null);
  const [editHallName, setEditHallName] = useState("");
  const [editHallFloor, setEditHallFloor] = useState("");
  const [editHallCapacity, setEditHallCapacity] = useState<number>(100);
  const [editHallPrice, setEditHallPrice] = useState<number>(0);

  const startEditVenue = (v: Venue) => {
    setEditingVenue(v);
    setEditVenueName(v.name || "");
    setEditVenueDistrict(v.district || "");
    setEditVenueCategory(v.category || "Genel");
    setEditVenueAddress(v.address || "");
    setEditVenueMapUrl(v.mapUrl || "");
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
        name: editVenueName,
        district: editVenueDistrict,
        category: editVenueCategory,
        address: editVenueAddress,
        mapUrl: editVenueMapUrl,
        managerName: editVenueManagerName,
        managerPhone: editVenueManagerPhone,
        managerTitle: editVenueManagerTitle,
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
        name: editHallName,
        floor: editHallFloor,
        capacity: Number(editHallCapacity) || 100,
        hourlyPrice: Number(editHallPrice) || 0,
      });
      toast.success(`"${editHallName}" salonu başarıyla güncellendi.`);
      setEditingHall(null);
    } catch (err: any) {
      toast.error(`Salon güncelleme hatası: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Mekanlar, Tesisler & Salonlar
          </h3>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Mekan ekleyin, kat bazlı salon ve saatlik kira tarifelerini düzenleyin.
          </p>
        </div>
        <Button
          onClick={onOpenVenueModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Yeni Mekan Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.venues.map((v) => (
          <Card
            key={v.id}
            className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}
          >
            <CardHeader
              className={`flex flex-row items-start justify-between pb-3 border-b ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <CardTitle
                  className={`text-base font-bold flex items-center gap-2 ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{v.name}</span>
                </CardTitle>
                <CardDescription
                  className={`text-xs mt-0.5 space-y-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  <div>
                    Konum: <strong className="text-indigo-400">{v.district}</strong> • Kategori:{" "}
                    {v.category || "Genel"}
                  </div>
                  {v.address && (
                    <div className="text-[11px] flex items-start gap-1 font-sans">
                      <MapPin className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{v.address}</span>
                    </div>
                  )}
                  {v.mapUrl && (
                    <div>
                      <a
                        href={v.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (window.electronAPI?.openExternalLink) {
                            e.preventDefault();
                            window.electronAPI.openExternalLink(v.mapUrl!);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-semibold hover:underline"
                      >
                        <MapPin className="h-3 w-3 text-sky-400" /> 🗺️ Google Maps'te Aç
                      </a>
                    </div>
                  )}
                  {v.managerName && (
                    <div
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between mt-2 ${
                        isDark
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div>
                        <span className="font-bold">👤 Sorumlu:</span> {v.managerName}
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({v.managerTitle || "Tesis Sorumlusu"})
                        </span>
                      </div>
                      {v.managerPhone && (
                        <a
                          href={`https://wa.me/90${v.managerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (window.electronAPI?.openExternalLink) {
                              e.preventDefault();
                              window.electronAPI.openExternalLink(
                                `https://wa.me/90${v.managerPhone!.replace(/\D/g, "")}`,
                              );
                            }
                          }}
                          className="font-mono font-bold text-emerald-500 hover:underline flex items-center gap-1"
                        >
                          📞 {v.managerPhone}
                        </a>
                      )}
                    </div>
                  )}
                </CardDescription>
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEditVenue(v)}
                  className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                  title="Mekanı Düzenle"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onPromptDelete("venue", v.id, v.name)}
                  className="h-8 w-8 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
                  title="Mekanı Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Salonlar ({v.halls.length})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenHallModal(v.id)}
                  className={`text-xs h-7 text-indigo-500 ${
                    isDark ? "border-slate-800" : "border-slate-300"
                  }`}
                >
                  <Plus className="h-3 w-3 mr-1" /> Salon Ekle
                </Button>
              </div>

              {v.halls.length === 0 ? (
                <p className={`text-xs py-4 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Bu mekanda salon bulunmuyor.
                </p>
              ) : (
                <div className="space-y-2">
                  {v.halls.map((h) => (
                    <div
                      key={h.id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                        isDark
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div>
                        <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                          {h.name}
                        </p>
                        <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {h.floor} • Kapasite: {h.capacity} Kişi
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-500 mr-1">
                          {money(h.hourlyPrice)} / Saat
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditHall(v.id, h)}
                          className="h-6 w-6 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                          title="Salonu Düzenle"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onPromptDelete("hall", h.id, h.name, v.id)}
                          className="h-6 w-6 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
                          title="Salonu Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Venue Dialog Modal */}
      <Dialog open={Boolean(editingVenue)} onOpenChange={(open) => !open && setEditingVenue(null)}>
        <DialogContent className={`sm:max-w-md ${isDark ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="h-4 w-4 text-indigo-500" /> Mekan Bilgilerini Düzenle
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveVenueEdit} className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Mekan / Tesis Adı *</Label>
              <Input
                required
                value={editVenueName}
                onChange={(e) => setEditVenueName(e.target.value)}
                className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">İlçe / Bölge *</Label>
                <Input
                  required
                  value={editVenueDistrict}
                  onChange={(e) => setEditVenueDistrict(e.target.value)}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Kategori</Label>
                <Input
                  value={editVenueCategory}
                  onChange={(e) => setEditVenueCategory(e.target.value)}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Adres</Label>
              <Input
                value={editVenueAddress}
                onChange={(e) => setEditVenueAddress(e.target.value)}
                className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs font-semibold">Sorumlu Adı</Label>
                <Input
                  value={editVenueManagerName}
                  onChange={(e) => setEditVenueManagerName(e.target.value)}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Telefon</Label>
                <Input
                  value={editVenueManagerPhone}
                  onChange={(e) => setEditVenueManagerPhone(e.target.value)}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Unvan</Label>
                <Input
                  value={editVenueManagerTitle}
                  onChange={(e) => setEditVenueManagerTitle(e.target.value)}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingVenue(null)}>
                Vazgeç
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
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
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="h-4 w-4 text-indigo-500" /> Salon Bilgilerini Düzenle
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveHallEdit} className="space-y-3 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Salon Adı *</Label>
              <Input
                required
                value={editHallName}
                onChange={(e) => setEditHallName(e.target.value)}
                className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Kat / Konum</Label>
                <Input
                  value={editHallFloor}
                  onChange={(e) => setEditHallFloor(e.target.value)}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Kapasite (Kişi)</Label>
                <Input
                  type="number"
                  value={editHallCapacity}
                  onChange={(e) => setEditHallCapacity(Number(e.target.value))}
                  className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Saatlik / Seanslık Kira Ücreti (₺)</Label>
              <Input
                type="number"
                value={editHallPrice}
                onChange={(e) => setEditHallPrice(Number(e.target.value))}
                className={`text-xs mt-1 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingHall(null)}>
                Vazgeç
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Değişiklikleri Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
