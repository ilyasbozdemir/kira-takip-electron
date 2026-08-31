import React, { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { type Hall, type PricingType } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { toast } from "sonner";

interface EditHallModalProps {
  theme: "dark" | "light";
  editingHall: { venueId: string; hall: Hall } | null;
  onClose: () => void;
}

export const EditHallModal: React.FC<EditHallModalProps> = ({
  theme,
  editingHall,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState<number>(100);
  const [hourlyPrice, setHourlyPrice] = useState<number>(0);
  const [pricingType, setPricingType] = useState<PricingType>("session");
  const [color, setColor] = useState<string>("#8b5cf6");

  useEffect(() => {
    if (editingHall) {
      setName(editingHall.hall.name);
      setFloor(editingHall.hall.floor || "");
      setCapacity(editingHall.hall.capacity ?? 100);
      setHourlyPrice(editingHall.hall.hourlyPrice ?? 0);
      setPricingType(editingHall.hall.pricingType || "session");
      setColor(editingHall.hall.color || "#8b5cf6");
    } else {
      setName("");
      setFloor("");
      setCapacity(100);
      setHourlyPrice(0);
      setPricingType("session");
      setColor("#8b5cf6");
    }
  }, [editingHall]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingHall || !name.trim()) {
      toast.error("Salon adı zorunludur.");
      return;
    }

    try {
      await sqliteStore.updateHall({
        id: editingHall.hall.id,
        venueId: editingHall.venueId,
        name: name.trim(),
        floor: floor.trim() || "Zemin Kat",
        capacity: Number(capacity) || 100,
        hourlyPrice: Number(hourlyPrice) || 0,
        pricingType,
        color: color || "#8b5cf6",
      });
      toast.success("Salon bilgileri güncellendi.");
      onClose();
    } catch (err: any) {
      toast.error(`Güncelleme hatası: ${err.message || err}`);
    }
  };

  return (
    <Dialog
      open={!!editingHall}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-105 bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-105 bg-white border-slate-200 text-slate-900 shadow-2xl"}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-base font-bold flex items-center gap-2 ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            <Layers className="h-5 w-5 text-indigo-500" />{" "}
            Salon Bilgilerini Düzenle
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Salon adı, kapasite, ücretlendirme modeli ve takvim rengini güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5 py-2 text-xs">
          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Salon Adı *
            </Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn: Safir Balo Salonu, Konferans Salonu"
              className={`mt-1 text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Kat / Blok Bilgisi
              </Label>
              <Input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="örn: Zemin Kat / A Blok"
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
                Kapasite (Kişi)
              </Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) =>
                  setCapacity(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )}
                placeholder="100"
                className={`mt-1 text-xs ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Fiyatlandırma Modeli
              </Label>
              <Select
                value={pricingType}
                onValueChange={(val: PricingType) => setPricingType(val)}
              >
                <SelectTrigger className="mt-1 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="session">🎫 Seanslık / Paket</SelectItem>
                  <SelectItem value="hourly">⏱️ Saatlik Ücret</SelectItem>
                  <SelectItem value="daily">📅 Günlük Sabit Ücret</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {pricingType === "hourly"
                  ? "Saatlik Kira Ücreti (TL)"
                  : pricingType === "daily"
                  ? "Günlük Kira Ücreti (TL)"
                  : "Seanslık / Paket Ücreti (TL)"}
              </Label>
              <Input
                type="number"
                value={hourlyPrice}
                onChange={(e) =>
                  setHourlyPrice(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )}
                placeholder="0"
                className={`mt-1 text-xs font-semibold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div>
            <Label
              className={`text-xs font-medium block mb-1.5 ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              🎨 Salon Takvim Etkinlik Rengi
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { name: "Mor", hex: "#8b5cf6" },
                { name: "İndigo", hex: "#6366f1" },
                { name: "Zümrüt", hex: "#10b981" },
                { name: "Kehribar", hex: "#f59e0b" },
                { name: "Gül", hex: "#ef4444" },
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
                className="h-6 w-8 rounded cursor-pointer border border-slate-700 bg-transparent"
                title="Özel Renk Seç"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold"
            >
              Değişiklikleri Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
