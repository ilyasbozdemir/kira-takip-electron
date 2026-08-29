import { money } from "@/lib/rental-store";

export interface EmailTemplateOptions {
  customer: string;
  venueName: string;
  hallName: string;
  date: string;
  start: string;
  end: string;
  eventType: string;
  price: number;
  paid: number;
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
  phone?: string;
  email?: string;
  website?: string;
  kepAddress?: string;
  address?: string;
}

export function generateEmailHTMLTemplate(options: EmailTemplateOptions): string {
  const remaining = options.price - options.paid;
  const logoHtml = options.institutionLogo
    ? `<img src="${options.institutionLogo}" alt="Logo" style="height: 52px; max-width: 160px; object-fit: contain; margin-bottom: 8px;" />`
    : `<div style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 800; font-size: 18px; padding: 10px 18px; border-radius: 12px; margin-bottom: 8px;">${(options.institutionName || "VK").substring(0, 3).toUpperCase()}</div>`;

  const instName = options.institutionName || "GÜNEYYURT BELEDİYESİ";
  const instSub = options.institutionSubHeader || "Emlak - Tahsilat & Tesis İşletme Birimi";
  const phone = options.phone || "0338 123 45 67";
  const email = options.email || "info@guneyyurt.bel.tr";
  const website = options.website || "www.guneyyurt.bel.tr";
  const kepAddress = options.kepAddress || "guneyyurtbelediyesi@hs01.kep.tr";
  const address = options.address || "Belediye Hizmet Binası, Güneyyurt / Karaman";

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Etkinlik & Salon Kiralama Teyidi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              ${logoHtml}
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${instName}</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #c7d2fe; opacity: 0.9;">${instSub}</p>
            </td>
          </tr>

          <!-- Greeting Body -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a;">Sayın ${options.customer},</h2>
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">
                Tesislerimizde yapacağınız etkinlik ve salon kiralama rezervasyonunuz kayıt altına alınmış olup tahsis ve ödeme döküm bilgileriniz aşağıda bilgilerinize sunulmuştur:
              </p>
            </td>
          </tr>

          <!-- Details Card Table -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #64748b; font-weight: 600; width: 35%;">Mekan / Tesis:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">${options.venueName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">Salon:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #4338ca; font-weight: 700;">${options.hallName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">Tarih & Saat:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">📅 ${options.date} &nbsp;⏰ ${options.start} - ${options.end}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">Etkinlik Türü:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #059669; font-weight: 700;">${options.eventType}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Financial Table -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">
                <thead>
                  <tr style="background-color: #e2e8f0;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase;">Açıklama</th>
                    <th style="padding: 10px 14px; text-align: right; font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase;">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 14px; font-size: 12px; color: #334155;">Toplam Tahsis Ücreti</td>
                    <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right;">${money(options.price)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                    <td style="padding: 10px 14px; font-size: 12px; color: #166534;">Tahsil Edilen Peşinat</td>
                    <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #166534; text-align: right;">${money(options.paid)}</td>
                  </tr>
                  <tr style="background-color: #f1f5f9;">
                    <td style="padding: 12px 14px; font-size: 13px; font-weight: 800; color: #991b1b;">Kalan Ödenecek Bakiye</td>
                    <td style="padding: 12px 14px; font-size: 14px; font-weight: 800; color: #dc2626; text-align: right;">${money(remaining)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Official Institutional Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top; padding-right: 15px; width: 50%;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #f8fafc;">Kurumsal İletişim Bilgileri</p>
                    <p style="margin: 0 0 4px 0;">📞 Telefon: <span style="color: #cbd5e1;">${phone}</span></p>
                    <p style="margin: 0 0 4px 0;">✉️ E-posta: <span style="color: #cbd5e1;">${email}</span></p>
                    <p style="margin: 0 0 4px 0;">🌐 Web: <a href="https://${website}" style="color: #818cf8; text-decoration: none;">${website}</a></p>
                  </td>
                  <td style="vertical-align: top; border-left: 1px solid #334155; padding-left: 15px; width: 50%;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #f8fafc;">Resmi Kayıt & KEP</p>
                    <p style="margin: 0 0 4px 0;">🔒 KEP Adresi: <span style="color: #cbd5e1;">${kepAddress}</span></p>
                    <p style="margin: 0 0 4px 0;">📍 Adres: <span style="color: #cbd5e1;">${address}</span></p>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #1e293b; margin-top: 16px; padding-top: 12px; text-align: center; color: #64748b; font-size: 10px;">
                Bu e-posta VenueKeeper İşletme & Tesis Otomasyonu tarafından otomatik olarak gönderilmiştir.
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
