import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
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
import type { Personnel } from "@/lib/rental-store";
import { normalizeTRPhoneInput } from "@/lib/phone-utils";
import { toast } from "sonner";

interface PersonnelModalProps {
  theme: "dark" | "light";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPersonnel: Personnel | null;
  onSaveNew: (p: { name: string; title: string; phone: string; email: string; notes: string }) => void;
  onSaveEdit: (p: Personnel) => Promise<void>;
}

export const PersonnelModal: React.FC<PersonnelModalProps> = ({
  theme,
  isOpen,
  onOpenChange,
  editingPersonnel,
  onSaveNew,
  onSaveEdit,
}) => {
  const isDark = theme === "dark";

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingPersonnel) {
      setName(editingPersonnel.name);
      setTitle(editingPersonnel.title || "");
      setPhone(editingPersonnel.phone || "");
      setEmail(editingPersonnel.email || "");
      setNotes(editingPersonnel.notes || "");
    } else {
      setName("");
      setTitle("");
      setPhone("");
      setEmail("");
      setNotes("");
    }
  }, [editingPersonnel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Lütfen personel adını girin.");
      return;
    }

    try {
      if (editingPersonnel) {
        await onSaveEdit({
          ...editingPersonnel,
          name: name.trim(),
          title: title.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Personel bilgileri güncellendi.");
      } else {
        onSaveNew({
          name: name.trim(),
          title: title.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            {editingPersonnel ? "Personel Bilgilerini Düzenle" : "Yeni Görevli Personel Ekle"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {editingPersonnel
              ? "Kayıtlı personelin unvan, telefon ve görev detaylarını güncelleyin."
              : "Tesis veya salonlarda görevlendirilecek yeni personeli kaydedin."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 text-xs">
          <div>
            <Label className="text-xs font-semibold">Adı Soyadı *</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Mehmet Özkan"
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Görevi / Unvanı</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Tesis Müdürü, Güvenlik Amiri"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">İletişim Numarası</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(normalizeTRPhoneInput(e.target.value))}
                placeholder="0532..."
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Kurumsal E-posta</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="personel@kurum.bel.tr"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Ek Notlar / Nöbet Bilgisi</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Hafta sonu vardiyası sorumlusu"
              className="mt-1 text-xs"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-8">
              İptal
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold">
              {editingPersonnel ? "Güncelle" : "Personeli Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
