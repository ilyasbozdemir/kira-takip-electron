import React from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Venue } from "@/lib/rental-store";

interface PersonnelScreenProps {
  theme: "dark" | "light";
  store: {
    personnel?: Array<{
      id: string;
      name: string;
      title?: string;
      phone?: string;
      email?: string;
      notes?: string;
    }>;
    venues: Venue[];
  };
  personnelName: string;
  setPersonnelName: (v: string) => void;
  personnelTitle: string;
  setPersonnelTitle: (v: string) => void;
  personnelPhone: string;
  setPersonnelPhone: (v: string) => void;
  personnelEmail: string;
  setPersonnelEmail: (v: string) => void;
  personnelNotes: string;
  setPersonnelNotes: (v: string) => void;
  handleCreatePersonnel: (e: React.FormEvent) => void;
  removePersonnel: (id: string) => void;
  onOpenPersonnelModal: () => void;
}

export function PersonnelScreen({
  theme,
  store,
  personnelName,
  setPersonnelName,
  personnelTitle,
  setPersonnelTitle,
  personnelPhone,
  setPersonnelPhone,
  personnelEmail,
  setPersonnelEmail,
  personnelNotes,
  setPersonnelNotes,
  handleCreatePersonnel,
  removePersonnel,
  onOpenPersonnelModal,
}: PersonnelScreenProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className={`text-lg font-bold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            👥 Personel Kadrosu & Tesis Sorumluları
          </h3>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Kurum personel kadrosu, tesis amirleri, görevliler ve yetkili iletişim bilgileri.
          </p>
        </div>
        <Button
          onClick={onOpenPersonnelModal}
          className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Yeni Personel Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Personnel Form Card */}
        <Card
          className={theme === "dark"
            ? "md:col-span-1 bg-slate-900/80 border-slate-800"
            : "md:col-span-1 bg-white border-slate-200 shadow-sm"}
        >
          <CardHeader className="pb-3 border-b border-slate-800/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-400" /> Hızlı Personel Kaydı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleCreatePersonnel} className="space-y-3">
              <div>
                <Label className="text-xs">Ad Soyad *</Label>
                <Input
                  required
                  placeholder="örn: Mehmet Akif Yılmaz"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Görevi / Unvanı</Label>
                <Input
                  placeholder="örn: Tesis Sorumlusu / Zabıta Amiri"
                  value={personnelTitle}
                  onChange={(e) => setPersonnelTitle(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">İletişim Telefonu</Label>
                <Input
                  placeholder="0532 000 00 00"
                  value={personnelPhone}
                  onChange={(e) => setPersonnelPhone(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">E-posta Adresi</Label>
                <Input
                  type="email"
                  placeholder="mehmet@kurum.bel.tr"
                  value={personnelEmail}
                  onChange={(e) => setPersonnelEmail(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Özel Notlar</Label>
                <Input
                  placeholder="örn: Gece vardiya amiri"
                  value={personnelNotes}
                  onChange={(e) => setPersonnelNotes(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold mt-2"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Kadroya Ekle
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Personnel Cards List */}
        <div className="md:col-span-2 space-y-4">
          {(!store.personnel || store.personnel.length === 0)
            ? (
              <Card
                className={`p-8 text-center ${
                  theme === "dark"
                    ? "bg-slate-900/60 border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <Users className="h-10 w-10 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-300">
                  Henüz personel tanımlanmadı.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Sol taraftaki formdan kurum personel kadrosunu ekleyebilirsiniz.
                </p>
              </Card>
            )
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {store.personnel.map((p) => {
                  const boundVenues = store.venues.filter((v) =>
                    v.managerName === p.name || v.managerPhone === p.phone
                  );
                  return (
                    <Card
                      key={p.id}
                      className={`p-4 space-y-3 relative ${
                        theme === "dark"
                          ? "bg-slate-900/80 border-slate-800"
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                theme === "dark"
                                  ? "text-slate-100"
                                  : "text-slate-900"
                              }`}
                            >
                              👤 {p.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-sky-500/10 border-sky-500/30 text-sky-400"
                            >
                              {p.title || "Tesis Sorumlusu"}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-slate-400 font-mono">
                            {p.phone && (
                              <div className="flex items-center gap-1.5">
                                <span>📞</span>
                                <a
                                  href={`https://wa.me/90${(p.phone || "").replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => {
                                    if (window.electronAPI?.openExternalLink) {
                                      e.preventDefault();
                                      window.electronAPI.openExternalLink(
                                        `https://wa.me/90${(p.phone || "").replace(/\D/g, "")}`,
                                      );
                                    }
                                  }}
                                  className="text-emerald-400 hover:underline font-bold"
                                >
                                  {p.phone}
                                </a>
                              </div>
                            )}
                            {p.email && (
                              <div className="flex items-center gap-1.5">
                                <span>✉️</span>
                                <a
                                  href={`mailto:${p.email}`}
                                  className="text-sky-400 hover:underline"
                                >
                                  {p.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removePersonnel(p.id)}
                          className="h-7 w-7 text-slate-500 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {boundVenues.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60 text-[11px]">
                          <span className="text-slate-400">
                            🏢 Sorumlu Olduğu Tesisler:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {boundVenues.map((bv) => (
                              <Badge
                                key={bv.id}
                                variant="outline"
                                className="text-[9px] bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                              >
                                {bv.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
