import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Users,
  Search,
  Phone,
  Mail,
  Building2,
  Pencil,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Layers,
  LayoutGrid,
  List,
  Filter,
  UserCheck,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Venue, Personnel } from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { toast } from "sonner";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { normalizeTRPhoneInput, formatTRPhone, getWhatsAppUrl } from "@/lib/phone-utils";

interface PersonnelScreenProps {
  theme: "dark" | "light";
  store: {
    personnel?: Personnel[];
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
  const isDark = theme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenueFilter, setSelectedVenueFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedVenueFilter]);

  // Editing state
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAssignedVenueId, setEditAssignedVenueId] = useState<string>("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);

  const personnelList = useMemo(() => store.personnel || [], [store.personnel]);

  // Filtered personnel
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.notes || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedVenueFilter !== "all") {
        const targetVenue = store.venues.find((v) => v.id === selectedVenueFilter);
        if (targetVenue) {
          const isAssigned =
            targetVenue.managerName?.toLowerCase() === p.name.toLowerCase() ||
            (targetVenue.managerPhone && p.phone && targetVenue.managerPhone.replace(/\D/g, "") === p.phone.replace(/\D/g, ""));
          if (!isAssigned) return false;
        }
      }

      return true;
    });
  }, [personnelList, searchTerm, selectedVenueFilter, store.venues]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = personnelList.length;
    const withPhone = personnelList.filter((p) => !!p.phone).length;
    const withEmail = personnelList.filter((p) => !!p.email).length;
    const assignedCount = personnelList.filter((p) =>
      store.venues.some(
        (v) =>
          v.managerName?.toLowerCase() === p.name.toLowerCase() ||
          (v.managerPhone && p.phone && v.managerPhone.replace(/\D/g, "") === p.phone.replace(/\D/g, ""))
      )
    ).length;

    return { total, withPhone, withEmail, assignedCount };
  }, [personnelList, store.venues]);

  const startEditPersonnel = (p: Personnel) => {
    setEditingPersonnel(p);
    setEditName(p.name || "");
    setEditTitle(p.title || "");
    setEditPhone(p.phone || "");
    setEditEmail(p.email || "");
    setEditNotes(p.notes || "");

    const assignedVenue = store.venues.find(
      (v) =>
        v.managerName?.toLowerCase() === p.name.toLowerCase() ||
        (v.managerPhone && p.phone && v.managerPhone.replace(/\D/g, "") === p.phone.replace(/\D/g, ""))
    );
    setEditAssignedVenueId(assignedVenue ? assignedVenue.id : "");
  };

  const handleSavePersonnelEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersonnel) return;
    try {
      await sqliteStore.updatePersonnel({
        id: editingPersonnel.id,
        name: editName.trim(),
        title: editTitle.trim() || undefined,
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });

      // Update venue manager info if assigned
      if (editAssignedVenueId) {
        const v = store.venues.find((item) => item.id === editAssignedVenueId);
        if (v) {
          await sqliteStore.updateVenue({
            ...v,
            managerName: editName.trim(),
            managerPhone: editPhone.trim(),
            managerTitle: editTitle.trim() || "Tesis Sorumlusu",
          });
        }
      }

      toast.success(`"${editName}" personeli başarıyla güncellendi.`);
      setEditingPersonnel(null);
    } catch (err: any) {
      toast.error(`Güncelleme hatası: ${err?.message || err}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removePersonnel(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(`Silme hatası: ${err?.message || err}`);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRandomColorClass = (name: string) => {
    const colors = [
      "bg-indigo-600 text-white",
      "bg-sky-600 text-white",
      "bg-emerald-600 text-white",
      "bg-purple-600 text-white",
      "bg-rose-600 text-white",
      "bg-amber-600 text-white",
      "bg-teal-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-lg font-black tracking-tight flex items-center gap-2 ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}>
            <Users className="h-5 w-5 text-sky-500" />
            Personel Kadrosu & Tesis Sorumluları
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Kurum personelleri, tesis amirleri, güvenlik görevlileri ve yetkili iletişim rehberi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenPersonnelModal}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 font-bold shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Yeni Personel Ekle
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Toplam Personel
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {stats.total} <span className="text-xs font-normal text-slate-400">Kişi</span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Tesis Sorumluları
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {stats.assignedCount} <span className="text-xs font-normal text-slate-400">Aktif</span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Telefon / WhatsApp
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {stats.withPhone} <span className="text-xs font-normal text-slate-400">Kayıtlı</span>
            </div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Kurumsal E-posta
            </div>
            <div className={`text-lg font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {stats.withEmail} <span className="text-xs font-normal text-slate-400">Tanımlı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Quick Form + Personnel List & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Personnel Registration (4 Cols) */}
        <Card
          className={`lg:col-span-4 h-fit ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-500" />
              <span>Hızlı Personel Kaydı</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Yeni görevli veya tesis amiri bilgilerini tanımlayın.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleCreatePersonnel} className="space-y-3.5">
              <div>
                <Label className="text-xs font-bold">Ad Soyad *</Label>
                <Input
                  required
                  placeholder="örn: Mehmet Akif Yılmaz"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  className={`mt-1 text-xs h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Görevi / Unvanı</Label>
                <Input
                  placeholder="örn: Tesis Sorumlusu / Zabıta Amiri / Teknik Personel"
                  value={personnelTitle}
                  onChange={(e) => setPersonnelTitle(e.target.value)}
                  className={`mt-1 text-xs h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>

              <div>
                <Label className="text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-500" /> İletişim Telefonu</span>
                  <span className="text-[10px] text-slate-400 font-mono">🇹🇷 +90 TR</span>
                </Label>
                <Input
                  placeholder="05XX XXX XX XX"
                  value={personnelPhone}
                  onChange={(e) => setPersonnelPhone(normalizeTRPhoneInput(e.target.value))}
                  className={`mt-1 text-xs h-9 font-mono ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>

              <div>
                <Label className="text-xs font-bold flex items-center gap-1">
                  <Mail className="h-3 w-3 text-sky-500" /> E-posta Adresi
                </Label>
                <Input
                  type="email"
                  placeholder="personel@kurum.bel.tr"
                  value={personnelEmail}
                  onChange={(e) => setPersonnelEmail(e.target.value)}
                  className={`mt-1 text-xs h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Özel Notlar / Açıklama</Label>
                <Input
                  placeholder="örn: Gece vardiya sorumlusu, anahtar yetkilisi"
                  value={personnelNotes}
                  onChange={(e) => setPersonnelNotes(e.target.value)}
                  className={`mt-1 text-xs h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 font-black shadow-sm mt-2 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Kadroya Ekle
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Search, Filters & Personnel Display (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter & View Controls */}
          <div
            className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="İsim, unvan veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 text-xs h-8.5 rounded-lg ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Venue Filter Dropdown */}
              <select
                value={selectedVenueFilter}
                onChange={(e) => setSelectedVenueFilter(e.target.value)}
                className={`text-xs h-8.5 px-2.5 rounded-lg border font-medium cursor-pointer ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <option value="all">🏢 Tüm Tesisler ({personnelList.length})</option>
                {store.venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-0.5 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-7 px-2 text-xs rounded-md ${
                    viewMode === "grid"
                      ? isDark
                        ? "bg-slate-800 text-white font-bold"
                        : "bg-white text-slate-900 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Kart Görünümü"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={`h-7 px-2 text-xs rounded-md ${
                    viewMode === "table"
                      ? isDark
                        ? "bg-slate-800 text-white font-bold"
                        : "bg-white text-slate-900 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tablo Görünümü"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* List Content */}
          {filteredPersonnel.length === 0 ? (
            <Card
              className={`p-10 text-center rounded-2xl border ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3 opacity-40" />
              <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {searchTerm || selectedVenueFilter !== "all"
                  ? "Aramanıza uygun personel bulunamadı."
                  : "Henüz personel tanımlanmadı."}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedVenueFilter !== "all"
                  ? "Lütfen arama teriminizi veya filtre seçiminizi kontrol edin."
                  : "Sol taraftaki formdan kurum personel kadrosunu ve tesis sorumlularını hemen ekleyebilirsiniz."}
              </p>
            </Card>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPersonnel
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((p) => {
                const boundVenues = store.venues.filter(
                  (v) =>
                    v.managerName?.toLowerCase() === p.name.toLowerCase() ||
                    (v.managerPhone && p.phone && v.managerPhone.replace(/\D/g, "") === p.phone.replace(/\D/g, ""))
                );

                return (
                  <Card
                    key={p.id}
                    className={`rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                      isDark
                        ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="p-4 space-y-3.5">
                      {/* Top Row: Avatar, Name, Role & Action Buttons */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 overflow-hidden">
                          {/* Avatar Initials */}
                          <div
                            className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${getRandomColorClass(
                              p.name
                            )}`}
                          >
                            {getInitials(p.name)}
                          </div>

                          <div className="truncate">
                            <h4 className={`text-sm font-black truncate ${
                              isDark ? "text-slate-100" : "text-slate-900"
                            }`}>
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 py-0"
                              >
                                {p.title || "Tesis Sorumlusu"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditPersonnel(p)}
                            className="h-7 w-7 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
                            title="Personeli Düzenle"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget(p)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                            title="Personeli Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Contact Info Pills */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        {p.phone ? (
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                            <div className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                              <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{formatTRPhone(p.phone)}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={getWhatsAppUrl(p.phone)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  if (window.electronAPI?.openExternalLink) {
                                    e.preventDefault();
                                    window.electronAPI.openExternalLink(getWhatsAppUrl(p.phone));
                                  }
                                }}
                                className="px-2 py-0.5 rounded-md bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                title="WhatsApp Mesajı Gönder"
                              >
                                <MessageCircle className="h-3 w-3" /> WhatsApp
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 italic py-0.5">
                            <Phone className="h-3 w-3 opacity-40" /> Telefon girilmemiş
                          </div>
                        )}

                        {p.email && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs">
                            <Mail className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                            <a
                              href={`mailto:${p.email}`}
                              className="text-sky-600 dark:text-sky-400 hover:underline font-mono truncate font-semibold"
                            >
                              {p.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Notes Box */}
                      {p.notes && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                          <span className="font-bold mr-1">📝 Not:</span>
                          {p.notes}
                        </div>
                      )}
                    </div>

                    {/* Bottom Footer: Linked Venues */}
                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 rounded-b-2xl">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Sorumlu Olduğu Tesisler:
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {boundVenues.length > 0 ? `${boundVenues.length} Tesis` : "Bağımsız"}
                        </span>
                      </div>
                      {boundVenues.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {boundVenues.map((bv) => (
                            <Badge
                              key={bv.id}
                              variant="outline"
                              className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300"
                            >
                              {bv.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          Herhangi bir mekana özel olarak atanmamış (Genel Merkez Kadrosu).
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isDark ? "bg-slate-950/80 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}>
                    <tr>
                      <th className="px-4 py-3">Personel Adı</th>
                      <th className="px-4 py-3">Unvan / Görev</th>
                      <th className="px-4 py-3">İletişim Telefonu</th>
                      <th className="px-4 py-3">E-posta</th>
                      <th className="px-4 py-3">Bağlı Olduğu Tesis(ler)</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredPersonnel
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map((p) => {
                      const boundVenues = store.venues.filter(
                        (v) =>
                          v.managerName?.toLowerCase() === p.name.toLowerCase() ||
                          (v.managerPhone && p.phone && v.managerPhone.replace(/\D/g, "") === p.phone.replace(/\D/g, ""))
                      );

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${getRandomColorClass(
                                  p.name
                                )}`}
                              >
                                {getInitials(p.name)}
                              </div>
                              <span>{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400"
                            >
                              {p.title || "Tesis Sorumlusu"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {p.phone ? (
                              <a
                                href={getWhatsAppUrl(p.phone)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  if (window.electronAPI?.openExternalLink) {
                                    e.preventDefault();
                                    window.electronAPI.openExternalLink(getWhatsAppUrl(p.phone));
                                  }
                                }}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" /> {formatTRPhone(p.phone)}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {p.email ? (
                              <a
                                href={`mailto:${p.email}`}
                                className="text-sky-600 dark:text-sky-400 hover:underline"
                              >
                                {p.email}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {boundVenues.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {boundVenues.map((bv) => (
                                  <Badge
                                    key={bv.id}
                                    variant="outline"
                                    className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  >
                                    {bv.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Genel Kadro</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEditPersonnel(p)}
                                className="h-7 w-7 text-indigo-500 hover:bg-indigo-500/10"
                                title="Düzenle"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteTarget(p)}
                                className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
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
            </div>
          )}

          {/* Personnel Pagination Controls */}
          {filteredPersonnel.length > 0 && (
            <div className="pt-2">
              <PaginationControls
                currentPage={currentPage}
                totalItems={filteredPersonnel.length}
                pageSize={pageSize}
                pageSizeOptions={[4, 8, 16, 32, 64]}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={(s) => setPageSize(s)}
                theme={theme}
                itemLabel="personel"
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Personnel Modal Dialog */}
      <Dialog open={Boolean(editingPersonnel)} onOpenChange={(open) => !open && setEditingPersonnel(null)}>
        <DialogContent
          className={`sm:max-w-md ${
            isDark ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Pencil className="h-4 w-4 text-sky-500" /> Personel Bilgilerini Düzenle
            </DialogTitle>
            <DialogDescription className="text-xs">
              Personel yetkilerini, unvanını ve sorumlu olduğu tesisi güncelleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePersonnelEdit} className="space-y-3.5 py-2 text-xs">
            <div>
              <Label className="text-xs font-bold">Ad Soyad *</Label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Görevi / Unvanı</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Sorumlu Olduğu Tesis</Label>
                <select
                  value={editAssignedVenueId}
                  onChange={(e) => setEditAssignedVenueId(e.target.value)}
                  className={`w-full text-xs h-9 mt-1 px-2.5 rounded-md border font-medium ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="">(Tesis Seçilmedi / Bağımsız)</option>
                  {store.venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold flex items-center justify-between">
                  <span>İletişim Telefonu</span>
                  <span className="text-[10px] text-slate-400 font-mono">🇹🇷 +90 TR</span>
                </Label>
                <Input
                  placeholder="05XX XXX XX XX"
                  value={editPhone}
                  onChange={(e) => setEditPhone(normalizeTRPhoneInput(e.target.value))}
                  className={`text-xs mt-1 h-9 font-mono ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
              <div>
                <Label className="text-xs font-bold">E-posta Adresi</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Özel Notlar</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className={`text-xs mt-1 h-9 ${isDark ? "bg-slate-950 border-slate-800" : ""}`}
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPersonnel(null)}>
                Vazgeç
              </Button>
              <Button type="submit" size="sm" className="bg-sky-600 hover:bg-sky-500 text-white font-bold">
                Değişiklikleri Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent
          className={`sm:max-w-sm ${
            isDark ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-500 flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Personel Kaydını Sil
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              <strong>"{deleteTarget?.name}"</strong> isimli personeli kadrodan silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Vazgeç
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Evet, Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
