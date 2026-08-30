import React, { useState, useMemo } from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { VenueStatsHeader } from "./venue-stats-header";
import { VenueCard } from "./venue-card";
import { EditVenueModal } from "./edit-venue-modal";
import { EditHallModal } from "./edit-hall-modal";
import { VenuesScreenProps } from "./types";
import { type Hall, type Venue } from "@/lib/rental-store";

export function VenuesScreen({
  theme,
  store,
  onOpenVenueModal,
  onOpenHallModal,
  onPromptDelete,
}: VenuesScreenProps): React.JSX.Element {
  const isDark = theme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Modal editing states
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editingHall, setEditingHall] = useState<{ venueId: string; hall: Hall } | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    store.venues.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [store.venues]);

  // Filtered venues
  const filteredVenues = useMemo(() => {
    return store.venues.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.halls.some((h) => h.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === "all" || v.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [store.venues, searchTerm, selectedCategory]);

  const totalHallsCount = store.venues.reduce((acc, v) => acc + v.halls.length, 0);
  const totalDistrictsCount = new Set(store.venues.map((v) => v.district)).size;

  return (
    <div className="space-y-6">
      {/* Header & Stats Overview */}
      <VenueStatsHeader
        theme={theme}
        totalVenues={store.venues.length}
        totalHalls={totalHallsCount}
        totalDistricts={totalDistrictsCount}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenVenueModal={onOpenVenueModal}
      />

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark
              ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <Building2 className="h-10 w-10 mx-auto text-slate-500 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-300">
            {searchTerm || selectedCategory !== "all"
              ? "Aramanıza veya filtreye uygun mekan bulunamadı."
              : "Henüz Kayıtlı Mekan / Tesis Yok"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== "all"
              ? "Farklı bir arama terimi veya kategori seçmeyi deneyin."
              : "İlk mekanınızı ekleyerek başlayın, ardından içine dilediğiniz kadar salon tanımlayın."}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <Button
              onClick={onOpenVenueModal}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> İlk Mekanı Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVenues
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((v) => (
                <VenueCard
                  key={v.id}
                  theme={theme}
                  venue={v}
                  onEditVenue={(venue) => setEditingVenue(venue)}
                  onDeleteVenue={(id, name) => onPromptDelete("venue", id, name)}
                  onAddHall={onOpenHallModal}
                  onEditHall={(venueId, hall) => setEditingHall({ venueId, hall })}
                  onDeleteHall={(venueId, hallId, hallName) =>
                    onPromptDelete("hall", hallId, hallName, venueId)
                  }
                />
              ))}
          </div>

          {/* Pagination Controls */}
          {filteredVenues.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredVenues.length}
              pageSize={pageSize}
              pageSizeOptions={[3, 6, 12, 24, 48]}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(s) => setPageSize(s)}
              theme={theme}
              itemLabel="mekan"
            />
          )}
        </div>
      )}

      {/* Edit Venue Dialog Modal */}
      <EditVenueModal
        theme={theme}
        editingVenue={editingVenue}
        onClose={() => setEditingVenue(null)}
        personnelList={store.personnel || []}
      />

      {/* Edit Hall Dialog Modal */}
      <EditHallModal
        theme={theme}
        editingHall={editingHall}
        onClose={() => setEditingHall(null)}
      />
    </div>
  );
}

export * from "./types";
