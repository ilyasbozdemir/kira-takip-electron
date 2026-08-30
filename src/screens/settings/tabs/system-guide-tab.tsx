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

  return (
    <div className="space-y-4 pt-1">
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <BookOpen className="h-5 w-5 text-emerald-500" /> İşletmeTakipAppPro Sistem Kullanım Rehberi
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Uygulamanın temel özellikleri, veri güvenliği ve ipuçları hakkında genel bilgilendirme.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-1.5">
                <HardDrive className="h-4 w-4" /> SQLite Yerel Dosya Mimarisi (.vke)
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Uygulamanız tüm verilerini SQLite formatında şifreli ve taşınabilir tek bir <code>.vke</code> dosyasında saklar. Bu dosyayı flash belleğe kopyalayabilir veya bulut sürücünüzde yedekleyebilirsiniz.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 space-y-2">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Otomatik Yedekleme Güvenliği
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Uygulama her kapatıldığında veya önemli bir işlem yapıldığında son 30 günlük yedekleri yerel olarak otomatik alır ve dilerseniz kurumsal e-posta adresinize yedek dosyasını iletir.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-950/20 space-y-2">
              <h4 className="font-bold text-sm text-sky-400 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Çakışma Önleme & Opsiyon Takibi
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Aynı gün ve saat aralığı için mükerrer rezervasyon yapılması engellenir. Opsiyonlu (şerhli) kiralamalar takvimde sarı renk ve uyarı rozetiyle öne çıkar.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 space-y-2">
              <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> CRM ve Otomatik Müşteri Havuzu
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Rezervasyon girişi yapılırken yazılan tüm müşteri adları ve telefonları otomatik olarak CRM rehberine dahil edilir; tek tıkla WhatsApp veya e-posta gönderilebilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
