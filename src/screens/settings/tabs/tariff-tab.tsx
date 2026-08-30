import React from "react";
import { Check, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TariffTabProps {
  theme: "dark" | "light";
  draftTariffBasis: string;
  setDraftTariffBasis: (v: string) => void;
  handleCancelTariffSettings: () => void;
  handleSaveTariffSettings: () => void;
}

export const TariffTab: React.FC<TariffTabProps> = ({
  theme,
  draftTariffBasis,
  setDraftTariffBasis,
  handleCancelTariffSettings,
  handleSaveTariffSettings,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4 pt-1">
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <Scale className="h-5 w-5 text-indigo-500" /> Resmi Tarife Dayanağı ve İhale / Tahsis Hükümleri
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Resmi Tahsis Belgesi, Kira Sözleşmesi ve Evraklarda yasal dipnot olarak yer alacak meclis kararı veya kanun maddeleri.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div>
            <Label className="text-xs font-semibold">Resmi Tarife / Meclis Kararı Metni</Label>
            <Textarea
              rows={8}
              value={draftTariffBasis}
              onChange={(e) => setDraftTariffBasis(e.target.value)}
              placeholder="Örn: 2464 sayılı Belediye Gelirleri Kanunu ve 01.01.2026 tarihli Belediye Meclis Kararı uyarınca..."
              className={`mt-1 text-xs leading-relaxed font-sans ${
                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Bu metin, yazdırılan tüm resmi belgelerin en alt kısmında "Yasal Dayanak ve İhtarname" olarak otomatik basılır.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelTariffSettings}
              className="text-xs h-8"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveTariffSettings}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Tarife Metnini Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
