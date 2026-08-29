import { money } from "@/lib/rental-store";

export const EMAIL_TEMPLATE_STORAGE_KEY = "venue-keeper-email-template-settings";

export interface EmailTemplateConfig {
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
  greetingText?: string;
  introText?: string;
  footerDisclaimer?: string;
  headerThemeColor?: "navy" | "indigo" | "emerald" | "burgundy" | "slate";
  phone?: string;
  email?: string;
  website?: string;
  kepAddress?: string;
  address?: string;
  showMapButtons?: boolean;
}

export interface EmailTemplateOptions extends EmailTemplateConfig {
  customer: string;
  venueName: string;
  hallName: string;
  date: string;
  start: string;
  end: string;
  eventType: string;
  price: number;
  paid: number;
}

export function getEmailTemplateSettings(): EmailTemplateConfig {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(EMAIL_TEMPLATE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
  } catch {}
  return {
    institutionName: "T.C. KURUM / BELEDİYE BAŞKANLIĞI",
    institutionSubHeader: "Emlak, Tahsilat & Tesis İşletme Müdürlüğü",
    greetingText: "Sayın {CUSTOMER_NAME},",
    introText: "Tesislerimizde gerçekleştireceğiniz {EVENT_TYPE} etkinliği ve salon kiralama tahsis talebiniz idaremizce onaylanarak kayıt altına alınmıştır. Tahsis ve mali ödeme döküm bilgileriniz aşağıda sunulmuştur:",
    footerDisclaimer: "Bu e-posta VenueKeeper Tesis & Salon İşletim Otomasyonu tarafından otomatik üretilmiş resmi evrak niteliğindedir.",
    headerThemeColor: "navy",
    phone: "0850 000 00 00",
    email: "info@kurum.bel.tr",
    website: "www.kurum.bel.tr",
    kepAddress: "kurumbelediyesi@hs01.kep.tr",
    address: "Belediye Hizmet Binası, Merkez",
    showMapButtons: true,
  };
}

export function saveEmailTemplateSettings(config: EmailTemplateConfig): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(EMAIL_TEMPLATE_STORAGE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.error("Failed to save email template settings:", e);
  }
}

