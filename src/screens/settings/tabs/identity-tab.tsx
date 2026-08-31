import React, { useRef } from "react";
import {
  Building2,
  Check,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { normalizeTRPhoneInput } from "@/lib/phone-utils";
import { TURKISH_CITIES, getDistrictsForCity } from "@/lib/turkey-locations";

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
  draftInstitutionPhone?: string;
  setDraftInstitutionPhone?: (v: string) => void;
  draftInstitutionEmail?: string;
  setDraftInstitutionEmail?: (v: string) => void;
  draftInstitutionWebsite?: string;
  setDraftInstitutionWebsite?: (v: string) => void;
  draftInstitutionKepAddress?: string;
  setDraftInstitutionKepAddress?: (v: string) => void;
  draftInstitutionAddress?: string;
  setDraftInstitutionAddress?: (v: string) => void;
  draftDefaultCity?: string;
  setDraftDefaultCity?: (v: string) => void;
  draftDefaultDistrict?: string;
  setDraftDefaultDistrict?: (v: string) => void;
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
  draftInstitutionPhone = "",
  setDraftInstitutionPhone,
  draftInstitutionEmail = "",
  setDraftInstitutionEmail,
  draftInstitutionWebsite = "",
  setDraftInstitutionWebsite,
  draftInstitutionKepAddress = "",
  setDraftInstitutionKepAddress,
  draftInstitutionAddress = "",
  setDraftInstitutionAddress,
  draftDefaultCity = "Ankara",
  setDraftDefaultCity,
  draftDefaultDistrict = "Çankaya",
  setDraftDefaultDistrict,
  handleCancelInstitutionSettings,
  handleSaveInstitutionSettings,
}) => {
  const isDark = theme === "dark";
  const logoInputRef = useRef<HTMLInputElement>(null);

  const availableDistricts = getDistrictsForCity(draftDefaultCity);

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Kurum Kimliği ve Logo */}
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <User className="h-5 w-5 text-indigo-500" /> Kurum / İşletme Kimlik Bilgileri
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Resmi evraklarda, tahsis belgelerinde, e-posta şablonlarında ve sistem başlığında görünecek bilgileri düzenleyin.
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
              placeholder="Örn: T.C. BELEDİYE BAŞKANLIĞI"
              className="mt-1 text-xs font-bold uppercase"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Alt Birim / Daire Başkanlığı / Müdürlük</Label>
            <Input
              value={draftInstitutionSubHeader}
              onChange={(e) => setDraftInstitutionSubHeader(e.target.value)}
              placeholder="Örn: Kültür ve Sosyal İşler Dairesi / Tesis İşletme Müdürlüğü"
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
                  PNG veya SVG şeffaf arka planlı logolar tavsiye edilir (Otomatik e-posta ve evraklara gömülür).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Varsayılan İl & İlçe Ayarı (Select ile Önden Dizili) */}
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <MapPin className="h-5 w-5 text-rose-500" /> Varsayılan Bölge, İl & İlçe Yapılandırması
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Yeni mekan/tesis ve salon eklerken açılır listede otomatik seçili gelecek ana il ve ilçe tanımı.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Varsayılan İl (Şehir) *</Label>
              <Select
                value={draftDefaultCity}
                onValueChange={(val) => {
                  if (setDraftDefaultCity) setDraftDefaultCity(val);
                  const newDistricts = getDistrictsForCity(val);
                  if (newDistricts.length > 0 && setDraftDefaultDistrict) {
                    setDraftDefaultDistrict(newDistricts[0]);
                  }
                }}
              >
                <SelectTrigger className={`mt-1 text-xs h-8 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-300"}`}>
                  <SelectValue placeholder="İl Seçin..." />
                </SelectTrigger>
                <SelectContent className={`max-h-60 ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"}`}>
                  {TURKISH_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Varsayılan İlçe *</Label>
              <Select
                value={draftDefaultDistrict}
                onValueChange={(val) => {
                  if (setDraftDefaultDistrict) setDraftDefaultDistrict(val);
                }}
              >
                <SelectTrigger className={`mt-1 text-xs h-8 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-300"}`}>
                  <SelectValue placeholder="İlçe Seçin..." />
                </SelectTrigger>
                <SelectContent className={`max-h-60 ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200"}`}>
                  {availableDistricts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            💡 Seçtiğiniz il ({draftDefaultCity}) ve ilçe ({draftDefaultDistrict}), yeni mekan eklerken ve filtreleme alanlarında otomatik olarak seçili getirilecektir.
          </p>
        </CardContent>
      </Card>

      {/* 3. Kurumsal İletişim Bilgileri */}
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <Phone className="h-5 w-5 text-emerald-500" /> Kurumsal İletişim Bilgileri
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            E-postalarda, tahsis belgelerinde ve sözleşmelerde yer alacak resmi iletişim detayları.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-500" /> Telefon Numarası
              </Label>
              <Input
                value={draftInstitutionPhone}
                onChange={(e) =>
                  setDraftInstitutionPhone &&
                  setDraftInstitutionPhone(normalizeTRPhoneInput(e.target.value))
                }
                placeholder="Örn: 0850 000 00 00"
                className="mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-500" /> Kurumsal E-posta
              </Label>
              <Input
                value={draftInstitutionEmail}
                onChange={(e) =>
                  setDraftInstitutionEmail && setDraftInstitutionEmail(e.target.value)
                }
                placeholder="Örn: info@kurum.bel.tr"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-indigo-500" /> Web Sitesi
              </Label>
              <Input
                value={draftInstitutionWebsite}
                onChange={(e) =>
                  setDraftInstitutionWebsite && setDraftInstitutionWebsite(e.target.value)
                }
                placeholder="Örn: www.kurum.bel.tr"
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Resmi Kayıt & KEP & Adres */}
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <ShieldCheck className="h-5 w-5 text-amber-500" /> Resmi Kayıt, KEP & Adres Bilgileri
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Resmi tebligat, KEP adresi ve kurum açık adres detayları.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Kayıtlı Elektronik Posta (KEP) Adresi
            </Label>
            <Input
              value={draftInstitutionKepAddress}
              onChange={(e) =>
                setDraftInstitutionKepAddress &&
                setDraftInstitutionKepAddress(e.target.value)
              }
              placeholder="Örn: kurumbelediyesi@hs01.kep.tr"
              className="mt-1 text-xs font-mono"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-500" /> Kurum Açık Adresi
            </Label>
            <Textarea
              value={draftInstitutionAddress}
              onChange={(e) =>
                setDraftInstitutionAddress && setDraftInstitutionAddress(e.target.value)
              }
              placeholder="Örn: Belediye Hizmet Binası, Atatürk Caddesi No:1, Merkez"
              rows={2}
              className="mt-1 text-xs resize-none"
            />
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold shadow-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Bilgileri Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
