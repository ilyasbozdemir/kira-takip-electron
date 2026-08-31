import React, { useState } from "react";
import {
  DollarSign,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Building2,
  Calendar as CalendarIcon,
  Receipt,
  CreditCard,
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
import { type Venue, toKey } from "@/lib/rental-store";
import { toast } from "sonner";

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  initialType?: "income" | "expense";
  venues: Venue[];
  onSave: (transaction: any) => Promise<void> | void;
}

export const INCOME_CATEGORIES = [
  "Kira & Tahsis Geliri",
  "Ek Hizmet & Catering",
  "Depozito & Güvence Bedeli",
  "Ses, Işık & Sahne Kiralama",
  "Otopark & Tesis Geliri",
  "Sponsorluk & Bağış",
  "Diğer İşletme Geliri",
];

export const EXPENSE_CATEGORIES = [
  "Personel & Maaş & SGK",
  "Elektrik & Su & Doğalgaz",
  "Temizlik & Hijyen & Sarf Malzeme",
  "Bakım, Onarım & Tadilat",
  "İkram, Catering & Tedarikçi",
  "Kira & Stopaj & Vergiler",
  "Reklam, Tanıtım & Dijital",
  "Kırtasiye & Büro Masrafları",
  "Güvenlik & Danışmanlık",
  "Diğer İşletme Gideri",
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  open,
  onOpenChange,
  theme,
  initialType = "expense",
  venues,
  onSave,
}) => {
  const isDark = theme === "dark";

  const [type, setType] = useState<"income" | "expense">(initialType);
  const [category, setCategory] = useState<string>(
    initialType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
  );
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>(() => toKey(new Date()));
  const [paymentMethod, setPaymentMethod] = useState<string>("Banka / Havale");
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [venueId, setVenueId] = useState<string>("all");
  const [customerName, setCustomerName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  React.useEffect(() => {
    setType(initialType);
    setCategory(
      initialType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
    );
  }, [initialType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Lütfen geçerli bir tutar girin.");
      return;
    }
    if (!category) {
      toast.error("Lütfen bir kategori seçin.");
      return;
    }

    try {
      await onSave({
        type,
        category,
        amount: Number(amount),
        date: date || toKey(new Date()),
        paymentMethod: paymentMethod || "Nakit",
        receiptNo: receiptNo.trim() || undefined,
        venueId: venueId !== "all" ? venueId : undefined,
        customerName: customerName.trim() || undefined,
        description: description.trim() || undefined,
      });

      toast.success(
        type === "expense" ? "Gider kaydı eklendi." : "Gelir kaydı eklendi."
      );
      onOpenChange(false);
      setAmount("");
      setReceiptNo("");
      setCustomerName("");
      setDescription("");
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-md ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            {type === "expense" ? (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            )}
            {type === "expense" ? "Yeni İşletme Gideri Kaydet" : "Yeni Kasa Geliri Kaydet"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {type === "expense"
              ? "Tesis harcaması, fatura, personel ödemesi veya sarf malzeme gideri ekleyin."
              : "Kira dışı ek gelir, depozito, ikram veya tesis gelirini kasaya işleyin."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-xs">
          {/* Type Selector (Gelir vs Gider) */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory(EXPENSE_CATEGORIES[0]);
              }}
              className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5" /> Gider (Harcama)
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory(INCOME_CATEGORIES[0]);
              }}
              className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" /> Gelir (Tahsilat)
            </button>
          </div>

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
                placeholder="0.00 TL"
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
              placeholder="Örn: Enerji A.Ş. / Ahmet Usta / Tedarikçi Firma"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Açıklama & Detay Notu</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Harcamanın veya gelirin detayları, ay bilgisi vb."
              className="mt-1 text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              size="sm"
              className={`text-white text-xs h-8 font-semibold shadow-xs ${
                type === "expense"
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {type === "expense" ? "Gideri Kaydet" : "Geliri Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
