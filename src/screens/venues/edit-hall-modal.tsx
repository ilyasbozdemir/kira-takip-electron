import React, { useState, useEffect } from "react";
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
import { type Hall } from "@/lib/rental-store";
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

  useEffect(() => {
    if (editingHall) {
      setName(editingHall.hall.name);
      setFloor(editingHall.hall.floor);
      setCapacity(editingHall.hall.capacity);
      setHourlyPrice(editingHall.hall.hourlyPrice);
    }
  }, [editingHall]);

  const handleSave = async () => {
    if (!editingHall || !name.trim()) {
      toast.error("Salon adı zorunludur.");
      return;
    }

    try {
      await sqliteStore.updateHall(editingHall.venueId, {
        id: editingHall.hall.id,
        name: name.trim(),
        floor: floor.trim() || "Zemin Kat",
        capacity: Number(capacity) || 100,
        hourlyPrice: Number(hourlyPrice) || 0,
        color: editingHall.hall.color,
      });
      toast.success("Salon bilgileri güncellendi.");
      onClose();
    } catch (err: any) {
      toast.error(`Güncelleme hatası: ${err.message || err}`);
    }
  };

  return (
    <Dialog open={!!editingHall} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" /> Salon Bilgilerini Düzenle
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Salon adı, kat, kapasite ve saatlik kiralama tarifesini güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <div>
            <Label className="text-xs font-semibold">Salon Adı *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Konferans Salonu, Kapalı Spor Sahası"
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold">Kat / Konum</Label>
              <Input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Örn: 1. Kat"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Kapasite (Kişi)</Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                placeholder="100"
                className="mt-1 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Saatlik Ücret (TL)</Label>
              <Input
                type="number"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(Number(e.target.value))}
                placeholder="0"
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
            İptal
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold">
            Salonu Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
