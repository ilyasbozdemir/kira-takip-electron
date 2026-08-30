import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
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
import { type Venue, type Personnel } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { normalizeTRPhoneInput } from "@/lib/phone-utils";
import { toast } from "sonner";

interface EditVenueModalProps {
  theme: "dark" | "light";
  editingVenue: Venue | null;
  onClose: () => void;
  personnelList: Personnel[];
}

export const EditVenueModal: React.FC<EditVenueModalProps> = ({
  theme,
  editingVenue,
  onClose,
  personnelList,
}) => {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [managerPersonnelId, setManagerPersonnelId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerTitle, setManagerTitle] = useState("");

  useEffect(() => {
    if (editingVenue) {
      setName(editingVenue.name);
      setDistrict(editingVenue.district);
      setCategory(editingVenue.category || "");
      setAddress(editingVenue.address || "");
      setMapUrl(editingVenue.mapUrl || "");
      setManagerName(editingVenue.managerName || "");
      setManagerPhone(editingVenue.managerPhone || "");
      setManagerTitle(editingVenue.managerTitle || "");
      setManagerPersonnelId("");
    }
  }, [editingVenue]);

  const handleSave = async () => {
    if (!editingVenue || !name.trim() || !district.trim()) {
      toast.error("Mekan adı ve ilçe zorunludur.");
      return;
    }

    try {
      await sqliteStore.updateVenue(editingVenue.id, {
        name: name.trim(),
        district: district.trim(),
        category: category.trim() || undefined,
        address: address.trim() || undefined,
        mapUrl: mapUrl.trim() || undefined,
        managerName: managerName.trim() || undefined,
        managerPhone: managerPhone.trim() || undefined,
        managerTitle: managerTitle.trim() || undefined,
      });
      toast.success("Mekan bilgileri güncellendi.");
      onClose();
    } catch (err: any) {
      toast.error(`Güncelleme hatası: ${err.message || err}`);
    }
  };

  return (
    <Dialog open={!!editingVenue} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" /> Mekan / Tesis Bilgilerini Düzenle
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Tesis adı, konumu ve sorumlu personel bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 pt-2 text-xs">
          <div>
            <Label className="text-xs font-semibold">Mekan / Tesis Adı *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Kültür ve Kongre Merkezi"
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">İlçe / Bölge *</Label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Örn: Çankaya"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Tesis Kategorisi</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Örn: Kültür Merkezi, Spor Salonu"
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Açık Adres</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Cadde, sokak, mahalle detayları"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Harita / Yol Tarifi Bağlantısı</Label>
            <Input
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="mt-1 text-xs font-mono"
            />
          </div>

          {/* Quick Assign from Personnel */}
          {personnelList.length > 0 && (
            <div className="pt-1">
              <Label className="text-xs font-semibold text-indigo-400">Personel Rehberinden Sorumlu Ata</Label>
              <Select
                value={managerPersonnelId}
                onValueChange={(val) => {
                  setManagerPersonnelId(val);
                  const p = personnelList.find((x) => x.id === val);
                  if (p) {
                    setManagerName(p.name);
                    setManagerPhone(p.phone || "");
                    setManagerTitle(p.title || "");
                  }
                }}
              >
                <SelectTrigger className="mt-1 text-xs h-8">
                  <SelectValue placeholder="Kayıtlı personellerden seç..." />
                </SelectTrigger>
                <SelectContent className={theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"}>
                  {personnelList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.title ? `(${p.title})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <Label className="text-xs font-semibold">Sorumlu Adı</Label>
              <Input
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Müdür / Amir"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Sorumlu Telefon</Label>
              <Input
                value={managerPhone}
                onChange={(e) => setManagerPhone(normalizeTRPhoneInput(e.target.value))}
                placeholder="0532..."
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
            Değişiklikleri Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
