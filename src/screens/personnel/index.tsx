import React, { useState, useMemo } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PersonnelStatsHeader } from "./personnel-stats-header";
import { PersonnelCard } from "./personnel-card";
import { PersonnelTable } from "./personnel-table";
import { PersonnelModal } from "./personnel-modal";
import { PersonnelScreenProps } from "./types";
import { type Personnel, type Venue } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { toast } from "sonner";

export function PersonnelScreen({
  theme,
  store,
  setPersonnelName,
  setPersonnelTitle,
  setPersonnelPhone,
  setPersonnelEmail,
  setPersonnelNotes,
  handleCreatePersonnel,
  removePersonnel,
  onOpenPersonnelModal,
}: PersonnelScreenProps): React.JSX.Element {
  const isDark = theme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenueFilter, setSelectedVenueFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedVenueFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  const personnelList = store.personnel || [];

  // Helper to find which venues a personnel manages
  const getAssignedVenues = (person: Personnel): Venue[] => {
    return store.venues.filter(
      (v) =>
        v.managerName?.toLowerCase() === person.name.toLowerCase() ||
        (person.phone && v.managerPhone && v.managerPhone.replace(/\D/g, "") === person.phone.replace(/\D/g, "")),
    );
  };

  const assignedPersonnelCount = useMemo(() => {
    return personnelList.filter((p) => getAssignedVenues(p).length > 0).length;
  }, [personnelList, store.venues]);

  const filteredPersonnel = useMemo(() => {
    return personnelList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      if (selectedVenueFilter === "all") return matchSearch;

      const targetVenue = store.venues.find((v) => v.id === selectedVenueFilter);
      if (!targetVenue) return matchSearch;

      const isManager =
        targetVenue.managerName?.toLowerCase() === p.name.toLowerCase() ||
        (p.phone && targetVenue.managerPhone && targetVenue.managerPhone.replace(/\D/g, "") === p.phone.replace(/\D/g, ""));

      return matchSearch && isManager;
    });
  }, [personnelList, store.venues, searchTerm, selectedVenueFilter]);

  const handleOpenAdd = () => {
    setEditingPersonnel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Personnel) => {
    setEditingPersonnel(p);
    setIsModalOpen(true);
  };

  const handleSaveNew = (p: { name: string; title: string; phone: string; email: string; notes: string }) => {
    setPersonnelName(p.name);
    setPersonnelTitle(p.title);
    setPersonnelPhone(p.phone);
    setPersonnelEmail(p.email);
    setPersonnelNotes(p.notes);
    handleCreatePersonnel({ preventDefault: () => {} } as any);
  };

  const handleSaveEdit = async (updated: Personnel) => {
    await sqliteStore.updatePersonnel(updated);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} isimli personeli silmek istediğinize emin misiniz?`)) {
      removePersonnel(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stats Overview */}
      <PersonnelStatsHeader
        theme={theme}
        totalPersonnel={personnelList.length}
        assignedCount={assignedPersonnelCount}
        totalVenues={store.venues.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedVenueFilter={selectedVenueFilter}
        setSelectedVenueFilter={setSelectedVenueFilter}
        venues={store.venues}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Main Content */}
      {filteredPersonnel.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark
              ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <Users className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-300">
            {searchTerm || selectedVenueFilter !== "all"
              ? "Aramanıza veya seçili tesise uygun personel bulunamadı."
              : "Henüz Personel Kaydı Yok"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedVenueFilter !== "all"
              ? "Arama kriterlerinizi değiştirip tekrar deneyin."
              : "Tesis yöneticilerini ve saha görevlilerini kaydederek mekanlara tek tıkla atayabilirsiniz."}
          </p>
          {!searchTerm && selectedVenueFilter === "all" && (
            <Button
              onClick={handleOpenAdd}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> İlk Personeli Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPersonnel
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((p) => (
                  <PersonnelCard
                    key={p.id}
                    theme={theme}
                    person={p}
                    assignedVenues={getAssignedVenues(p)}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          ) : (
            <PersonnelTable
              theme={theme}
              personnelList={filteredPersonnel.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              getAssignedVenues={getAssignedVenues}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Pagination */}
          {filteredPersonnel.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredPersonnel.length}
              pageSize={pageSize}
              pageSizeOptions={[4, 8, 16, 32, 64]}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(s) => setPageSize(s)}
              theme={theme}
              itemLabel="personel"
            />
          )}
        </div>
      )}

      {/* Personnel Add / Edit Modal */}
      <PersonnelModal
        theme={theme}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingPersonnel={editingPersonnel}
        onSaveNew={handleSaveNew}
        onSaveEdit={handleSaveEdit}
      />
    </div>
  );
}

export * from "./types";
