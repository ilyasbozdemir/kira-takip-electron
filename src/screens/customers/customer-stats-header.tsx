import React from "react";
import { Building, Plus, Search, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CustomerStatsHeaderProps {
  theme: "dark" | "light";
  totalCustomers: number;
  corporateCount: number;
  totalReservations: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenAddModal: () => void;
}

export const CustomerStatsHeader: React.FC<CustomerStatsHeaderProps> = ({
  theme,
  totalCustomers,
  corporateCount,
  totalReservations,
  searchTerm,
  setSearchTerm,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-xl font-bold tracking-tight ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Müşteri Rehberi & CRM Yönetimi
          </h2>
          <p
            className={`text-xs mt-1 ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Müşterileri kaydedin, kiralamalarını takip edin, hızlı iletişim kurun.
          </p>
        </div>
        <Button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 shadow-md flex items-center gap-1.5 px-4 shrink-0"
        >
          <Plus className="h-4 w-4" /> Yeni Müşteri Ekle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400">
              Toplam Kayıtlı Müşteri
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            <div className="text-2xl font-extrabold text-indigo-400">
              {totalCustomers}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Rehberde kayıtlı müşteri & kurum
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400">
              Kurumsal / Şirket Müşterileri
            </CardTitle>
            <Building className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            <div className="text-2xl font-extrabold text-sky-400">
              {corporateCount}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Fatura / Vergi No tanımlı kurumsal üye
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }
        >
          <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400">
              Toplam Etkinlik & Kiralama
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-3.5">
            <div className="text-2xl font-extrabold text-emerald-400">
              {totalReservations}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sistemde işlem görmüş kiralama kaydı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Müşteri adı, telefon, e-posta veya vergi no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-9 text-xs h-9 rounded-xl ${
            theme === "dark"
              ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs"
          }`}
        />
      </div>
    </div>
  );
};
