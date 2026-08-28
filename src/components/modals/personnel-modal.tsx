import React from "react";
import { Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PersonnelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  personnelName: string;
  setPersonnelName: (v: string) => void;
  personnelTitle: string;
  setPersonnelTitle: (v: string) => void;
  personnelPhone: string;
  setPersonnelPhone: (v: string) => void;
  personnelEmail: string;
  setPersonnelEmail: (v: string) => void;
  store: {
    personnel?: Array<{
      id: string;
      name: string;
      title?: string;
      phone?: string;
      email?: string;
    }>;
  };
  handleCreatePersonnel: (e: React.FormEvent) => void;
  removePersonnel: (id: string) => void;
}

export function PersonnelModal({
  open,
  onOpenChange,
  theme,
  personnelName,
  setPersonnelName,
  personnelTitle,
  setPersonnelTitle,
  personnelPhone,
  setPersonnelPhone,
  personnelEmail,
  setPersonnelEmail,
  store,
  handleCreatePersonnel,
  removePersonnel,
}: PersonnelModalProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={theme === "dark"
          ? "sm:max-w-[560px] bg-slate-900 border-slate-800 text-slate-100"
          : "sm:max-w-[560px] bg-white border-slate-200 text-slate-900 shadow-2xl"}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            Personel Kadrosu & Tesis Sorumluları Yönetimi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add New Personnel Form */}
          <form
            onSubmit={handleCreatePersonnel}
            className={`p-3 rounded-xl border space-y-3 ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              ➕ Yeni Personel Tanımla
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Ad Soyad *</Label>
                <Input
                  required
                  placeholder="örn: Mehmet Akif"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-300"
                  }`}
                />
              </div>
              <div>
                <Label className="text-[11px]">Görevi / Unvanı</Label>
                <Input
                  placeholder="örn: Tesis Amiri / Zabıta Memuru"
                  value={personnelTitle}
                  onChange={(e) => setPersonnelTitle(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-300"
                  }`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Telefon No</Label>
                <Input
                  placeholder="0532 000 00 00"
                  value={personnelPhone}
                  onChange={(e) => setPersonnelPhone(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-300"
                  }`}
                />
              </div>
              <div>
                <Label className="text-[11px]">E-posta</Label>
                <Input
                  type="email"
                  placeholder="mehmet@belediye.bel.tr"
                  value={personnelEmail}
                  onChange={(e) => setPersonnelEmail(e.target.value)}
                  className={`mt-1 text-xs ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-300"
                  }`}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs w-full font-semibold"
            >
              Kadroya Ekle
            </Button>
          </form>

          {/* Personnel List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kayıtlı Personeller ({store.personnel?.length || 0})
            </h4>
            {(!store.personnel || store.personnel.length === 0)
              ? (
                <p className="text-xs text-slate-500 italic p-3 text-center">
                  Henüz tanımlanmış personel bulunmamaktadır.
                </p>
              )
              : (
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {store.personnel.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                        theme === "dark"
                          ? "bg-slate-900/60 border-slate-800 text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>👤 {p.name}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-sky-500/10 border-sky-500/30 text-sky-400"
                          >
                            {p.title || "Personel"}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1 font-mono">
                          {p.phone && <span>📞 {p.phone}</span>}
                          {p.email && <span>✉️ {p.email}</span>}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removePersonnel(p.id)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
