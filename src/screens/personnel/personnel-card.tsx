import React from "react";
import {
  Briefcase,
  Building2,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import type { Personnel, Venue } from "@/lib/rental-store";
import { formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface PersonnelCardProps {
  theme: "dark" | "light";
  person: Personnel;
  assignedVenues: Venue[];
  onEdit: (p: Personnel) => void;
  onDelete: (id: string, name: string) => void;
}

export const PersonnelCard: React.FC<PersonnelCardProps> = ({
  theme,
  person: p,
  assignedVenues,
  onEdit,
  onDelete,
}) => {
  const isDark = theme === "dark";

  return (
    <Card
      className={`transition-all rounded-2xl flex flex-col justify-between shadow-xs ${
        isDark
          ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-100"
          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md text-slate-900"
      }`}
    >
      <div>
        <CardHeader
          className={`pb-2.5 pt-4 px-4 flex flex-row items-start justify-between space-y-0 border-b ${
            isDark ? "border-slate-800/80" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                isDark
                  ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-400"
                  : "bg-indigo-50 border border-indigo-200 text-indigo-700"
              }`}
            >
              {p.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4
                className={`text-sm font-extrabold truncate max-w-45 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {p.name}
              </h4>
              <p
                className={`text-[11px] font-bold truncate max-w-45 flex items-center gap-1 mt-0.5 ${
                  isDark ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                <Briefcase className="h-3 w-3 shrink-0" /> {p.title || "Görevli"}
              </p>
            </div>
          </div>
          {assignedVenues.length > 0 && (
            <Badge
              variant="outline"
              className={`text-[10px] font-bold shrink-0 ${
                isDark
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {assignedVenues.length} Tesis
            </Badge>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-3 space-y-2.5 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span
                className={`font-mono font-bold ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {formatTRPhone(p.phone) || "Telefon Belirtilmedi"}
              </span>
            </div>

            {p.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span
                  className={`truncate font-medium ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {p.email}
                </span>
              </div>
            )}

            {assignedVenues.length > 0 && (
              <div className="flex items-start gap-2 pt-0.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {assignedVenues.map((v) => (
                    <Badge
                      key={v.id}
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 font-medium ${
                        isDark
                          ? "border-slate-700 text-slate-300 bg-slate-950/40"
                          : "border-slate-200 text-slate-700 bg-slate-50"
                      }`}
                    >
                      🏛️ {v.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {p.notes && (
            <p
              className={`text-[11px] p-2 rounded-xl border leading-snug line-clamp-2 font-medium ${
                isDark
                  ? "bg-slate-950/60 border-slate-800 text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              💬 {p.notes}
            </p>
          )}
        </CardContent>
      </div>

      <div
        className={`p-4 pt-2 border-t flex items-center justify-between gap-1.5 ${
          isDark ? "border-slate-800/80" : "border-slate-100"
        }`}
      >
        <div>
          {p.phone && (
            <a
              href={getWhatsAppUrl(p.phone)}
              target="_blank"
              rel="noreferrer"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors shadow-2xs flex items-center gap-1 ${
                isDark
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              }`}
            >
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(p)}
            className={`h-7 w-7 ${
              isDark
                ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
            }`}
            title="Düzenle"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(p.id, p.name)}
            className={`h-7 w-7 ${
              isDark
                ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            }`}
            title="Sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
