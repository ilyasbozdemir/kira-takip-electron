import React, { useState, useMemo } from "react";
import type { Customer } from "@/lib/rental-store";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { CustomerStatsHeader } from "./customer-stats-header";
import { CustomerCard } from "./customer-card";
import { CustomerModal } from "./customer-modal";
import { CustomersScreenProps } from "./types";

export function CustomersScreen({
  theme,
  store,
  onAddCustomer,
  onUpdateCustomer,
  onRemoveCustomer,
  onOpenMailModal,
}: CustomersScreenProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Combine registered CRM customers + unique reservation customers automatically
  const combinedCustomersList = useMemo(() => {
    const list: Customer[] = [...(store.customers || [])];
    const registeredNames = new Set(
      list.map((c) => c.name.toLowerCase().trim()),
    );

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

  const getCustomerReservationCount = (cName: string, cPhone: string) => {
    return store.reservations.filter((r) => {
      const matchName = r.customer.toLowerCase().includes(cName.toLowerCase());
      const matchPhone = cPhone && r.phone && r.phone.replace(/\D/g, "").includes(cPhone.replace(/\D/g, ""));
      return matchName || matchPhone;
    }).length;
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`${name} isimli müşteriyi silmek istediğinize emin misiniz?`)) {
      await onRemoveCustomer(id);
      toast.success("Müşteri kaydı silindi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats & Search */}
      <CustomerStatsHeader
        theme={theme}
        totalCustomers={combinedCustomersList.length}
        corporateCount={combinedCustomersList.filter((c) => c.company || c.taxNo).length}
        totalReservations={store.reservations.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAddModal={handleOpenAddModal}
      />

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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((c) => (
                <CustomerCard
                  key={c.id}
                  theme={theme}
                  customer={c}
                  reservationCount={getCustomerReservationCount(c.name, c.phone)}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteCustomer}
                  onOpenMailModal={onOpenMailModal}
                />
              ))}
          </div>

          {/* Pagination Controls */}
          {filteredCustomers.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredCustomers.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24, 48, 96]}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(s) => setPageSize(s)}
              theme={theme}
              itemLabel="müşteri"
            />
          )}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        theme={theme}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingCustomer={editingCustomer}
        onSaveNew={onAddCustomer}
        onSaveEdit={onUpdateCustomer}
      />
    </div>
  );
}

export * from "./types";
