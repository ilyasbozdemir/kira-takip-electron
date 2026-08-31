import React from "react";
import {
  Building2,
  Calendar as CalendarIcon,
  DollarSign,
  ExternalLink,
  Layers,
  MapPin,
  MessageCircle,
  Pencil,
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
  onViewVenueSchedule?: (venue: Venue, hallId?: string) => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  theme,
  venue: v,
  onEditVenue,
  onDeleteVenue,
  onAddHall,
  onEditHall,
  onDeleteHall,
  onViewVenueSchedule,
}) => {
  const isDark = theme === "dark";

  return (
    <Card
      className={`border transition-all flex flex-col justify-between rounded-2xl shadow-xs ${
        isDark
          ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md text-slate-100"
          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md text-slate-900"
      }`}
    >
      <div>
        <CardHeader
          className={`pb-3 pt-4 px-4 border-b ${
            isDark ? "border-slate-800/80" : "border-slate-100"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-400"
                    : "bg-indigo-50 border border-indigo-200 text-indigo-600"
                }`}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle
                    className={`text-base font-extrabold tracking-tight truncate ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {v.name}
                  </CardTitle>
                  {v.category && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        isDark
                          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {v.category}
                    </Badge>
                  )}
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs mt-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium">{v.district}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onViewVenueSchedule && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onViewVenueSchedule(v)}
                  className={`h-7 w-7 ${
                    isDark
                      ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50"
                      : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  }`}
                  title="Tesis / Mekan Etkinlik Takvimi"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEditVenue(v)}
                className={`h-7 w-7 ${
                  isDark
                    ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                }`}
                title="Mekanı Düzenle"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteVenue(v.id, v.name)}
                className={`h-7 w-7 ${
                  isDark
                    ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                }`}
                title="Mekanı Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3.5 space-y-3 text-xs">
          {/* Address & Navigation */}
          {v.address && (
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                isDark
                  ? "bg-slate-950/60 border-slate-800/80 text-slate-300"
                  : "bg-slate-50 border-slate-200/80 text-slate-700"
              }`}
            >
              <span
                className="text-[11px] truncate flex-1 font-medium"
                title={v.address}
              >
                📍 {v.address}
              </span>
              {v.mapUrl && (
                <a
                  href={v.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[10px] flex items-center gap-0.5 shrink-0"
                >
                  <ExternalLink className="h-3 w-3" /> Harita
                </a>
              )}
            </div>
          )}

          {/* Facility Manager Information */}
          {v.managerName && (
            <div
              className={`p-2.5 rounded-xl border space-y-1.5 ${
                isDark
                  ? "border-indigo-500/20 bg-indigo-950/20"
                  : "border-indigo-100 bg-indigo-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Tesis Sorumlusu
                </span>
                {v.managerTitle && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 font-bold ${
                      isDark
                        ? "border-indigo-500/30 text-indigo-300"
                        : "border-indigo-200 text-indigo-700 bg-white"
                    }`}
                  >
                    {v.managerTitle}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span
                  className={`font-black text-xs ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {v.managerName}
                </span>
                {v.managerPhone && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {formatTRPhone(v.managerPhone)}
                    </span>
                    <a
                      href={getWhatsAppUrl(v.managerPhone)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/25 transition-colors"
                      title="WhatsApp'tan Yaz"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Halls List */}
          <div className="space-y-1.5 pt-1">
            <div
              className={`flex items-center justify-between text-[11px] font-bold pb-1 border-b ${
                isDark
                  ? "text-slate-400 border-slate-800/60"
                  : "text-slate-600 border-slate-100"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-500" /> Salonlar ({v.halls.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddHall(v.id)}
                className="h-6 px-2 text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold"
              >
                <Plus className="h-3 w-3 mr-0.5" /> Salon Ekle
              </Button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {v.halls.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-2 text-center">
                  Henüz tanımlı salon bulunmuyor.
                </p>
              ) : (
                v.halls.map((h) => (
                  <div
                    key={h.id}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 group transition-colors ${
                      isDark
                        ? "border-slate-800/80 bg-slate-950/60 hover:border-slate-700"
                        : "border-slate-200/90 bg-slate-50/80 hover:bg-white hover:border-indigo-300 shadow-2xs"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: h.color || "#6366f1" }}
                        />
                        <span
                          className={`font-black text-xs truncate ${
                            isDark ? "text-slate-200" : "text-slate-900"
                          }`}
                        >
                          {h.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          ({h.floor})
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-3 text-[10px] font-mono mt-0.5 pl-4 ${
                          isDark ? "text-slate-400" : "text-slate-600 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-0.5">
                          <Users className="h-2.5 w-2.5 text-slate-400" /> {h.capacity} Kişi
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <DollarSign className="h-2.5 w-2.5" />
                          {money(h.hourlyPrice)}{" "}
                          <span className="text-[9px] font-normal text-slate-400">
                            {h.pricingType === "hourly"
                              ? "/ saat"
                              : h.pricingType === "daily"
                              ? "/ gün"
                              : "/ seans"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {onViewVenueSchedule && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onViewVenueSchedule(v, h.id)}
                          className="h-6 w-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Salon Etkinlik Takvimini Aç"
                        >
                          <CalendarIcon className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditHall(v.id, h)}
                        className="h-6 w-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Salonu Düzenle"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteHall(v.id, h.id, h.name)}
                        className="h-6 w-6 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Salonu Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
