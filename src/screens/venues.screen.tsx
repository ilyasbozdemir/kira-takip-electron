import React from "react";
import { Building2, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { money, type Venue } from "@/lib/rental-store";

interface VenuesScreenProps {
  theme: "dark" | "light";
  store: {
    venues: Venue[];
  };
  onOpenVenueModal: () => void;
  onOpenHallModal: (venueId: string) => void;
  onPromptDelete: (type: "venue" | "hall", id: string, title: string, venueId?: string) => void;
}

export function VenuesScreen({
  theme,
  store,
  onOpenVenueModal,
  onOpenHallModal,
  onPromptDelete,
}: VenuesScreenProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className={`text-lg font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Mekanlar, Tesisler & Salonlar
          </h3>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Mekan ekleyin, kat bazlı salon ve saatlik kira tarifelerini düzenleyin.
          </p>
        </div>
        <Button
          onClick={onOpenVenueModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Yeni Mekan Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {store.venues.map((v) => (
          <Card
            key={v.id}
            className={theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"}
          >
            <CardHeader
              className={`flex flex-row items-center justify-between pb-3 border-b ${
                theme === "dark" ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div>
                <CardTitle
                  className={`text-base font-bold flex items-center gap-2 ${
                    theme === "dark" ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-indigo-500" /> {v.name}
                </CardTitle>
                <CardDescription
                  className={`text-xs mt-0.5 space-y-1 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  <div>
                    Konum: <strong className="text-indigo-400">{v.district}</strong> • Kategori:{" "}
                    {v.category || "Genel"}
                  </div>
                  {v.address && (
                    <div className="text-[11px] flex items-start gap-1 font-sans">
                      <MapPin className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{v.address}</span>
                    </div>
                  )}
                  {v.mapUrl && (
                    <div>
                      <a
                        href={v.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (window.electronAPI?.openExternalLink) {
                            e.preventDefault();
                            window.electronAPI.openExternalLink(v.mapUrl!);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-semibold hover:underline"
                      >
                        <MapPin className="h-3 w-3 text-sky-400" /> 🗺️ Google Maps'te Aç
                      </a>
                    </div>
                  )}
                  {v.managerName && (
                    <div
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between mt-2 ${
                        theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div>
                        <span className="font-bold">👤 Sorumlu:</span> {v.managerName}
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({v.managerTitle || "Tesis Sorumlusu"})
                        </span>
                      </div>
                      {v.managerPhone && (
                        <a
                          href={`https://wa.me/90${v.managerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (window.electronAPI?.openExternalLink) {
                              e.preventDefault();
                              window.electronAPI.openExternalLink(
                                `https://wa.me/90${v.managerPhone!.replace(/\D/g, "")}`,
                              );
                            }
                          }}
                          className="font-mono font-bold text-emerald-500 hover:underline flex items-center gap-1"
                        >
                          📞 {v.managerPhone}
                        </a>
                      )}
                    </div>
                  )}
                </CardDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onPromptDelete("venue", v.id, v.name)}
                className="h-8 w-8 text-slate-500 hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Salonlar ({v.halls.length})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenHallModal(v.id)}
                  className={`text-xs h-7 text-indigo-500 ${
                    theme === "dark" ? "border-slate-800" : "border-slate-300"
                  }`}
                >
                  <Plus className="h-3 w-3 mr-1" /> Salon Ekle
                </Button>
              </div>

              {v.halls.length === 0
                ? (
                  <p
                    className={`text-xs py-4 text-center ${
                      theme === "dark" ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Bu mekanda salon bulunmuyor.
                  </p>
                )
                : (
                  <div className="space-y-2">
                    {v.halls.map((h) => (
                      <div
                        key={h.id}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          theme === "dark"
                            ? "bg-slate-950 border-slate-800 text-slate-200"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-bold ${
                              theme === "dark" ? "text-slate-200" : "text-slate-900"
                            }`}
                          >
                            {h.name}
                          </p>
                          <p
                            className={`text-[11px] ${
                              theme === "dark" ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {h.floor} • Kapasite: {h.capacity} Kişi
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-emerald-500">
                            {money(h.hourlyPrice)} / Saat
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onPromptDelete("hall", h.id, h.name, v.id)}
                            className="h-6 w-6 text-slate-500 hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
