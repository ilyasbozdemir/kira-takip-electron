import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { money, type Reservation, type Venue } from "@/lib/rental-store";

interface EventsScreenProps {
  theme: "dark" | "light";
  eventTypeFilter: string;
  setEventTypeFilter: (v: string) => void;
  allEventTypes: string[];
  filteredReservations: Reservation[];
  store: {
    venues: Venue[];
  };
  hallById: (id: string) => { name: string } | undefined;
  onPromptDelete: (type: "reservation", id: string, title: string) => void;
}

export function EventsScreen({
  theme,
  eventTypeFilter,
  setEventTypeFilter,
  allEventTypes,
  filteredReservations,
  store,
  hallById,
  onPromptDelete,
}: EventsScreenProps): React.JSX.Element {
  return (
    <Card
      className={theme === "dark"
        ? "bg-slate-900/80 border-slate-800"
        : "bg-white border-slate-200 shadow-sm"}
    >
      <CardHeader
        className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <CardTitle
            className={`text-base font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Etkinlik & Rezervasyon Listesi
          </CardTitle>
          <CardDescription
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Filtreleme ve arama ile tüm etkinlik kayıtları.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={eventTypeFilter}
            onValueChange={setEventTypeFilter}
          >
            <SelectTrigger
              className={`w-[180px] text-xs ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <SelectValue placeholder="Etkinlik Türü" />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-900"}
            >
              <SelectItem value="all">
                Tüm Etkinlik Türleri
              </SelectItem>
              {allEventTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table
          className={`w-full text-left text-xs ${
            theme === "dark" ? "text-slate-300" : "text-slate-800"
          }`}
        >
          <thead
            className={`uppercase font-mono text-[11px] border-b ${
              theme === "dark"
                ? "bg-slate-950 text-slate-400 border-slate-800"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <tr>
              <th className="p-3.5">Müşteri / Etkinlik</th>
              <th className="p-3.5">Tarih & Saat</th>
              <th className="p-3.5">Mekan / Salon</th>
              <th className="p-3.5">Tür</th>
              <th className="p-3.5 text-right">Toplam</th>
              <th className="p-3.5 text-right">Ödenen</th>
              <th className="p-3.5 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              theme === "dark" ? "divide-slate-800/60" : "divide-slate-200"
            }`}
          >
            {filteredReservations.map((r) => {
              const h = hallById(r.hallId);
              const v = store.venues.find((x) => x.id === r.venueId);

              return (
                <tr
                  key={r.id}
                  className={`transition-colors ${
                    theme === "dark"
                      ? "hover:bg-slate-800/30"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="p-3.5">
                    <span
                      className={`font-bold block ${
                        theme === "dark" ? "text-slate-200" : "text-slate-900"
                      }`}
                    >
                      {r.customer}
                    </span>
                    <span
                      className={`text-[11px] ${
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {r.phone}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">
                    <div>{r.date}</div>
                    <div
                      className={`text-[11px] ${
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {r.start} - {r.end}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span>{v?.name}</span>
                    <span className="text-indigo-500 block font-semibold">
                      {h?.name}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className="border-indigo-500/30 text-indigo-500 text-[10px]"
                    >
                      {r.eventType || "Etkinlik"}
                    </Badge>
                  </td>
                  <td
                    className={`p-3.5 text-right font-bold ${
                      theme === "dark" ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    {money(r.price)}
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-500">
                    {money(r.paid)}
                  </td>
                  <td className="p-3.5 text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        onPromptDelete(
                          "reservation",
                          r.id,
                          `${r.customer} (${r.date})`,
                        )}
                      className="h-7 w-7 text-slate-500 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
