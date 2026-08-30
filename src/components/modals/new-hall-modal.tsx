import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewHallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  newHallName: string;
  setNewHallName: (v: string) => void;
  newHallFloor: string;
  setNewHallFloor: (v: string) => void;
  newHallCapacity: number;
  setNewHallCapacity: (v: number) => void;
  newHallHourlyPrice: number;
  setNewHallHourlyPrice: (v: number) => void;
  newHallColor: string;
  setNewHallColor: (v: string) => void;
  handleCreateHall: (
    e: React.FormEvent,
    onSuccess?: () => void,
  ) => Promise<void> | void;
}

export function NewHallModal({
  open,
  onOpenChange,
  theme,
  newHallName,
  setNewHallName,
  newHallFloor,
  setNewHallFloor,
  newHallCapacity,
  setNewHallCapacity,
  newHallHourlyPrice,
  setNewHallHourlyPrice,
  newHallColor,
  setNewHallColor,
  handleCreateHall,
}: NewHallModalProps): React.JSX.Element {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateHall(e, () => {
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-[400px] bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-[400px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-base font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Mekana Salon / Alan Ekle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label
              className={`text-xs font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Salon Adı
            </Label>
            <Input
              required
              placeholder="örn: Safir Balo Salonu"
              value={newHallName}
              onChange={(e) => setNewHallName(e.target.value)}
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
              Kat / Blok Bilgisi
            </Label>
            <Input
              placeholder="örn: Zemin Kat / A Blok"
              value={newHallFloor}
              onChange={(e) => setNewHallFloor(e.target.value)}
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
                Kapasite (Kişi)
              </Label>
              <Input
                type="number"
                value={newHallCapacity}
                onChange={(e) => setNewHallCapacity(Number(e.target.value))}
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
                Saatlik Kira (TL)
              </Label>
              <Input
                type="number"
                value={newHallHourlyPrice}
                onChange={(e) => setNewHallHourlyPrice(Number(e.target.value))}
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
                  onClick={() => setNewHallColor(c.hex)}
                  className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer ${
                    newHallColor === c.hex
                      ? "border-white scale-110 shadow-md ring-2 ring-indigo-400"
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={newHallColor}
                onChange={(e) => setNewHallColor(e.target.value)}
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
              Salon Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