export function generateEmailHTMLTemplate(options: EmailTemplateOptions): string {
  const savedConfig = getEmailTemplateSettings();
  const config: EmailTemplateOptions = { ...savedConfig, ...options };

  const remaining = config.price - config.paid;

  // Safe Logo Base64 / URL validation
  const hasValidLogo = config.institutionLogo && (
    config.institutionLogo.startsWith("data:image/") ||
    config.institutionLogo.startsWith("http://") ||
    config.institutionLogo.startsWith("https://")
  );

  const instName = config.institutionName || "T.C. KURUM / BELEDİYE BAŞKANLIĞI";
  const instSub = config.institutionSubHeader || "Emlak, Tahsilat & Tesis İşletme Müdürlüğü";
  const phone = config.phone || "0850 000 00 00";
  const email = config.email || "info@kurum.bel.tr";
  const website = config.website || "www.kurum.bel.tr";
  const kepAddress = config.kepAddress || "kurumbelediyesi@hs01.kep.tr";
  const address = config.address || "Belediye Hizmet Binası, Merkez";

  // Color Gradients based on headerThemeColor setting
  const colorGradients: Record<string, string> = {
    navy: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
    indigo: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)",
    emerald: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)",
    burgundy: "linear-gradient(135deg, #4c0519 0%, #881337 50%, #9f1239 100%)",
    slate: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
  };
  const headerBg = colorGradients[config.headerThemeColor || "navy"] || colorGradients.navy;

  const logoHtml = hasValidLogo
    ? `<img src="${config.institutionLogo}" alt="${instName}" style="height: 56px; max-width: 200px; object-fit: contain; margin-bottom: 12px; border: 0;" />`
    : `<div style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); color: #0f172a; font-weight: 900; font-size: 15px; padding: 10px 22px; border-radius: 10px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #fef3c7; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">🏛️ ${instName}</div>`;

  const docRefNo = `EVK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Placeholder Replacement Engine
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{CUSTOMER_NAME}/g, config.customer || "")
      .replace(/{VENUE_NAME}/g, config.venueName || "")
      .replace(/{HALL_NAME}/g, config.hallName || "")
      .replace(/{DATE}/g, config.date || "")
      .replace(/{HOURS}/g, `${config.start} - ${config.end}`)
      .replace(/{EVENT_TYPE}/g, config.eventType || "Etkinlik")
      .replace(/{PRICE}/g, money(config.price))
      .replace(/{PAID}/g, money(config.paid))
      .replace(/{REMAINING}/g, money(remaining));
  };

  const greetingFormatted = replacePlaceholders(config.greetingText || "Sayın {CUSTOMER_NAME},");
  const introFormatted = replacePlaceholders(config.introText || "Tesislerimizde gerçekleştireceğiniz etkinlik kayıt altına alınmıştır.");
  const footerDisclaimerFormatted = replacePlaceholders(config.footerDisclaimer || "Bu e-posta VenueKeeper tarafından üretilmiştir.");

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resmi Etkinlik & Salon Kiralama Teyidi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #cbd5e1; border-top: 6px solid #f59e0b;">
          
          <!-- Official Header Banner -->
          <tr>
            <td style="background: ${headerBg}; padding: 36px 30px; text-align: center; color: #ffffff;">
              ${logoHtml}
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">${instName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1; font-weight: 500;">${instSub}</p>
              
              <div style="margin-top: 16px; inline-block; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px;">
                📜 EVRAK REF: ${docRefNo} &nbsp;•&nbsp; ✅ RESMİ TAHSİS BİLDİRİMİ
              </div>
            </td>
          </tr>

          <!-- Greeting Body -->
          <tr>
            <td style="padding: 30px 30px 16px 30px;">
              <h2 style="margin: 0 0 10px 0; font-size: 17px; font-weight: 800; color: #0f172a;">${greetingFormatted}</h2>
              <p style="margin: 0; font-size: 13.5px; line-height: 1.65; color: #334155;">
                ${introFormatted}
              </p>
            </td>
          </tr>

          <!-- Key Details Card Table -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 7px 0; font-size: 12px; color: #64748b; font-weight: 700; width: 35%;">Mekan / Tesis:</td>
                  <td style="padding: 7px 0; font-size: 13.5px; color: #0f172a; font-weight: 800;">${config.venueName}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; font-size: 12px; color: #64748b; font-weight: 700;">Tahsis Salonu:</td>
                  <td style="padding: 7px 0; font-size: 13.5px; color: #4338ca; font-weight: 800;">${config.hallName}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; font-size: 12px; color: #64748b; font-weight: 700;">Tarih & Saat Dilimi:</td>
                  <td style="padding: 7px 0; font-size: 13.5px; color: #0f172a; font-weight: 800;">📅 ${config.date} &nbsp;⏰ ${config.start} - ${config.end}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; font-size: 12px; color: #64748b; font-weight: 700;">Etkinlik Türü:</td>
                  <td style="padding: 7px 0; font-size: 13.5px; color: #059669; font-weight: 800;">${config.eventType}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Maps Navigation Buttons -->
          ${config.showMapButtons !== false ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border-radius: 12px; padding: 16px; border: 1px solid #bae6fd; text-align: center;">
                <tr>
                  <td style="padding-bottom: 10px; font-size: 12.5px; font-weight: 800; color: #0369a1;">
                    🗺️ Haritalarda Etkinlik Alanı Canlı Konum ve Yol Tarifi:
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.venueName + " " + config.hallName + " " + address)}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 9px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; display: inline-block; margin-right: 8px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
                      📍 Google Maps Yol Tarifi
                    </a>
                    <a href="https://maps.apple.com/?q=${encodeURIComponent(config.venueName + " " + config.hallName + " " + address)}" target="_blank" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 9px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; display: inline-block; box-shadow: 0 2px 4px rgba(15,23,42,0.2);">
                      🍏 Apple Maps (iPhone / iOS)
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Financial Statement Table -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">
                <thead>
                  <tr style="background-color: #e2e8f0;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 11.5px; font-weight: 800; color: #334155; text-transform: uppercase;">Mali İşlem Kalemi</th>
                    <th style="padding: 12px 16px; text-align: right; font-size: 11.5px; font-weight: 800; color: #334155; text-transform: uppercase;">Tutar (TL)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 16px; font-size: 13px; color: #334155; font-weight: 600;">Toplam Tahsis & Kiralama Ücreti</td>
                    <td style="padding: 12px 16px; font-size: 14px; font-weight: 800; color: #0f172a; text-align: right;">${money(config.price)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                    <td style="padding: 12px 16px; font-size: 13px; color: #166534; font-weight: 700;">Tahsil Edilen Peşinat / Makbuz Tutarı</td>
                    <td style="padding: 12px 16px; font-size: 14px; font-weight: 800; color: #166534; text-align: right;">${money(config.paid)}</td>
                  </tr>
                  <tr style="background-color: #fef2f2;">
                    <td style="padding: 14px 16px; font-size: 13.5px; font-weight: 900; color: #991b1b;">Kalan Ödenecek Bakiye Tutarı</td>
                    <td style="padding: 14px 16px; font-size: 15px; font-weight: 900; color: #dc2626; text-align: right;">${money(remaining)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Digital Seal & Official Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 30px; color: #94a3b8; font-size: 11.5px; line-height: 1.65;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top; padding-right: 16px; width: 50%;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #f8fafc;">Kurumsal İletişim Bilgileri</p>
                    <p style="margin: 0 0 4px 0;">📞 Telefon: <span style="color: #cbd5e1; font-weight: 600;">${phone}</span></p>
                    <p style="margin: 0 0 4px 0;">✉️ E-posta: <span style="color: #cbd5e1; font-weight: 600;">${email}</span></p>
                    <p style="margin: 0 0 4px 0;">🌐 Web: <a href="https://${website}" style="color: #818cf8; text-decoration: none; font-weight: 600;">${website}</a></p>
                  </td>
                  <td style="vertical-align: top; border-left: 1px solid #334155; padding-left: 16px; width: 50%;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #f8fafc;">Resmi Kayıt & KEP</p>
                    <p style="margin: 0 0 4px 0;">🔒 KEP Adresi: <span style="color: #cbd5e1; font-weight: 600;">${kepAddress}</span></p>
                    <p style="margin: 0 0 4px 0;">📍 Adres: <span style="color: #cbd5e1; font-weight: 600;">${address}</span></p>
                  </td>
                </tr>
              </table>
              
              <div style="border-top: 1px solid #1e293b; margin-top: 20px; padding-top: 14px; text-align: center; color: #64748b; font-size: 10.5px;">
                ${footerDisclaimerFormatted}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
