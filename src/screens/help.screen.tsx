import React from "react";
import {
  Calendar,
  CheckCircle2,
  Database,
  DollarSign,
  FileCheck,
  HelpCircle,
  Info,
  Lock,
  Printer,
  ShieldAlert,
  Building2,
  Landmark,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Users,
  Award,
  Globe,
  FileText,
  BadgeCheck,
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
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-xl font-black tracking-tight flex items-center gap-2 ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              <HelpCircle className="h-6 w-6 text-indigo-500" />
              Sistem Rehberi, Kamu Uyumluluğu & Kullanım Standartları
            </h2>
            <Badge className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5">
              %100 ÜCRETSİZ & AÇIK
            </Badge>
          </div>
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Kurumsal kimlik, kamu mevzuat standartları, hedef kitle uyumluluğu ve veri güvenliği ilkeleri.
          </p>
        </div>
      </div>

      {/* SECTION 1: PUBLIC & NON-COMMERCIAL STATUS BANNER */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isDark
            ? "bg-linear-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/30 text-slate-100 shadow-xl"
            : "bg-linear-to-r from-indigo-50/90 via-white to-emerald-50/90 border-indigo-200 text-slate-900 shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="font-extrabold text-sm uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Kamu & Kurum Standartlarında — Tamamen Ücretsiz & Bağımsız
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight">
              Ticari Kısıtlama Yoktur • Abonelik Ücreti Yoktur • %100 Çevrimdışı (Offline-First)
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Bu yazılım; belediyeler, kamu idareleri, sosyal tesisler ve özel salon işletmeleri için
              <strong> kar amacı gütmeyen, açık standartlı ve bağımsız</strong> bir masaüstü otomasyonudur.
              Verileriniz bulut bağımlılığı olmadan doğrudan kendi bilgisayarınızdaki <code>.vke</code> (SQLite) dosyasında güvendedir.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Sıfır Lisans Maliyeti
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5">
              <HardDrive className="h-4 w-4" /> %100 Çevrimdışı & Yerel
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WHO IS IT FOR? (KİMLER İÇİN UYGUNDUR?) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          <h3 className={`text-base font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Kimler İçin Uygundur? (Kullanım Alanları & Sektörler)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Belediyeler & Kamu */}
          <Card className={`rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-1">
                <Landmark className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black">
                1. Belediyeler & Kamu
              </CardTitle>
              <CardDescription className="text-xs">
                Resmi kurumlar ve yerel idareler
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 pt-1 text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                • Kültür & Kongre Merkezleri
              </p>
              <p>• Belediye Nikah & Düğün Salonları</p>
              <p>• Kapalı Spor & Sosyal Tesisler</p>
              <p>• Meclis & Konferans Amfileri</p>
              <p>• Park & Bahçeler Açık Alanları</p>
            </CardContent>
          </Card>

          {/* Card 2: Düğün & Balo Salonları */}
          <Card className={`rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 mb-1">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black">
                2. Özel Düğün & Balo Salonları
              </CardTitle>
              <CardDescription className="text-xs">
                Özel davet ve etkinlik tesisleri
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 pt-1 text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                • Kır Düğünü & Davet Bahçeleri
              </p>
              <p>• Otel Balo & Toplantı Salonları</p>
              <p>• Kına, Nişan & Sünnet Mekanları</p>
              <p>• Kokteyl & Özel Kutlama Alanları</p>
              <p>• Fuar & Lansman Merkezleri</p>
            </CardContent>
          </Card>

          {/* Card 3: Vakıf & STK'lar */}
          <Card className={`rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-1">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black">
                3. Vakıflar, Dernekler & STK
              </CardTitle>
              <CardDescription className="text-xs">
                Sivil toplum ve hayır kurumları
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 pt-1 text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                • İftar Çadırları & Aşevleri
              </p>
              <p>• Taziye & Buluşma Evleri</p>
              <p>• Gençlik & Eğitim Merkezleri</p>
              <p>• Seminer & Çalıştay Salonları</p>
              <p>• Spor & Sosyal Kulüp Tesisleri</p>
            </CardContent>
          </Card>

          {/* Card 4: Kültür & Sahne Sanatları */}
          <Card className={`rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-2xs"}`}>
            <CardHeader className="pb-2">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-1">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black">
                4. Sahne, Kültür & Gösteri
              </CardTitle>
              <CardDescription className="text-xs">
                Sanat ve gösteri mekanları
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 pt-1 text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                • Tiyatro & Konser Sahneleri
              </p>
              <p>• Gösterim & Sinema Salonları</p>
              <p>• Sergi & Galeri Alanları</p>
              <p>• Prova, Stüdyo & Atölye Odaları</p>
              <p>• Açık Hava Amfi Tiyatroları</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECTION 3: RULES & LEGISLATION COMPLIANCE (MEVZUAT & İŞLETME KURALLARI) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          <h3 className={`text-base font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Mevzuat Uyumluluğu & Temel İşletme Standartları
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Rule 1: Past Date Rules */}
          <Card
            className={isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"}
          >
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                <Lock className="h-4 w-4 text-amber-500" />
                1. Geçmiş Tarihli Etkinlik & Denetim Güvenliği
              </CardTitle>
              <CardDescription className="text-xs">
                Sayıştay ve resmi teftiş standartlarına tam uyum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-3">
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-amber-50/70 border-amber-200 text-slate-900"
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5 text-amber-700 dark:text-amber-400">
                    Geçmişe Yeni Kayıt Açma Engeli:
                  </strong>
                  Geçmiş günlere yeni rezervasyon veya etkinlik kaydı eklenemez. Yalnızca bugün ve gelecek tarihler için yeni tahsis oluşturulabilir.
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-rose-50/70 border-rose-200 text-slate-900"
                }`}
              >
                <Lock className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5 text-rose-700 dark:text-rose-400">
                    Geçmiş Etkinlik Silme Engeli:
                  </strong>
                  Günü geçen veya tamamlanan etkinlikler resmi denetim ve encümen karar bütünlüğü gereği silinemez.
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-emerald-50/70 border-emerald-200 text-slate-900"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5 text-emerald-700 dark:text-emerald-400">
                    Kısmi Düzenleme & Tahsilat İzni:
                  </strong>
                  Geçmiş etkinliklerin tarihi ve salonu değiştirilemez; ancak kalan borç ödemesi, makbuz numarası ve tahsilat durumları güncellenebilir.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rule 2: Lump-Sum Tariff Policy */}
          <Card
            className={isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"}
          >
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                <DollarSign className="h-4 w-4 text-indigo-500" />
                2. Düğün & Salon Ücret Politikası
              </CardTitle>
              <CardDescription className="text-xs">
                Seanslık ve günlük sabit paket tarife esasları.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-3">
              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-indigo-50/70 border-indigo-200 text-slate-900"
                }`}
              >
                <strong className="block font-bold mb-1 text-indigo-700 dark:text-indigo-400">
                  Sabit Seanslık Paket Fiyatı (İndi-Bindi):
                </strong>
                Düğün, nişan, kına ve davet salonları saatlik taksimetre hesabı ile değil; <strong>Gece, Gündüz veya Tüm Gün</strong> seanslarında paket ücrete tabidir. Salon 1 saat de dursa, 12 saat de dursa belirlenen seans ücreti tahsil edilir.
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <strong className="block font-bold mb-1 text-slate-900 dark:text-slate-100">
                  Seans Saat Dilimleri:
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Gece Seansı:</strong> 18:00 - 23:30 arası
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Gündüz Seansı:</strong> 10:00 - 16:00 arası
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Tüm Gün Seansı:</strong> 09:00 - 23:30 arası
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Rule 3: Official Decision Basis & Print Output */}
          <Card
            className={isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"}
          >
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                <Printer className="h-4 w-4 text-emerald-500" />
                3. Resmi Evrak & Çıktı Standardı
              </CardTitle>
              <CardDescription className="text-xs">
                Encümen kararı, resmi antet ve teslim protokolü.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-3">
              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <strong className="block font-bold mb-1 text-slate-900 dark:text-slate-100">
                  Resmi Antet & Müdürlük Adı:
                </strong>
                Ayarlar sekmesinden tanımlanan <strong>Kurum Adı</strong> ve <strong>Resmi Alt Antet / Müdürlük Adı</strong> doğrudan yazdırılan resmi mekan tahsis evrakına ve alındı belgesine işlenir.
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <strong className="block font-bold mb-1 text-slate-900 dark:text-slate-100">
                  Tarife ve Encümen Karar No:
                </strong>
                Belediye Encümeni veya Yetkili Kurul Karar Tarihi ve Karar No her alındı belgesinin üzerinde yasal dayanak olarak otomatik gösterilir.
              </div>
            </CardContent>
          </Card>

          {/* Rule 4: SQLite Database & Data Integrity */}
          <Card
            className={isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"}
          >
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                <Database className="h-4 w-4 text-purple-500" />
                4. Veri Mahremiyeti & Yerel .vke Mimarisi
              </CardTitle>
              <CardDescription className="text-xs">
                Kalıcı SQLite dosya mimarisi ve sıfır dışa bağımlılık.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-3">
              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <strong className="block font-bold mb-1 text-slate-900 dark:text-slate-100">
                  Kendi Kendine Yeten Veritabanı (.vke):
                </strong>
                Tüm mekan, salon, etkinlik, makbuz ve personel verileriniz tek bir SQLite veritabanı dosyasında güvenle saklanır. Harici sunucuya veya üçüncü taraflara veri aktarımı yapılmaz. İstenildiğinde USB veya e-posta ile yedeklenebilir.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
