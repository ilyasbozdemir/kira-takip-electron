import React from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  HardDrive,
  Mail,
  ShieldCheck,
  Smartphone,
  Users,
  Building2,
  Clock,
  Printer,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SystemGuideTabProps {
  theme: "dark" | "light";
}

export const SystemGuideTab: React.FC<SystemGuideTabProps> = ({ theme }) => {
  const isDark = theme === "dark";

  const guideItems = [
    {
      icon: HardDrive,
      iconColor: "text-indigo-500",
      title: "SQLite Yerel Dosya Mimarisi (.vke)",
      description:
        "Uygulamanız tüm verilerini SQLite formatında şifreli ve taşınabilir tek bir .vke dosyasında saklar. Bu dosyayı flash belleğe kopyalayabilir veya kurumsal ağ sürücünüzde güvenle yedekleyebilirsiniz.",
    },
    {
      icon: ShieldCheck,
      iconColor: "text-emerald-500",
      title: "Otomatik Günlük & Kapanış Yedeklemesi",
      description:
        "Uygulama her kapatıldığında veya kritik işlem anlarında son 30 günlük yedekleri yerel diske otomatik kaydeder. Dilerseniz SMTP ayarları üzerinden kurumsal e-postanıza anlık yedek kopyası iletir.",
    },
    {
      icon: Calendar,
      iconColor: "text-sky-500",
      title: "Akıllı Çakışma Önleme & Opsiyon Takibi",
      description:
        "Aynı salon ve saat aralığı için mükerrer kiralama kaydı yapılması sistem tarafından anında engellenir. Opsiyonlu (şerhli) rezervasyonlar takvimde özel durum rozetiyle ayırt edilir.",
    },
    {
      icon: Users,
      iconColor: "text-amber-500",
      title: "Otomatik Müşteri & Personel CRM Rehberi",
      description:
        "Rezervasyon girişi yapılırken yazılan tüm müşteri adları ve irtibat numaraları otomatik olarak müşteri havuzuna eklenir. Tek tıkla WhatsApp veya e-posta iletişimi başlatabilirsiniz.",
    },
    {
      icon: Printer,
      iconColor: "text-purple-500",
      title: "Resmi Tahsis & Sözleşme Çıktıları",
      description:
        "Belediye ve kurumsal standartlara uygun resmi salon tahsis belgesi, sözleşme ve makbuz formları kurum logonuz ve tarife yasal dayanağı ile tek tıkla yazdırılabilir veya PDF'e aktarılabilir.",
    },
    {
      icon: Building2,
      iconColor: "text-rose-500",
      title: "Çoklu Mekan & Salon Yönetimi",
      description:
        "Sisteme sınırsız sayıda tesis, kongre merkezi, kültür salonu veya amfi tanımlayabilir; her salona özel saatlik/seanslık kira tarifesi ve kapasite atayabilirsiniz.",
    },
  ];

  return (
    <div className="space-y-4 pt-1">
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <BookOpen className="h-5 w-5 text-indigo-500" /> İşletmeTakipAppPro Sistem Kullanım Rehberi
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Uygulamanın temel özellikleri, veri güvenliği, otomasyonlar ve verimli kullanım ipuçları.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {guideItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDark
                        ? "bg-slate-900 border-slate-800 shadow-xs"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}
                  >
                    <IconComp className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center gap-3 ${
              isDark
                ? "bg-slate-950/40 border-slate-800 text-slate-400"
                : "bg-slate-100/70 border-slate-200 text-slate-600"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-200">İpucu:</strong> Günlük işlemlerinizi hızlandırmak için klavyeden sekmeler arası hızlı geçiş yapabilir, sağ alt köşedeki dosya menüsünden istediğiniz zaman yeni işletme veri dosyası oluşturabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
