import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Personnel, type Venue } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { normalizeTRPhoneInput } from "@/lib/phone-utils";
import { TURKISH_CITIES, getDistrictsForCity } from "@/lib/turkey-locations";
import { toast } from "sonner";

interface EditVenueModalProps {
  theme: "dark" | "light";
  editingVenue: Venue | null;
  onClose: () => void;
  personnelList: Personnel[];
  defaultCity?: string;
  defaultDistrict?: string;
}

export const EditVenueModal: React.FC<EditVenueModalProps> = ({
  theme,
  editingVenue,
  onClose,
  personnelList,
  defaultCity = "Ankara",
  defaultDistrict = "Çankaya",
}) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState(defaultCity);
  const [district, setDistrict] = useState(defaultDistrict);
  const [category, setCategory] = useState("Kongre & Balo");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [managerPersonnelId, setManagerPersonnelId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerTitle, setManagerTitle] = useState("");
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    if (editingVenue) {
      setName(editingVenue.name);
      
      // Parse district / city if format is "İlçe / İl"
      const rawDistrict = editingVenue.district || "";
      if (rawDistrict.includes("/")) {
        const parts = rawDistrict.split("/").map((s) => s.trim());
        const d = parts[0];
        const c = parts[1];
        setDistrict(d);
        if (TURKISH_CITIES.includes(c)) {
          setCity(c);
        } else {
          setCity(defaultCity || "Ankara");
        }
      } else {
        // Try finding if rawDistrict is a known district
        let foundCity = defaultCity || "Ankara";
        for (const cityName of TURKISH_CITIES) {
          const dists = getDistrictsForCity(cityName);
          if (dists.some((d) => d.toLowerCase() === rawDistrict.toLowerCase())) {
            foundCity = cityName;
            break;
          }
        }
        setCity(foundCity);
        setDistrict(rawDistrict || defaultDistrict || "Çankaya");
      }

      setCategory(editingVenue.category || "Kongre & Balo");
      setAddress(editingVenue.address || "");
      setMapUrl(editingVenue.mapUrl || "");
      setManagerPersonnelId(editingVenue.managerPersonnelId || "");
      setManagerName(editingVenue.managerName || "");
      setManagerPhone(editingVenue.managerPhone || "");
      setManagerTitle(editingVenue.managerTitle || "Tesis Sorumlusu");
      setColor(editingVenue.color || "#6366f1");
    }
  }, [editingVenue, defaultCity, defaultDistrict]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingVenue || !name.trim()) {
      toast.error("Mekan adı zorunludur.");
      return;
    }

    const combinedDistrict = city
      ? `${district || "Merkez"} / ${city}`
      : district.trim() || "Merkez";

    try {
      await sqliteStore.updateVenue({
        id: editingVenue.id,
        name: name.trim(),
        district: combinedDistrict,
        category: category.trim() || undefined,
        address: address.trim() || undefined,
        mapUrl: mapUrl.trim() || undefined,
        managerPersonnelId: managerPersonnelId || undefined,
        managerName: managerName.trim() || undefined,
        managerPhone: managerPhone.trim() || undefined,
        managerTitle: managerTitle.trim() || undefined,
        color: color || "#6366f1",
      });
      toast.success("Mekan bilgileri güncellendi.");
      onClose();
    } catch (err: any) {
      toast.error(`Güncelleme hatası: ${err.message || err}`);
    }
  };

  const availableDistricts = getDistrictsForCity(city || "Ankara");

  return (
    <Dialog open={!!editingVenue} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={
          theme === "dark"
            ? "sm:max-w-115 bg-slate-900 border-slate-800 text-slate-100"
            : "sm:max-w-115 bg-white border-slate-200 text-slate-900 shadow-2xl"
        }
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" /> Mekan / Tesis Bilgilerini Düzenle
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Tesis adı, konumu, sorumlu personel ve takvim rengini güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5 py-1 text-xs">
          <div>
            <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              Mekan / Tesis Adı *
            </Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Kültür ve Kongre Merkezi"
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                İl (Şehir) *
              </Label>
              <Select
                value={city}
                onValueChange={(newCity) => {
                  setCity(newCity);
                  const dists = getDistrictsForCity(newCity);
                  if (dists.length > 0) {
                    setDistrict(dists[0]);
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
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                İlçe / Bölge *
              </Label>
              <Select value={district} onValueChange={setDistrict}>
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
            <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              Mekan Kategorisi
            </Label>
            <Select value={category} onValueChange={setCategory}>
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
                className={
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900"
                }
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
            <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              Açık Adres
            </Label>
            <Textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Cadde, sokak, mahalle detayları"
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div>
            <Label className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              Google Maps / Yol Tarifi Linki
            </Label>
            <Input
              type="url"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className={`mt-1 text-xs font-mono ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* Quick Assign from Personnel */}
          {/* Tesis / İşletme Sorumlusu Seçimi */}
          <div className={`pt-2 border-t space-y-2.5 ${theme === "dark" ? "border-slate-800/60" : "border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <Label className={`text-xs font-semibold ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>
                🏢 Tesis / İşletme Sorumlusu
              </Label>
              <span className={`text-[10px] ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Personel Rehberinden</span>
            </div>

            {personnelList.length > 0 ? (
              <div className="space-y-2">
                <Select
                  value={managerPersonnelId || (managerName ? "custom" : "none")}
                  onValueChange={(val) => {
                    if (val === "none") {
                      setManagerPersonnelId("");
                      setManagerName("");
                      setManagerTitle("");
                      setManagerPhone("");
                    } else if (val === "custom") {
                      setManagerPersonnelId("");
                    } else {
                      setManagerPersonnelId(val);
                      const p = personnelList.find((x) => x.id === val);
                      if (p) {
                        setManagerName(p.name);
                        setManagerTitle(p.title || "Tesis Sorumlusu");
                        setManagerPhone(p.phone || "");
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
                    {personnelList.map((p) => (
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
                {managerPersonnelId && managerName && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      theme === "dark"
                        ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-200"
                        : "bg-indigo-50/80 border-indigo-200 text-indigo-900"
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-xs">👤 {managerName}</span>
                      <span className="text-[10px] opacity-80 block">
                        {managerTitle || "Tesis Sorumlusu"} • 📞 {managerPhone || "Telefon Belirtilmedi"}
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
            {(personnelList.length === 0 || (!managerPersonnelId && managerName !== "")) && (
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
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
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
                      value={managerTitle}
                      onChange={(e) => setManagerTitle(e.target.value)}
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
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(normalizeTRPhoneInput(e.target.value))}
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
                  onClick={() => setColor(c.hex)}
                  className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer ${
                    color === c.hex
                      ? "border-white scale-110 shadow-md ring-2 ring-indigo-400"
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={`h-6 w-8 rounded cursor-pointer border ${
                  theme === "dark" ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"
                }`}
                title="Özel Renk Seç"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className={`text-xs h-8 ${
                theme === "dark"
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs"
            >
              Değişiklikleri Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
