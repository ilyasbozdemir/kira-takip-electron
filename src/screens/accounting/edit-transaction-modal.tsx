import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FinancialTransaction, type Venue } from "@/lib/rental-store";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "./new-transaction-modal";
import { toast } from "sonner";

interface EditTransactionModalProps {
  transaction: FinancialTransaction | null;
  onClose: () => void;
  theme: "dark" | "light";
  venues: Venue[];
  onUpdate: (transaction: FinancialTransaction) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  onClose,
  theme,
  venues,
  onUpdate,
  onDelete,
}) => {
  const isDark = theme === "dark";

  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Banka / Havale");
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [venueId, setVenueId] = useState<string>("all");
  const [customerName, setCustomerName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setCategory(transaction.category);
      setAmount(transaction.amount);
      setDate(transaction.date);
      setPaymentMethod(transaction.paymentMethod || "Banka / Havale");
      setReceiptNo(transaction.receiptNo || "");
      setVenueId(transaction.venueId || "all");
      setCustomerName(transaction.customerName || "");
      setDescription(transaction.description || "");
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Lütfen geçerli bir tutar girin.");
      return;
    }

    try {
      await onUpdate({
        ...transaction,
        type,
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        receiptNo: receiptNo.trim() || undefined,
        venueId: venueId !== "all" ? venueId : undefined,
        customerName: customerName.trim() || undefined,
        description: description.trim() || undefined,
      });

      toast.success("Kasa kaydı güncellendi.");
      onClose();
    } catch (err: any) {
      toast.error(`Güncelleme hatası: ${err.message || err}`);
    }
  };

  const handleDelete = async () => {
    if (confirm("Bu muhasebe / kasa hareketini silmek istediğinize emin misiniz?")) {
      try {
        await onDelete(transaction.id);
        toast.success("Kayıt silindi.");
        onClose();
      } catch (err: any) {
        toast.error(`Silme hatası: ${err.message || err}`);
      }
    }
  };

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`max-w-md ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-indigo-500" />
              Kasa / Muhasebe Kaydını Düzenle
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
              title="Kaydı Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            İşlem detaylarını ve tutarını güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5 py-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Tutar (TL) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`mt-1 text-xs font-mono font-bold ${
                  type === "expense" ? "text-rose-400" : "text-emerald-400"
                }`}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">İşlem Tarihi *</Label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Kategori *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`max-h-60 ${
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {(type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(
                    (cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Ödeme Yöntemi</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="Nakit">💵 Nakit Kasa</SelectItem>
                  <SelectItem value="Banka / Havale">🏦 Banka / Havale / EFT</SelectItem>
                  <SelectItem value="Kredi Kartı">💳 Kredi Kartı / POS</SelectItem>
                  <SelectItem value="Çek / Senet">📄 Çek / Senet</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">İlgili Tesis / Mekan</Label>
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger className="mt-1 text-xs h-8">
                  <SelectValue placeholder="Genel İşletme (Tümü)" />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-200"
                      : "bg-white border-slate-200 text-slate-900"
                  }
                >
                  <SelectItem value="all">Genel İşletme (Tümü)</SelectItem>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      🏢 {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Fatura / Fiş / Makbuz No</Label>
              <Input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="Örn: GID-2026/042"
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Muhatap / Tedarikçi / Kişi</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Örn: Enerji A.Ş. / Ahmet Usta"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Açıklama & Detay Notu</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notlar..."
              className="mt-1 text-xs resize-none"
            />
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
