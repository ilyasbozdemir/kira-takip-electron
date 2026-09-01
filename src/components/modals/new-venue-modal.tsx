import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Venue } from "@/lib/rental-store";
import { normalizeTRPhoneInput } from "@/lib/phone-utils";
import { TURKISH_CITIES, getDistrictsForCity } from "@/lib/turkey-locations";

interface NewVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  newVenueName: string;
  setNewVenueName: (v: string) => void;
  newVenueCity?: string;
  setNewVenueCity?: (v: string) => void;
  newVenueDistrict: string;
  setNewVenueDistrict: (v: string) => void;
  newVenueAddress: string;
  setNewVenueAddress: (v: string) => void;
  newVenueMapUrl: string;
  setNewVenueMapUrl: (v: string) => void;
  newVenueCategory: string;
  setNewVenueCategory: (v: string) => void;
  newVenueManagerPersonnelId?: string;
  setNewVenueManagerPersonnelId?: (v: string) => void;
  newVenueManagerName: string;
  setNewVenueManagerName: (v: string) => void;
  newVenueManagerTitle: string;
  setNewVenueManagerTitle: (v: string) => void;
  newVenueManagerPhone: string;
  setNewVenueManagerPhone: (v: string) => void;
  newVenueColor: string;
  setNewVenueColor: (v: string) => void;
  store: {
    venues: Venue[];
    personnel?: Array<{ id: string; name: string; title?: string; phone?: string }>;
  };
  handleCreateVenue: (e: React.FormEvent, onSuccess?: () => void) => Promise<void> | void;
}

