import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Venue } from "@/lib/rental-store";

interface NewVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  newVenueName: string;
  setNewVenueName: (v: string) => void;
  newVenueDistrict: string;
  setNewVenueDistrict: (v: string) => void;
  newVenueAddress: string;
  setNewVenueAddress: (v: string) => void;
  newVenueMapUrl: string;
  setNewVenueMapUrl: (v: string) => void;
  newVenueCategory: string;
  setNewVenueCategory: (v: string) => void;
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
  handleCreateVenue: (e: React.FormEvent) => void;
}

export function NewVenueModal({
  open,
  onOpenChange,
  theme,
  newVenueName,
  setNewVenueName,
  newVenueDistrict,
  setNewVenueDistrict,
  newVenueAddress,
  setNewVenueAddress,
  newVenueMapUrl,
  setNewVenueMapUrl,
  newVenueCategory,
  setNewVenueCategory,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-[420px] bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-[420px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
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

        <form onSubmit={handleCreateVenue} className="space-y-4 py-2">
          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Mekan / İşletme Adı
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
          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Konum / İlçe *
            </Label>
            <Input
              required
              placeholder="örn: Kadıköy / Çankaya"
              value={newVenueDistrict}
              onChange={(e) => setNewVenueDistrict(e.target.value)}
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
              Açık Adres Açıklaması (İsteğe Bağlı)
            </Label>
            <Textarea
              rows={2}
              placeholder="örn: Atatürk Mah. Cumhuriyet Cad. No:142 Kadıköy / İstanbul"
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
              Google Maps / Konum Linki (İsteğe Bağlı)
            </Label>
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={newVenueMapUrl}
              onChange={(e) => setNewVenueMapUrl(e.target.value)}
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          {store.personnel && store.personnel.length > 0 && (
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Kayıtlı Personel Kadrosundan Seç
              </Label>
              <Select
                onValueChange={(pId) => {
                  const p = store.personnel?.find((x) => x.id === pId);
                  if (p) {
                    setNewVenueManagerName(p.name);
                    setNewVenueManagerTitle(p.title || "Tesis Sorumlusu");
                    setNewVenueManagerPhone(p.phone || "");
                  }
                }}
              >
                <SelectTrigger
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <SelectValue placeholder="Kadro dışı / Manuel Gir" />
                </SelectTrigger>
                <SelectContent
                  className={theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900"}
                >
                  {store.personnel.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      👤 {p.name} ({p.title || "Personel"}) - 📞 {p.phone || "Tel Yok"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/40 space-y-3">
            <p className="text-[11px] font-bold text-indigo-400">
              🏢 Tesis / İşletme Sorumlusu İletişim Bilgileri
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Sorumlu Adı Soyadı</Label>
                <Input
                  placeholder="örn: Ahmet Yılmaz"
                  value={newVenueManagerName}
                  onChange={(e) => setNewVenueManagerName(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <Label className="text-[11px]">Görevi / Unvanı</Label>
                <Input
                  placeholder="örn: Tesis Sorumlusu"
                  value={newVenueManagerTitle}
                  onChange={(e) => setNewVenueManagerTitle(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-100"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>
            <div>
              <Label className="text-[11px]">Sorumlu İletişim Telefonu</Label>
              <Input
                placeholder="0532 000 00 00"
                value={newVenueManagerPhone}
                onChange={(e) => setNewVenueManagerPhone(e.target.value)}
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
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
                className={`mt-1 text-xs ${
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
                className="h-6 w-8 rounded cursor-pointer border border-slate-700 bg-transparent"
                title="Özel Renk Seç"
              />
            </div>
          </div>

          <DialogFooter>
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
