import React from "react";
import {
  Building2,
  DollarSign,
  ExternalLink,
  Layers,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money, type Hall, type Venue } from "@/lib/rental-store";
import { formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface VenueCardProps {
  theme: "dark" | "light";
  venue: Venue;
  onEditVenue: (v: Venue) => void;
  onDeleteVenue: (id: string, name: string) => void;
  onAddHall: (venueId: string) => void;
  onEditHall: (venueId: string, hall: Hall) => void;
  onDeleteHall: (venueId: string, hallId: string, hallName: string) => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  theme,
  venue: v,
  onEditVenue,
  onDeleteVenue,
  onAddHall,
  onEditHall,
  onDeleteHall,
}) => {
  const isDark = theme === "dark";

  return (
    <Card
      className={`border transition-all flex flex-col justify-between ${
        isDark
          ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
      }`}
    >
      <div>
        <CardHeader className="pb-3 pt-4 px-4 border-b border-slate-800/40">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold tracking-tight">
                    {v.name}
                  </CardTitle>
                  {v.category && (
                    <Badge variant="outline" className="text-[10px] border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                      {v.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>{v.district}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEditVenue(v)}
                className="h-7 w-7 text-slate-400 hover:text-indigo-400"
                title="Mekanı Düzenle"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteVenue(v.id, v.name)}
                className="h-7 w-7 text-slate-400 hover:text-rose-400"
                title="Mekanı Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3 space-y-3 text-xs">
          {/* Address & Navigation */}
          {v.address && (
            <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1" title={v.address}>
                📍 {v.address}
              </span>
              {v.mapUrl && (
                <a
                  href={v.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-[10px] flex items-center gap-0.5 shrink-0 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Harita
                </a>
              )}
            </div>
          )}

          {/* Facility Manager Information */}
          {v.managerName && (
            <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Tesis Sorumlusu
                </span>
                {v.managerTitle && (
                  <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-300 px-1.5 py-0">
                    {v.managerTitle}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-semibold text-slate-200">{v.managerName}</span>
                {v.managerPhone && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{formatTRPhone(v.managerPhone)}</span>
                    <a
                      href={getWhatsAppUrl(v.managerPhone)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                      title="WhatsApp'tan Yaz"
                    >
                      <MessageCircle className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Halls List */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800/40">
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-sky-400" /> Salonlar ({v.halls.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddHall(v.id)}
                className="h-6 px-2 text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-bold"
              >
                <Plus className="h-3 w-3 mr-0.5" /> Salon Ekle
              </Button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {v.halls.map((h) => (
                <div
                  key={h.id}
                  className="p-2 rounded-lg border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2 group hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: h.color || "#6366f1" }} />
                      <span className="font-bold text-slate-200 truncate">{h.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({h.floor})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5 pl-4">
                      <span className="flex items-center gap-0.5">
                        <Users className="h-2.5 w-2.5" /> {h.capacity} Kişi
                      </span>
                      <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                        <DollarSign className="h-2.5 w-2.5" /> {money(h.hourlyPrice)} / sa
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditHall(v.id, h)}
                      className="h-6 w-6 text-slate-400 hover:text-indigo-400"
                      title="Salonu Düzenle"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteHall(v.id, h.id, h.name)}
                      className="h-6 w-6 text-slate-400 hover:text-rose-400"
                      title="Salonu Sil"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
