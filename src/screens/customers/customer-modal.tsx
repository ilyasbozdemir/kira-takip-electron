import React, { useState, useEffect } from "react";
import type { Customer } from "@/lib/rental-store";
import { Check, Users } from "lucide-react";
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
import { normalizeTRPhoneInput } from "@/lib/phone-utils";
import { toast } from "sonner";

interface CustomerModalProps {
  theme: "dark" | "light";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: Customer | null;
  onSaveNew: (c: Omit<Customer, "id">) => Promise<void>;
  onSaveEdit: (c: Customer) => Promise<void>;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  theme,
  isOpen,
  onOpenChange,
  editingCustomer,
  onSaveNew,
  onSaveEdit,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [taxNo, setTaxNo] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setPhone(editingCustomer.phone || "");
      setEmail(editingCustomer.email || "");
      setCompany(editingCustomer.company || "");
      setTaxNo(editingCustomer.taxNo || "");
      setAddress(editingCustomer.address || "");
      setNotes(editingCustomer.notes || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setTaxNo("");
      setAddress("");
      setNotes("");
    }
  }, [editingCustomer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Lütfen müşteri adını girin.");
      return;
    }

    try {
      if (editingCustomer) {
        if (editingCustomer.id.startsWith("auto_")) {
          await onSaveNew({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            company: company.trim() || undefined,
            taxNo: taxNo.trim() || undefined,
            address: address.trim() || undefined,
            notes: notes.trim() || undefined,
          });
          toast.success("Müşteri kalıcı CRM rehberine eklendi!");
        } else {
          await onSaveEdit({
            ...editingCustomer,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            company: company.trim() || undefined,
            taxNo: taxNo.trim() || undefined,
            address: address.trim() || undefined,
            notes: notes.trim() || undefined,
          });
          toast.success("Müşteri bilgileri güncellendi!");
        }
      } else {
        await onSaveNew({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          company: company.trim() || undefined,
          taxNo: taxNo.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Müşteri başarıyla CRM rehberine eklendi!");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          theme === "dark"
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />{" "}
            {editingCustomer ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri / Kurum Ekle"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {editingCustomer
              ? "Kayıtlı müşteri bilgilerini güncelleyin veya not ekleyin."
              : "CRM müşteri rehberine yeni şahıs veya şirket kaydı ekleyin."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div>
            <Label className="text-xs font-semibold">Müşteri Adı / Soyadı *</Label>
            <Input
              required
              placeholder="örn: Ahmet Yılmaz / Anadolu Org. Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Telefon</span>
                <span className="text-[10px] text-slate-400 font-normal">05XX...</span>
              </Label>
              <Input
                placeholder="0532 123 45 67"
                value={phone}
                onChange={(e) => setPhone(normalizeTRPhoneInput(e.target.value))}
                className="mt-1 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">E-posta</Label>
              <Input
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Kurum / Şirket Adı</Label>
              <Input
                placeholder="varsa şirket unvanı"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Vergi No / TC Kimlik</Label>
              <Input
                placeholder="Vergi / TC No"
                value={taxNo}
                onChange={(e) => setTaxNo(e.target.value)}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Adres / Konum</Label>
            <Input
              placeholder="Fatura veya tebligat adresi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Özel Notlar / Açıklama</Label>
            <Input
              placeholder="Örn: VIP müşteri, indirim protokolü mevcut vb."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold"
            >
              <Check className="h-3.5 w-3.5 mr-1" />{" "}
              {editingCustomer ? "Güncelle" : "Müşteriyi Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