export function NewVenueModal({
  open,
  onOpenChange,
  theme,
  newVenueName,
  setNewVenueName,
  newVenueCity = "Ankara",
  setNewVenueCity,
  newVenueDistrict,
  setNewVenueDistrict,
  newVenueAddress,
  setNewVenueAddress,
  newVenueMapUrl,
  setNewVenueMapUrl,
  newVenueCategory,
  setNewVenueCategory,
  newVenueManagerPersonnelId,
  setNewVenueManagerPersonnelId,
  newVenueManagerName,
  setNewVenueManagerName,
  newVenueManagerTitle,
  setNewVenueManagerTitle,
  newVenueManagerPhone,
  setNewVenueManagerPhone,
  newVenueColor,
  setNewVenueColor,
  store,
  handleCreateVenue,
}: NewVenueModalProps): React.JSX.Element {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateVenue(e, () => {
      onOpenChange(false);
    });
  };

  const availableDistricts = getDistrictsForCity(newVenueCity || "Ankara");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-115 bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-115 bg-white border-slate-200 text-slate-900 shadow-2xl"}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-base font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Yeni Mekan / Tesis Tanımla
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-xs">
          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Mekan / İşletme Adı *
            </Label>
            <Input
              required
              placeholder="örn: Grand Plaza Kongre & Balo Merkezi"
              value={newVenueName}
              onChange={(e) => setNewVenueName(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          {/* City & District Select Dropdowns (Önden Dizili) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                İl (Şehir) *
              </Label>
              <Select
                value={newVenueCity}
                onValueChange={(city) => {
                  if (setNewVenueCity) setNewVenueCity(city);
                  const dists = getDistrictsForCity(city);
                  if (dists.length > 0) {
                    setNewVenueDistrict(dists[0]);
                  }
                }}
              >
                <SelectTrigger
                  className={`mt-1 text-xs h-8 ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="İl Seçin" />
                </SelectTrigger>
                <SelectContent
                  className={`max-h-60 ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {TURKISH_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                İlçe / Bölge *
              </Label>
              <Select
                value={newVenueDistrict}
                onValueChange={setNewVenueDistrict}
              >
                <SelectTrigger
                  className={`mt-1 text-xs h-8 ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="İlçe Seçin" />
                </SelectTrigger>
                <SelectContent
                  className={`max-h-60 ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {availableDistricts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Mekan Kategorisi
            </Label>
            <Select
              value={newVenueCategory}
              onValueChange={setNewVenueCategory}
            >
              <SelectTrigger
                className={`mt-1 text-xs h-8 ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-slate-200 text-slate-900"}
              >
                <SelectItem value="Kongre & Balo">Kongre & Balo Merkezi</SelectItem>
                <SelectItem value="Kültür Merkezi">Kültür Merkezi</SelectItem>
                <SelectItem value="Otel & Balo">Otel Balo Salonu</SelectItem>
                <SelectItem value="Düğün & Davet">Düğün & Davet Alanı</SelectItem>
                <SelectItem value="Performans Sahnesi">Performans Sahnesi & Amfi</SelectItem>
                <SelectItem value="Toplantı Alanı">Toplantı & Seminer Alanı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Açık Adres Açıklaması (İsteğe Bağlı)
            </Label>
            <Textarea
              rows={2}
              placeholder="örn: Atatürk Mah. Cumhuriyet Cad. No:142"
              value={newVenueAddress}
              onChange={(e) => setNewVenueAddress(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Google Maps / Yol Tarifi Linki (İsteğe Bağlı)
            </Label>
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={newVenueMapUrl}
              onChange={(e) => setNewVenueMapUrl(e.target.value)}
              className={`mt-1 text-xs font-mono ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          {/* Tesis / İşletme Sorumlusu Seçimi */}
          <div className={`pt-2 border-t space-y-2.5 ${theme === "dark" ? "border-slate-800/60" : "border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>
                🏢 Tesis / İşletme Sorumlusu
              </Label>
              <span className={`text-[10px] ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Personel Rehberinden</span>
            </div>

            {store.personnel && store.personnel.length > 0 ? (
              <div className="space-y-2">
                <Select
                  value={newVenueManagerPersonnelId || (newVenueManagerName ? "custom" : "none")}
                  onValueChange={(val) => {
                    if (val === "none") {
                      if (setNewVenueManagerPersonnelId) setNewVenueManagerPersonnelId("");
                      setNewVenueManagerName("");
                      setNewVenueManagerTitle("");
                      setNewVenueManagerPhone("");
                    } else if (val === "custom") {
                      if (setNewVenueManagerPersonnelId) setNewVenueManagerPersonnelId("");
                    } else {
                      if (setNewVenueManagerPersonnelId) setNewVenueManagerPersonnelId(val);
                      const p = store.personnel?.find((x) => x.id === val);
                      if (p) {
                        setNewVenueManagerName(p.name);
                        setNewVenueManagerTitle(p.title || "Tesis Sorumlusu");
                        setNewVenueManagerPhone(p.phone || "");
                      }
                    }
                  }}
                >
                  <SelectTrigger
                    className={`text-xs h-8.5 font-medium ${
                      theme === "dark"
                        ? "bg-slate-950 border-slate-800 text-slate-200"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <SelectValue placeholder="Sorumlu Personel Seçin..." />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-white border-slate-200 text-slate-900"
                    }
                  >
                    <SelectItem value="none" className="text-slate-400">
                      ❌ Sorumlu Atanmasın (Boş Bırak)
                    </SelectItem>
                    {store.personnel.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        👤 {p.name} — {p.title || "Personel"} {p.phone ? `(📞 ${p.phone})` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-indigo-500 font-bold">
                      ✏️ Kadro Dışı Özel Yetkili (Manuel Gir)
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Selected Personnel Details Card */}
                {newVenueManagerPersonnelId && newVenueManagerName && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      theme === "dark"
                        ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-200"
                        : "bg-indigo-50/80 border-indigo-200 text-indigo-900"
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-xs">👤 {newVenueManagerName}</span>
                      <span className="text-[10px] opacity-80 block">
                        {newVenueManagerTitle || "Tesis Sorumlusu"} • 📞 {newVenueManagerPhone || "Telefon Belirtilmedi"}
                      </span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px]">
                      Atandı
                    </Badge>
                  </div>
                )}
              </div>
            ) : null}

            {/* Manual textboxes only if custom mode or no registered personnel */}
            {(!store.personnel || store.personnel.length === 0 || (!newVenueManagerPersonnelId && newVenueManagerName !== "")) && (
              <div
                className={`p-3 rounded-xl border space-y-2.5 animate-in fade-in duration-150 ${
                  theme === "dark"
                    ? "border-slate-800 bg-slate-950/60"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className={`text-[10px] font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Manuel Sorumlu Bilgileri:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className={`text-[10px] font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Sorumlu Adı Soyadı
                    </Label>
                    <Input
                      placeholder="örn: Ahmet Yılmaz"
                      value={newVenueManagerName}
                      onChange={(e) => setNewVenueManagerName(e.target.value)}
                      className={`mt-0.5 text-xs h-7.5 ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <Label className={`text-[10px] font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Görevi / Unvanı
                    </Label>
                    <Input
                      placeholder="örn: Tesis Sorumlusu"
                      value={newVenueManagerTitle}
                      onChange={(e) => setNewVenueManagerTitle(e.target.value)}
                      className={`mt-0.5 text-xs h-7.5 ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <Label className={`text-[10px] font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                    Sorumlu İletişim Telefonu
                  </Label>
                  <Input
                    placeholder="05XX XXX XX XX"
                    value={newVenueManagerPhone}
                    onChange={(e) => setNewVenueManagerPhone(normalizeTRPhoneInput(e.target.value))}
                    className={`mt-0.5 text-xs font-mono h-7.5 ${
                      theme === "dark"
                        ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label
              className={`text-xs font-medium block mb-1.5 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              🎨 Mekan Takvim Etkinlik Rengi
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { name: "İndigo", hex: "#6366f1" },
                { name: "Zümrüt", hex: "#10b981" },
                { name: "Kehribar", hex: "#f59e0b" },
                { name: "Gül", hex: "#ef4444" },
                { name: "Mor", hex: "#8b5cf6" },
                { name: "Gök Mavisi", hex: "#0284c7" },
                { name: "Teal", hex: "#14b8a6" },
                { name: "Pembe", hex: "#ec4899" },
                { name: "Kayrak", hex: "#64748b" },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setNewVenueColor(c.hex)}
                  className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer ${
                    newVenueColor === c.hex
                      ? "border-white scale-110 shadow-md ring-2 ring-indigo-400"
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={newVenueColor}
                onChange={(e) => setNewVenueColor(e.target.value)}
                className={`h-6 w-8 rounded cursor-pointer border ${
                  theme === "dark" ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"
                }`}
                title="Özel Renk Seç"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              Mekan Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
