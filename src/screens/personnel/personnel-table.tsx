import React from "react";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Personnel, Venue } from "@/lib/rental-store";
import { formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface PersonnelTableProps {
  theme: "dark" | "light";
  personnelList: Personnel[];
  getAssignedVenues: (person: Personnel) => Venue[];
  onEdit: (p: Personnel) => void;
  onDelete: (id: string, name: string) => void;
}

export const PersonnelTable: React.FC<PersonnelTableProps> = ({
  theme,
  personnelList,
  getAssignedVenues,
  onEdit,
  onDelete,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
      <table className="w-full text-left text-xs border-collapse font-sans">
        <thead>
          <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
            isDark ? "bg-slate-950 text-slate-300 border-slate-800" : "bg-slate-100 text-slate-900 border-slate-300"
          }`}>
            <th className="p-3">Adı Soyadı</th>
            <th className="p-3">Unvan / Pozisyon</th>
            <th className="p-3">Telefon</th>
            <th className="p-3">E-posta</th>
            <th className="p-3">Sorumlu Olduğu Tesisler</th>
            <th className="p-3 text-center">İşlem</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? "divide-slate-800/70" : "divide-slate-200"}`}>
          {personnelList.map((p) => {
            const venues = getAssignedVenues(p);
            return (
              <tr key={p.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/40" : "hover:bg-indigo-50/50"}`}>
                <td className="p-3 font-bold">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-xs shrink-0">
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={isDark ? "text-slate-100" : "text-slate-900"}>{p.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="text-[10px] border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-medium">
                    {p.title || "Görevli"}
                  </Badge>
                </td>
                <td className="p-3 font-mono font-bold">
                  <div className="flex items-center gap-2">
                    <span>{formatTRPhone(p.phone) || "—"}</span>
                    {p.phone && (
                      <a
                        href={getWhatsAppUrl(p.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 hover:text-emerald-400"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-3 text-slate-400">{p.email || "—"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {venues.length === 0 ? (
                      <span className="text-slate-500 text-[11px]">—</span>
                    ) : (
                      venues.map((v) => (
                        <Badge key={v.id} variant="outline" className="text-[9px] border-slate-700 text-slate-300">
                          {v.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(p)}
                      className="h-7 w-7 text-slate-400 hover:text-indigo-400"
                      title="Düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(p.id, p.name)}
                      className="h-7 w-7 text-slate-400 hover:text-rose-400"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
