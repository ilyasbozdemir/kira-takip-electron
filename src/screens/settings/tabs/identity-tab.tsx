import React, { useRef } from "react";
import { Check, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IdentityTabProps {
  theme: "dark" | "light";
  draftAppName?: string;
  setDraftAppName?: (v: string) => void;
  draftInstitutionName: string;
  setDraftInstitutionName: (v: string) => void;
  draftInstitutionSubHeader: string;
  setDraftInstitutionSubHeader: (v: string) => void;
  draftInstitutionLogo: string;
  handleDraftLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDraftLogo: () => void;
  handleCancelInstitutionSettings: () => void;
  handleSaveInstitutionSettings: () => void;
}

export const IdentityTab: React.FC<IdentityTabProps> = ({
  theme,
  draftAppName,
  setDraftAppName,
  draftInstitutionName,
  setDraftInstitutionName,
  draftInstitutionSubHeader,
  setDraftInstitutionSubHeader,
  draftInstitutionLogo,
  handleDraftLogoUpload,
  handleRemoveDraftLogo,
  handleCancelInstitutionSettings,
  handleSaveInstitutionSettings,
}) => {
  const isDark = theme === "dark";
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 pt-1">
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <User className="h-5 w-5 text-indigo-500" /> Kurum / İşletme Kimlik Bilgileri
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Resmi evraklarda, tahsis belgelerinde ve sistem başlığında görünecek bilgileri düzenleyin.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {setDraftAppName && (
            <div>
              <Label className="text-xs font-semibold">Uygulama / Sistem Başlığı</Label>
              <Input
                value={draftAppName || ""}
                onChange={(e) => setDraftAppName(e.target.value)}
                placeholder="Örn: İşletmeTakipAppPro"
                className="mt-1 text-xs"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold">Kurum / Belediye / İşletme Adı *</Label>
            <Input
              value={draftInstitutionName}
              onChange={(e) => setDraftInstitutionName(e.target.value)}
              placeholder="Örn: ANKARA BÜYÜKŞEHİR BELEDİYESİ"
              className="mt-1 text-xs font-bold uppercase"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Alt Birim / Daire Başkanlığı / Müdürlük</Label>
            <Input
              value={draftInstitutionSubHeader}
              onChange={(e) => setDraftInstitutionSubHeader(e.target.value)}
              placeholder="Örn: Sosyal Hizmetler Dairesi Başkanlığı - Tesisler Şube Müdürlüğü"
              className="mt-1 text-xs"
            />
          </div>

          {/* Logo Upload & Preview */}
          <div className="pt-2">
            <Label className="text-xs font-semibold block mb-2">Kurum Resmi Logosu / Amblemi</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => logoInputRef.current?.click()}
                className={`h-20 w-20 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                  isDark ? "border-slate-700 bg-slate-950 hover:border-indigo-500" : "border-slate-300 bg-slate-50 hover:border-indigo-500"
                }`}
                title="Logo yüklemek için tıklayın"
              >
                {draftInstitutionLogo ? (
                  <img
                    src={draftInstitutionLogo}
                    alt="Kurum Logosu"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-500">
                    <Upload className="h-5 w-5 mx-auto mb-1 opacity-50" />
                    <span className="text-[9px] block leading-tight font-medium">Logo Seç</span>
                  </div>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleDraftLogoUpload}
                className="hidden"
              />

              <div className="space-y-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs h-8"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" /> Logo Yükle
                </Button>
                {draftInstitutionLogo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveDraftLogo}
                    className="text-xs h-8 text-rose-400 hover:text-rose-300 block"
                  >
                    Logoyu Kaldır
                  </Button>
                )}
                <p className="text-[10px] text-slate-500">
                  PNG veya SVG şeffaf arka planlı logolar tavsiye edilir.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelInstitutionSettings}
              className="text-xs h-8"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveInstitutionSettings}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Bilgileri Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
