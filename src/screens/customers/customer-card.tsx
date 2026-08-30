import React from "react";
import type { Customer } from "@/lib/rental-store";
import {
  FileText,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface CustomerCardProps {
  theme: "dark" | "light";
  customer: Customer;
  reservationCount: number;
  onEdit: (c: Customer) => void;
  onDelete: (id: string, name: string) => void;
  onOpenMailModal?: (recipientEmail?: string) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  theme,
  customer: c,
  reservationCount,
  onEdit,
  onDelete,
  onOpenMailModal,
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
              {c.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4
                className={`text-sm font-extrabold truncate max-w-45 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {c.name}
              </h4>
              {c.company && (
                <p
                  className={`text-[11px] font-bold truncate max-w-45 mt-0.5 ${
                    isDark ? "text-sky-400" : "text-sky-600"
                  }`}
                >
                  🏢 {c.company}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] font-bold shrink-0 ${
              isDark
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}
          >
            {reservationCount} Kiralama
          </Badge>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-3 space-y-2.5 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span
                className={`font-mono font-bold ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {formatTRPhone(c.phone) || "Telefon Belirtilmedi"}
              </span>
            </div>

            {c.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span
                  className={`truncate font-medium ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {c.email}
                </span>
              </div>
            )}

            {c.taxNo && (
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  VN/TC: {c.taxNo}
                </span>
              </div>
            )}
          </div>

          {c.notes && (
            <p
              className={`text-[11px] p-2 rounded-xl border leading-snug line-clamp-2 font-medium ${
                isDark
                  ? "bg-slate-950/60 border-slate-800 text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              💬 {c.notes}
            </p>
          )}
        </CardContent>
      </div>

      <div
        className={`p-4 pt-2 border-t flex items-center justify-between gap-1.5 ${
          isDark ? "border-slate-800/80" : "border-slate-100"
        }`}
      >
        <div className="flex items-center gap-1.5">
          {c.phone && (
            <a
              href={getWhatsAppUrl(c.phone)}
              target="_blank"
              rel="noreferrer"
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors shadow-2xs ${
                isDark
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              }`}
            >
              WhatsApp
            </a>
          )}
          {c.email && onOpenMailModal && (
            <button
              type="button"
              onClick={() => onOpenMailModal(c.email)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shadow-2xs ${
                isDark
                  ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
              }`}
            >
              Mail At
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(c)}
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
            onClick={() => onDelete(c.id, c.name)}
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
