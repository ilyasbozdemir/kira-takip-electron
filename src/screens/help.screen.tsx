import React from "react";
import {
  HelpCircle,
  ShieldAlert,
  Calendar,
  DollarSign,
  FileCheck,
  Database,
  Printer,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HelpScreenProps {
  theme: "dark" | "light";
}

export function HelpScreen({ theme }: HelpScreenProps): React.JSX.Element {
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-800/40">
        <div>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <HelpCircle className="h-6 w-6 text-indigo-500" />
            Sistem Kullanım Rehberi & İşletme Kuralları
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Geçmiş tarih kuralları, tarife politikası, mevzuat denetim güvenliği ve resmi evrak standartları.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-xs border-indigo-500/40 text-indigo-400 font-mono">
          Mevzuat v2026.1
        </Badge>
      </div>

      {/* Main Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rule 1: Past Date Rules */}
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <Lock className="h-5 w-5 text-amber-500" />
              1. Geçmiş Tarihli Etkinlik Kuralları
            </CardTitle>
            <CardDescription className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Mali ve resmi denetim güvenliği standartları.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-amber-50/60 border-amber-200 text-slate-800"}`}>
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5 text-amber-500">Geçmişe Yeni Kayıt Açma Yasağı:</strong>
                Geçmiş günlere yeni rezervasyon veya etkinlik kaydı eklenemez. Yalnızca bugün ve gelecek tarihler için yeni tahsis oluşturulabilir.
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-rose-50/60 border-rose-200 text-slate-800"}`}>
              <Lock className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5 text-rose-500">Geçmiş Etkinlik Silme Yasağı:</strong>
                Günü geçen veya tamamlanan etkinlikler resmi denetim ve encümen karar bütünlüğü gereği silinemez.
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-emerald-50/60 border-emerald-200 text-slate-800"}`}>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5 text-emerald-600 dark:text-emerald-400">Kısmi Düzenleme & Tahsilat İzni:</strong>
                Geçmiş etkinliklerin tarihi ve salonu değiştirilemez; ancak kalan borç ödemesi, makbuz numarası ve tahsilat durumları güncellenebilir.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule 2: Lump-Sum Tariff Policy */}
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <DollarSign className="h-5 w-5 text-indigo-500" />
              2. Düğün & Salon Ücret Politikası
            </CardTitle>
            <CardDescription className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Seanslık / Günlük sabit paket tarife esasları.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-indigo-50/60 border-indigo-200 text-slate-800"}`}>
              <strong className="block font-semibold mb-1 text-indigo-500">Sabit Seanslık Paket Fiyatı (İndi-Bindi):</strong>
              Düğün, nişan, kına ve davet salonları saatlik taksimetre hesabı ile değil; <strong>Gece, Gündüz veya Tüm Gün</strong> seanslarında paket ücrete tabidir. Salon 1 saat de dursa, 12 saat de dursa belirlenen seans ücreti tahsil edilir.
            </div>

            <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
              <strong className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Seans Saat Dilimleri:</strong>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li><strong>Gece Seansı:</strong> 18:00 - 23:30 arası</li>
                <li><strong>Gündüz Seansı:</strong> 10:00 - 16:00 arası</li>
                <li><strong>Tüm Gün Seansı:</strong> 09:00 - 23:30 arası</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Rule 3: Official Decision Basis & Print Output */}
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <Printer className="h-5 w-5 text-emerald-500" />
              3. Resmi Evrak & Çıktı Standardı
            </CardTitle>
            <CardDescription className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Encümen kararı, antet ve teslim protokolü.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
              <strong className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Resmi Antet & Müdürlük Adı:</strong>
              Ayarlar sekmesinden tanımlanan <strong>Kurum Adı</strong> ve <strong>Resmi Alt Antet / Müdürlük Adı</strong> doğrudan yazdırılan resmi mekan tahsis evrakına ve alındı belgesine işlenir.
            </div>

            <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
              <strong className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Tarife ve Encümen Karar No:</strong>
              Belediye Encümeni veya Yetkili Kurul Karar Tarihi ve Karar No her alındı belgesinin üzerinde yasal dayanak olarak otomatik gösterilir.
            </div>
          </CardContent>
        </Card>

        {/* Rule 4: SQLite Database & Data Integrity */}
        <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              <Database className="h-5 w-5 text-purple-500" />
              4. Veritabanı & Güvenlik Mimarisi
            </CardTitle>
            <CardDescription className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Kalıcı SQLite dosya mimarisi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className={`p-3 rounded-lg border ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
              <strong className="block font-semibold mb-1 text-slate-700 dark:text-slate-200">Kendi Kendine Yeten Veritabanı (.vke):</strong>
              Tüm mekan, salon, etkinlik, makbuz ve personel verileriniz tek bir SQLite veritabanı dosyasında güvenle saklanır. İstenildiğinde Google Drive ile bulut yedeği alınabilir.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
