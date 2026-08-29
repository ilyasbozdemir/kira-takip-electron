import React, { useState, useMemo } from "react";
import type { Customer, Store } from "@/lib/rental-store";
import {
  Building,
  Check,
  FileText,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CustomersScreenProps {
  theme: "dark" | "light";
  store: Store;
  onAddCustomer: (c: Omit<Customer, "id">) => Promise<void>;
  onUpdateCustomer: (c: Customer) => Promise<void>;
  onRemoveCustomer: (id: string) => Promise<void>;
  onOpenMailModal?: (recipientEmail?: string) => void;
}

export function CustomersScreen({
  theme,
  store,
  onAddCustomer,
  onUpdateCustomer,
  onRemoveCustomer,
  onOpenMailModal,
}: CustomersScreenProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [taxNo, setTaxNo] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Combine registered CRM customers + unique reservation customers automatically
  const combinedCustomersList = useMemo(() => {
    const list: Customer[] = [...(store.customers || [])];
    const registeredNames = new Set(
      list.map((c) => c.name.toLowerCase().trim())
    );

    // Find reservations with customer names not yet explicitly in CRM
    const mapByCustomer = new Map<string, { name: string; phone: string; count: number }>();
    for (const r of store.reservations) {
      if (!r.customer) continue;
      const key = r.customer.toLowerCase().trim();
      if (registeredNames.has(key)) continue;

      if (!mapByCustomer.has(key)) {
        mapByCustomer.set(key, { name: r.customer, phone: r.phone || "", count: 1 });
      } else {
        const item = mapByCustomer.get(key)!;
        item.count += 1;
        if (!item.phone && r.phone) item.phone = r.phone;
      }
    }

    // Convert map to virtual Customer items
    mapByCustomer.forEach((val, key) => {
      list.push({
        id: `auto_${key}`,
        name: val.name,
        phone: val.phone,
        notes: "Etkinlik kiralama kayıtlarından otomatik derlendi",
      });
    });

    return list;
  }, [store.customers, store.reservations]);

  const filteredCustomers = combinedCustomersList.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      (c.email || "").toLowerCase().includes(query) ||
      (c.company || "").toLowerCase().includes(query) ||
      (c.taxNo || "").toLowerCase().includes(query)
    );
  });

  const handleOpenAddModal = () => {
    setName("");
    setPhone("");
    setEmail("");
    setCompany("");
    setTaxNo("");
    setAddress("");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || "");
    setCompany(c.company || "");
    setTaxNo(c.taxNo || "");
    setAddress(c.address || "");
    setNotes(c.notes || "");
  };

  const handleSaveNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Lütfen müşteri adını girin.");
      return;
    }

    try {
      await onAddCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        taxNo: taxNo.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setIsAddModalOpen(false);
      toast.success("Müşteri başarıyla CRM rehberine eklendi!");
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !name.trim()) return;

    try {
      if (editingCustomer.id.startsWith("auto_")) {
        // Promote auto-derived customer to permanent CRM entry
        await onAddCustomer({
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
        await onUpdateCustomer({
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
      setEditingCustomer(null);
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  const getCustomerReservationCount = (cName: string, cPhone: string) => {
    return store.reservations.filter((r) => {
      const matchName = r.customer.toLowerCase().includes(cName.toLowerCase());
      const matchPhone = cPhone && r.phone && r.phone.replace(/\D/g, "").includes(cPhone.replace(/\D/g, ""));
      return matchName || matchPhone;
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-xl font-bold tracking-tight ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Müşteri Rehberi & CRM Yönetimi
          </h2>
          <p
            className={`text-xs mt-1 ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Müşterileri kaydedin, kiralamalarını takip edin, hızlı iletişim kurun.
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 shadow-md flex items-center gap-1.5 px-4 shrink-0"
        >
          <Plus className="h-4 w-4" /> Yeni Müşteri Ekle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400">
              Toplam Kayıtlı Müşteri
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            <div className="text-2xl font-extrabold text-indigo-400">
              {combinedCustomersList.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Rehberde kayıtlı müşteri & kurum
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400">
              Kurumsal / Şirket Müşterileri
            </CardTitle>
            <Building className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            <div className="text-2xl font-extrabold text-sky-400">
              {combinedCustomersList.filter((c) => c.company || c.taxNo).length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Fatura / Vergi No tanımlı kurumsal üye
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400">
              Toplam Etkinlik & Kiralama
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            <div className="text-2xl font-extrabold text-emerald-400">
              {store.reservations.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sistemde işlem görmüş kiralama kaydı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Müşteri adı, telefon, e-posta veya vergi no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-9 text-xs h-9 rounded-xl ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs"
          }`}
        />
      </div>

      {/* Customers List Grid */}
      {filteredCustomers.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            theme === "dark"
              ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <Users className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-300">
            {searchTerm ? "Aramanıza uygun müşteri bulunamadı." : "Henüz Müşteri Kaydı Yok"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "Arama kriterlerini değiştirip tekrar deneyebilirsiniz."
              : "Müşterilerinizi rehbere ekleyerek salon kiralamalarında tek tıkla seçebilirsiniz."}
          </p>
          {!searchTerm && (
            <Button
              onClick={handleOpenAddModal}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> İlk Müşteriyi Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const resCount = getCustomerReservationCount(c.name, c.phone);
            return (
              <Card
                key={c.id}
                className={`transition-all hover:border-indigo-500/50 ${
                  theme === "dark"
                    ? "bg-slate-900/90 border-slate-800"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <CardHeader className="pb-2.5 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-sm shrink-0">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold truncate max-w-[180px] ${
                          theme === "dark" ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {c.name}
                      </h4>
                      {c.company && (
                        <p className="text-[11px] text-sky-400 font-medium truncate max-w-[180px]">
                          🏢 {c.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold shrink-0"
                  >
                    {resCount} Kiralama
                  </Badge>
                </CardHeader>

                <CardContent className="px-4 pb-4 space-y-2.5 text-xs">
                  <div className="space-y-1 text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-200 font-medium">
                        {c.phone || "Telefon Belirtilmedi"}
                      </span>
                    </div>

                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-300">{c.email}</span>
                      </div>
                    )}

                    {c.taxNo && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono text-[11px] text-slate-400">
                          VN/TC: {c.taxNo}
                        </span>
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <p
                      className={`text-[11px] p-2 rounded-lg border leading-snug line-clamp-2 ${
                        theme === "dark"
                          ? "bg-slate-950/60 border-slate-800 text-slate-400"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      💬 {c.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                      {c.email && onOpenMailModal && (
                        <button
                          type="button"
                          onClick={() => onOpenMailModal(c.email)}
                          className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold hover:bg-indigo-500/20 transition-colors"
                        >
                          Mail At
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(c)}
                        className="h-7 w-7 text-slate-400 hover:text-indigo-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm(`${c.name} isimli müşteriyi silmek istediğinize emin misiniz?`)) {
                            await onRemoveCustomer(c.id);
                            toast.success("Müşteri kaydı silindi.");
                          }
                        }}
                        className="h-7 w-7 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent
          className={
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-900"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" /> Yeni Müşteri / Kurum Ekle
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              CRM müşteri rehberine yeni şahıs veya şirket kaydı ekleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNewCustomer} className="space-y-3.5 pt-2">
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
                <Label className="text-xs font-semibold">Telefon Numarası *</Label>
                <Input
                  required
                  placeholder="0555 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">E-posta Adresi</Label>
                <Input
                  type="email"
                  placeholder="ahmet@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Şirket / Kurum Adı</Label>
                <Input
                  placeholder="örn: Yılmaz Holding A.Ş."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Vergi No / T.C. No</Label>
                <Input
                  placeholder="1234567890"
                  value={taxNo}
                  onChange={(e) => setTaxNo(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Adres</Label>
              <Input
                placeholder="Açık adres bilgisi..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Özel Notlar</Label>
              <Input
                placeholder="Müşteri hakkında özel tercihler..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs h-9"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9"
              >
                <Plus className="h-4 w-4 mr-1" /> Müşteriyi Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CUSTOMER MODAL */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent
          className={
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-900"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-indigo-500" /> Müşteri Bilgilerini Düzenle
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditCustomer} className="space-y-3.5 pt-2">
            <div>
              <Label className="text-xs font-semibold">Müşteri Adı / Soyadı *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Telefon Numarası *</Label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">E-posta Adresi</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Şirket / Kurum Adı</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Vergi No / T.C. No</Label>
                <Input
                  value={taxNo}
                  onChange={(e) => setTaxNo(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Adres</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Özel Notlar</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCustomer(null)}
                className="text-xs h-9"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9"
              >
                <Check className="h-4 w-4 mr-1" /> Değişiklikleri Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
