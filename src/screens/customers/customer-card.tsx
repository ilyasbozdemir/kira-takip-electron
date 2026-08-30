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
  return (
    <Card
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
              className={`text-sm font-bold truncate max-w-45 ${
                theme === "dark" ? "text-slate-100" : "text-slate-900"
              }`}
            >
              {c.name}
            </h4>
            {c.company && (
              <p className="text-[11px] text-sky-400 font-medium truncate max-w-45">
                🏢 {c.company}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold shrink-0"
        >
          {reservationCount} Kiralama
        </Badge>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-2.5 text-xs">
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span
              className={`font-mono font-bold ${
                theme === "dark" ? "text-slate-200" : "text-slate-900"
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
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
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
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                VN/TC: {c.taxNo}
              </span>
            </div>
          )}
        </div>

        {c.notes && (
          <p
            className={`text-[11px] p-2 rounded-lg border leading-snug line-clamp-2 font-medium ${
              theme === "dark"
                ? "bg-slate-950/60 border-slate-800 text-slate-300"
                : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            💬 {c.notes}
          </p>
        )}

        <div
          className={`pt-2 border-t flex items-center justify-between gap-1.5 ${
            theme === "dark" ? "border-slate-800/80" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {c.phone && (
              <a
                href={getWhatsAppUrl(c.phone)}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500/10 dark:border dark:border-emerald-500/30 dark:text-emerald-400 text-[10px] font-bold transition-colors shadow-2xs"
              >
                WhatsApp
              </a>
            )}
            {c.email && onOpenMailModal && (
              <button
                type="button"
                onClick={() => onOpenMailModal(c.email)}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-indigo-500/10 dark:border dark:border-indigo-500/30 dark:text-indigo-400 text-[10px] font-bold transition-colors shadow-2xs"
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
              className="h-7 w-7 text-slate-400 hover:text-indigo-400"
              title="Düzenle"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(c.id, c.name)}
              className="h-7 w-7 text-slate-400 hover:text-rose-400"
              title="Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
