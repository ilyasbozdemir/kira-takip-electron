/**
 * Türkiye Resmi Tatil ve Hafta Sonu Altyapı Şablonu & Yönetim Sistemi
 * 
 * Bu modül:
 * 1. Sabit her yıl tekrarlanan Miladi ulusal bayramları (23 Nisan, 29 Ekim vb.)
 * 2. Yıllara göre değişen Hicri kaynaklı Dini bayramları (2024-2035 Diyanet Teyitli)
 * 3. Google Calendar ICS / iCal parser & canlı eşitleme altyapısını
 * 4. Miladi ↔ Hicri takvim dönüştürücü ve detaylı Hicri karşılıklarını
 * 5. takvim.com scraper ve yerel önbellek / özel tatil CRUD yönetimini içerir.
 */

export type HolidayType =
  | "national"
  | "religious"
  | "custom"
  | "commemoration"
  | "administrative";

export type CalendarSystemType = "miladi" | "hicri" | "custom";

export interface HolidayInfo {
  /** YYYY-MM-DD veya sabit günler için MM-DD */
  date: string;
  title: string;
  shortTitle?: string;
  type: HolidayType;
  /** Miladi mi Hicri mi olduğu bilgisi */
  calendarType?: CalendarSystemType;
  /** Hicri takvim karşılığı (Örn: "1 Şevval 1447", "10 Zilhicce 1447") */
  hijriDetail?: string;
  /** Resmi tatil / iş günü değil mi? */
  isOffDay: boolean;
  /** Arife vb. yarım gün mü? */
  isHalfDay?: boolean;
  /** İsteğe bağlı açıklama */
  description?: string;
  /** Özel simge / emoji */
  icon?: string;
  /** Kullanıcı tarafından mı eklendi? */
  isCustom?: boolean;
  /** Web'den veya ICS'den mi çekildi? */
  isFromWeb?: boolean;
  /** Kaynak: sistem, google_ics, takvim.com, user_custom */
  source?: "system" | "takvim.com" | "google_ics" | "custom_ics" | "user_custom";
  /** Diyanet / Google iCal tarafından teyit edildi mi */
  isVerified?: boolean;
}

export type FixedHoliday = Omit<HolidayInfo, "date"> & { monthDay: string };

// --------------------------------------------------------------------------
// 1. SABİT MİLADİ RESMİ TATİLLER VE ANMA GÜNLERİ (Her Yıl Aynı Günde)
// --------------------------------------------------------------------------
export const FIXED_ANNUAL_HOLIDAYS: FixedHoliday[] = [
  {
    monthDay: "01-01",
    title: "Yılbaşı Tatili",
    shortTitle: "Yılbaşı",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "🎉",
    description: "Miladi Yeni Yılın İlk Günü (1 Ocak)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "04-23",
    title: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı",
    shortTitle: "23 Nisan",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "🇹🇷",
    description: "TBMM'nin Açılışı ve Çocuk Bayramı (Miladi)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "05-01",
    title: "1 Mayıs Emek ve Dayanışma Günü",
    shortTitle: "1 Mayıs",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "👷",
    description: "İşçi ve Emekçiler Bayramı (Miladi)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "05-19",
    title: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı",
    shortTitle: "19 Mayıs",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "🇹🇷",
    description: "Milli Mücadelenin Başlangıcı ve Gençlik Bayramı (Miladi)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "07-15",
    title: "15 Temmuz Demokrasi ve Milli Birlik Günü",
    shortTitle: "15 Temmuz",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "🇹🇷",
    description: "Milli İrade ve Demokrasi Günü (Miladi)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "08-30",
    title: "30 Ağustos Zafer Bayramı",
    shortTitle: "30 Ağustos",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "🇹🇷",
    description: "Büyük Taarruz Zaferi (Miladi)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "10-28",
    title: "28 Ekim Cumhuriyet Bayramı Arifesi (Yarım Gün)",
    shortTitle: "28 Ekim Arife",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    isHalfDay: true,
    icon: "🇹🇷",
    description: "Cumhuriyet Bayramı Arifesi - Saat 13:00'ten İtibaren Tatil (Miladi)",
    isVerified: true,
    source: "system",
  },
  {
    monthDay: "10-29",
    title: "29 Ekim Cumhuriyet Bayramı",
    shortTitle: "29 Ekim",
    type: "national",
    calendarType: "miladi",
    isOffDay: true,
    icon: "🇹🇷",
    description: "Cumhuriyetin İlanı Yıldönümü (Miladi)",
    isVerified: true,
    source: "system",
  },
  // Anma Günleri (İş günü devam eder, takvimde anılır)
  {
    monthDay: "11-10",
    title: "10 Kasım Atatürk'ü Anma Günü",
    shortTitle: "10 Kasım",
    type: "commemoration",
    calendarType: "miladi",
    isOffDay: false,
    icon: "🕊️",
    description: "Gazi Mustafa Kemal Atatürk'ün Ebediyete İntikali (Miladi)",
    isVerified: true,
    source: "system",
  },
];

// --------------------------------------------------------------------------
// 2. HİCRİ TAKVİM TABANLI DİNİ BAYRAMLAR (2024 - 2035 DİYANET TEYİTLİ)
// --------------------------------------------------------------------------
export const DYNAMIC_RELIGIOUS_HOLIDAYS: Record<number, HolidayInfo[]> = {
  2024: [
    { date: "2024-04-09", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "30 Ramazan 1445", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2024-04-10", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1445", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2024-04-11", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1445", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2024-04-12", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1445", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2024-06-15", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1445", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2024-06-16", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1445", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2024-06-17", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1445", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2024-06-18", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1445", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2024-06-19", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1445", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2025: [
    { date: "2025-03-29", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1446", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2025-03-30", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1446", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2025-03-31", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1446", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2025-04-01", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1446", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2025-06-05", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1446", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2025-06-06", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1446", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2025-06-07", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1446", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2025-06-08", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1446", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2025-06-09", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1446", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2026: [
    { date: "2026-03-19", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1447", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2026-03-20", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1447", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2026-03-21", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1447", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2026-03-22", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1447", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2026-05-26", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1447", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2026-05-27", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1447", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2026-05-28", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1447", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2026-05-29", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1447", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2026-05-30", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1447", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2027: [
    { date: "2027-03-09", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1448", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2027-03-10", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1448", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2027-03-11", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1448", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2027-03-12", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1448", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2027-05-16", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1448", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2027-05-17", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1448", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2027-05-18", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1448", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2027-05-19", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1448", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2027-05-20", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1448", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2028: [
    { date: "2028-02-26", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1449", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2028-02-27", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1449", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2028-02-28", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1449", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2028-02-29", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1449", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2028-05-04", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1449", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2028-05-05", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1449", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2028-05-06", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1449", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2028-05-07", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1449", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2028-05-08", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1449", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2029: [
    { date: "2029-02-14", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1450", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2029-02-15", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1450", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2029-02-16", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1450", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2029-02-17", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1450", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2029-04-23", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1450", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2029-04-24", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1450", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2029-04-25", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1450", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2029-04-26", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1450", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2029-04-27", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1450", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2030: [
    { date: "2030-02-03", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1451", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2030-02-04", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1451", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2030-02-05", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1451", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2030-02-06", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1451", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2030-04-13", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1451", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2030-04-14", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1451", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2030-04-15", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1451", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2030-04-16", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1451", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2030-04-17", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1451", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2031: [
    { date: "2031-01-23", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1452", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2031-01-24", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1452", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2031-01-25", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1452", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2031-01-26", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1452", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2031-04-02", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1452", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2031-04-03", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1452", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2031-04-04", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1452", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2031-04-05", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1452", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2031-04-06", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1452", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2032: [
    { date: "2032-01-13", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1453", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2032-01-14", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1453", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2032-01-15", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1453", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2032-01-16", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1453", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2032-03-21", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1453", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2032-03-22", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1453", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2032-03-23", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1453", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2032-03-24", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1453", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2032-03-25", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1453", isOffDay: true, icon: "🐑", isVerified: true },
  ],
  2033: [
    { date: "2033-01-01", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1454", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2033-01-02", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1454", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2033-01-03", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1454", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2033-01-04", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1454", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2033-03-10", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1454", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2033-03-11", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1454", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2033-03-12", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1454", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2033-03-13", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1454", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2033-03-14", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1454", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2033-12-22", title: "Ramazan Bayramı Arifesi (Yıl İçi 2. Bayram)", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1455", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2033-12-23", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1455", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2033-12-24", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1455", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2033-12-25", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1455", isOffDay: true, icon: "🍬", isVerified: true },
  ],
  2034: [
    { date: "2034-02-28", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1455", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2034-03-01", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1455", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2034-03-02", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1455", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2034-03-03", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1455", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2034-03-04", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1455", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2034-12-11", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1456", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2034-12-12", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1456", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2034-12-13", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1456", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2034-12-14", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1456", isOffDay: true, icon: "🍬", isVerified: true },
  ],
  2035: [
    { date: "2035-02-18", title: "Kurban Bayramı Arifesi", shortTitle: "Kurban Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "9 Zilhicce 1456", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2035-02-19", title: "Kurban Bayramı 1. Gün", shortTitle: "Kurban B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "10 Zilhicce 1456", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2035-02-20", title: "Kurban Bayramı 2. Gün", shortTitle: "Kurban B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "11 Zilhicce 1456", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2035-02-21", title: "Kurban Bayramı 3. Gün", shortTitle: "Kurban B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "12 Zilhicce 1456", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2035-02-22", title: "Kurban Bayramı 4. Gün", shortTitle: "Kurban B. 4.G", type: "religious", calendarType: "hicri", hijriDetail: "13 Zilhicce 1456", isOffDay: true, icon: "🐑", isVerified: true },
    { date: "2035-12-01", title: "Ramazan Bayramı Arifesi", shortTitle: "Ramazan Arifesi", type: "religious", calendarType: "hicri", hijriDetail: "29 Ramazan 1457", isOffDay: true, isHalfDay: true, icon: "🌙", isVerified: true },
    { date: "2035-12-02", title: "Ramazan Bayramı 1. Gün", shortTitle: "Ramazan B. 1.G", type: "religious", calendarType: "hicri", hijriDetail: "1 Şevval 1457", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2035-12-03", title: "Ramazan Bayramı 2. Gün", shortTitle: "Ramazan B. 2.G", type: "religious", calendarType: "hicri", hijriDetail: "2 Şevval 1457", isOffDay: true, icon: "🍬", isVerified: true },
    { date: "2035-12-04", title: "Ramazan Bayramı 3. Gün", shortTitle: "Ramazan B. 3.G", type: "religious", calendarType: "hicri", hijriDetail: "3 Şevval 1457", isOffDay: true, icon: "🍬", isVerified: true },
  ],
};

// --------------------------------------------------------------------------
// 3. MİLADİ ↔ HİCRİ TAKVİM DÖNÜŞTÜRÜCÜ & BİLGİ FONKSİYONLARI
// --------------------------------------------------------------------------
const HIJRI_MONTH_NAMES = [
  "Muharrem",
  "Safer",
  "Rebiülevvel",
  "Rebiülahir",
  "Cemaziyelevvel",
  "Cemaziyelahir",
  "Recep",
  "Şaban",
  "Ramazan",
  "Şevval",
  "Zilkade",
  "Zilhicce",
];

/**
 * Verilen Miladi tarihin Hicri karşılığını hesaplar.
 */
export function getHijriDateString(dateInput: Date | string): {
  hijriDateStr: string;
  hijriDay: number;
  hijriMonthName: string;
  hijriYear: number;
  formattedDisplay: string;
} {
  const d = typeof dateInput === "string" ? new Date(dateInput + "T12:00:00") : dateInput;

  try {
    const formatter = new Intl.DateTimeFormat("tr-TR-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const parts = formatter.formatToParts(d);
    let day = 1;
    let month = 1;
    let year = 1447;

    for (const p of parts) {
      if (p.type === "day") day = parseInt(p.value, 10);
      if (p.type === "month") month = parseInt(p.value, 10);
      if (p.type === "year") year = parseInt(p.value, 10);
    }

    const monthName = HIJRI_MONTH_NAMES[month - 1] || `${month}. Hicri Ay`;
    const hijriDateStr = `${day} ${monthName} ${year}`;

    return {
      hijriDateStr,
      hijriDay: day,
      hijriMonthName: monthName,
      hijriYear: year,
      formattedDisplay: `${day} ${monthName} ${year} H.`,
    };
  } catch {
    const julianDay = Math.floor(d.getTime() / 86400000) + 2440587.5;
    const l = Math.floor(julianDay - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l1 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l1) / 5316) * Math.floor((50 * l1) / 17719) +
      Math.floor(l1 / 5670) * Math.floor((43 * l1) / 15238);
    const l2 =
      l1 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const m = Math.floor((24 * l2) / 709);
    const day = l2 - Math.floor((709 * m) / 24);
    const year = 30 * n + j - 30;
    const monthName = HIJRI_MONTH_NAMES[m - 1] || `${m}. Ay`;

    return {
      hijriDateStr: `${day} ${monthName} ${year}`,
      hijriDay: day,
      hijriMonthName: monthName,
      hijriYear: year,
      formattedDisplay: `${day} ${monthName} ${year} H.`,
    };
  }
}

// --------------------------------------------------------------------------
// 4. GOOGLE CALENDAR ICS / iCAL PARSER & CANLI VERİ ÇEKME
// --------------------------------------------------------------------------
export const GOOGLE_CALENDAR_TR_ICS_URL =
  "https://calendar.google.com/calendar/ical/tr.turkish%23holiday%40group.v.calendar.google.com/public/basic.ics";

export const GOOGLE_CALENDAR_BACKUP_ICS_URL =
  "https://calendar.google.com/calendar/ical/turkish__tr%40holiday.calendar.google.com/public/basic.ics";

/**
 * Standart .ics (iCalendar) metnini parse ederek tatil nesnelerine dönüştürür.
 */
export function parseICSContent(icsText: string, targetYear?: number): HolidayInfo[] {
  const holidays: HolidayInfo[] = [];

  const unfolded = icsText.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r\n|\r|\n/);

  let inEvent = false;
  let summary = "";
  let description = "";
  let dtstart = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      summary = "";
      description = "";
      dtstart = "";
      continue;
    }

    if (line.startsWith("END:VEVENT")) {
      if (inEvent && dtstart && summary) {
        const rawDateMatch = dtstart.match(/(\d{4})(\d{2})(\d{2})/);
        if (rawDateMatch) {
          const year = parseInt(rawDateMatch[1], 10);
          const month = rawDateMatch[2];
          const day = rawDateMatch[3];
          const dateStr = `${year}-${month}-${day}`;

          if (!targetYear || year === targetYear) {
            const isReligious =
              summary.toLowerCase().includes("ramazan") ||
              summary.toLowerCase().includes("kurban") ||
              summary.toLowerCase().includes("bayram");

            const isArife = summary.toLowerCase().includes("arife");
            const isCommemoration =
              summary.toLowerCase().includes("anma") ||
              summary.toLowerCase().includes("atatürk'ü anma");

            let icon = "🇹🇷";
            if (isReligious) {
              icon = isArife ? "🌙" : summary.toLowerCase().includes("kurban") ? "🐑" : "🍬";
            } else if (summary.toLowerCase().includes("yılbaşı") || summary.toLowerCase().includes("yilbasi")) {
              icon = "🎉";
            } else if (summary.toLowerCase().includes("emek") || summary.toLowerCase().includes("dayanışma")) {
              icon = "👷";
            }

            const hijriInfo = isReligious ? getHijriDateString(dateStr) : undefined;

            holidays.push({
              date: dateStr,
              title: summary,
              shortTitle: summary.length > 20 ? summary.slice(0, 20) + "..." : summary,
              type: isReligious ? "religious" : isCommemoration ? "commemoration" : "national",
              calendarType: isReligious ? "hicri" : "miladi",
              hijriDetail: hijriInfo?.formattedDisplay,
              isOffDay: !isCommemoration,
              isHalfDay: isArife,
              icon,
              description: description || `Google Takvim iCal Resmi Kaydı (${summary})`,
              source: "google_ics",
              isVerified: true,
              isFromWeb: true,
            });
          }
        }
      }
      inEvent = false;
      continue;
    }

    if (inEvent) {
      if (line.startsWith("SUMMARY:")) {
        summary = line.substring(8).trim().replace(/\\,/g, ",").replace(/\\n/g, " ");
      } else if (line.startsWith("DESCRIPTION:")) {
        description = line.substring(12).trim().replace(/\\,/g, ",").replace(/\\n/g, "\n");
      } else if (line.startsWith("DTSTART")) {
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          dtstart = line.substring(colonIdx + 1).trim();
        }
      }
    }
  }

  return holidays;
}

/**
 * Güvenli Uzak Metin / ICS Çekici (Electron IPC ile CORS engelini aşar)
 */
async function fetchRemoteText(url: string): Promise<string | null> {
  // 1. Electron IPC ile doğrudan Node.js net.fetch üzerinden istek
  try {
    if (typeof window !== "undefined" && (window as any).electronAPI?.fetchUrl) {
      const res = await (window as any).electronAPI.fetchUrl(url);
      if (res && res.success && typeof res.data === "string" && res.data.length > 0) {
        return res.data;
      }
    }
  } catch (e) {
    console.warn("electronAPI.fetchUrl hatası:", e);
  }

  // 2. Tarayıcı doğrudan fetch
  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.text();
    }
  } catch (e) {
    console.warn("Tarayıcı fetch hatası:", e);
  }

  return null;
}

/**
 * Google Calendar Public Turkish Holidays ICS feed'ini canlı olarak çeker ve parse eder
 */
export async function fetchGoogleCalendarICS(targetYear?: number): Promise<HolidayInfo[]> {
  const urls = [
    GOOGLE_CALENDAR_TR_ICS_URL,
    GOOGLE_CALENDAR_BACKUP_ICS_URL,
    "https://calendar.google.com/calendar/ical/turkish__tr%40holiday.calendar.google.com/public/basic.ics",
  ];

  for (const url of urls) {
    try {
      const text = await fetchRemoteText(url);
      if (text && text.includes("BEGIN:VCALENDAR")) {
        const parsed = parseICSContent(text, targetYear);
        if (parsed.length > 0) {
          if (targetYear) {
            saveWebCachedHolidays(targetYear, parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Google ICS fetch failed for ${url}:`, err);
    }
  }

  // Fallback: Yerel sistemde tanımlı Diyanet & Resmi Tatil verisi
  if (targetYear) {
    const defaultList = getHolidaysForYear(targetYear);
    return defaultList;
  }

  return [];
}

// --------------------------------------------------------------------------
// 5. STORAGE VE AYAR YÖNETİMİ (Kalıcı Özelleştirme & Cache)
// --------------------------------------------------------------------------
const STORAGE_CUSTOM_HOLIDAYS = "app_custom_holidays_v1";
const STORAGE_DISABLED_HOLIDAYS = "app_disabled_holidays_v1";
const STORAGE_WEB_CACHE = "app_web_holidays_cache_v1";

export function getCustomHolidaysFromStorage(): HolidayInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_HOLIDAYS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomHolidaysToStorage(list: HolidayInfo[]): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_HOLIDAYS, JSON.stringify(list));
  } catch {}
}

export function getDisabledHolidaysFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DISABLED_HOLIDAYS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDisabledHolidaysToStorage(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_DISABLED_HOLIDAYS, JSON.stringify(list));
  } catch {}
}

export function getWebCachedHolidays(year: number): HolidayInfo[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_WEB_CACHE);
    if (!raw) return null;
    const map: Record<number, HolidayInfo[]> = JSON.parse(raw);
    return map[year] || null;
  } catch {
    return null;
  }
}

export function saveWebCachedHolidays(year: number, list: HolidayInfo[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_WEB_CACHE);
    const map: Record<number, HolidayInfo[]> = raw ? JSON.parse(raw) : {};
    map[year] = list;
    localStorage.setItem(STORAGE_WEB_CACHE, JSON.stringify(map));
  } catch {}
}

/**
 * Tüm tatil ayarlarını varsayılan şablona döndürür
 */
export function resetHolidaysToDefault(year?: number): void {
  try {
    if (year) {
      const list = getCustomHolidaysFromStorage().filter(
        (h) => !h.date.startsWith(`${year}-`)
      );
      saveCustomHolidaysToStorage(list);

      const disabled = getDisabledHolidaysFromStorage().filter(
        (d) => !d.startsWith(`${year}-`)
      );
      saveDisabledHolidaysToStorage(disabled);

      const raw = localStorage.getItem(STORAGE_WEB_CACHE);
      if (raw) {
        const map: Record<number, HolidayInfo[]> = JSON.parse(raw);
        delete map[year];
        localStorage.setItem(STORAGE_WEB_CACHE, JSON.stringify(map));
      }
    } else {
      localStorage.removeItem(STORAGE_CUSTOM_HOLIDAYS);
      localStorage.removeItem(STORAGE_DISABLED_HOLIDAYS);
      localStorage.removeItem(STORAGE_WEB_CACHE);
    }
  } catch {}
}

// --------------------------------------------------------------------------
// 6. TAKVİM.COM WEB SCRAPER / PARSER
// --------------------------------------------------------------------------
const TURKISH_MONTH_MAP: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  subat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  mayis: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  agustos: 8,
  eylül: 9,
  eylul: 9,
  ekim: 10,
  kasım: 11,
  kasim: 11,
  aralık: 12,
  aralik: 12,
};

/**
 * HTML veya takvim.com metninden resmi tatil satırlarını ayrıştırır
 */
export function parseTakvimComText(text: string, year: number): HolidayInfo[] {
  const results: HolidayInfo[] = [];

  const cleanText = text
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ");

  const lines = cleanText.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^(\d{1,2})\s+([a-zA-ZğüşıöçĞÜŞİÖÇ]+)\s+(.+)$/i);
    if (!match) continue;

    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const title = match[3].trim();

    const monthNum = TURKISH_MONTH_MAP[monthName];
    if (!monthNum || day < 1 || day > 31) continue;

    if (title.toLowerCase().includes("gecesi") || title.toLowerCase().includes("indir")) {
      continue;
    }

    const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const isArife = title.toLowerCase().includes("arife");
    const isReligious =
      title.toLowerCase().includes("ramazan") ||
      title.toLowerCase().includes("kurban");
    const isCommemoration = title.toLowerCase().includes("anma");

    let icon = "🇹🇷";
    if (isReligious) {
      icon = isArife ? "🌙" : title.toLowerCase().includes("kurban") ? "🐑" : "🍬";
    } else if (title.toLowerCase().includes("yılbaşı") || title.toLowerCase().includes("yilbasi")) {
      icon = "🎉";
    } else if (title.toLowerCase().includes("emek") || title.toLowerCase().includes("dayanışma")) {
      icon = "👷";
    }

    const hijriInfo = isReligious ? getHijriDateString(dateStr) : undefined;

    results.push({
      date: dateStr,
      title: title,
      shortTitle: title.length > 18 ? title.slice(0, 18) + "..." : title,
      type: isReligious ? "religious" : isCommemoration ? "commemoration" : "national",
      calendarType: isReligious ? "hicri" : "miladi",
      hijriDetail: hijriInfo?.formattedDisplay,
      isOffDay: !isCommemoration,
      isHalfDay: isArife,
      icon,
      isFromWeb: true,
      source: "takvim.com",
      isVerified: true,
    });
  }

  return results;
}

/**
 * https://www.takvim.com/{year}_takvimi.html adresinden canlı veri çeker ve cacheler
 */
export async function fetchOnlineHolidays(year: number): Promise<HolidayInfo[]> {
  const url = `https://www.takvim.com/${year}_takvimi.html`;
  try {
    const html = await fetchRemoteText(url);
    if (html && html.length > 0) {
      const parsed = parseTakvimComText(html, year);
      if (parsed.length > 0) {
        saveWebCachedHolidays(year, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`takvim.com verisi çekilemedi (${year}):`, err);
  }

  // Fallback: Var olan default veri
  if (DYNAMIC_RELIGIOUS_HOLIDAYS[year]) {
    const combined = getHolidaysForYear(year);
    saveWebCachedHolidays(year, combined);
    return combined;
  }

  return [];
}

// --------------------------------------------------------------------------
// 7. YARDIMCI VE SORGULAMA FONKSİYONLARI
// --------------------------------------------------------------------------

export function isWeekend(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  const day = d.getDay();
  return day === 0 || day === 6; // 0: Pazar, 6: Cumartesi
}

export function isSaturday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.getDay() === 6;
}

export function isSunday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.getDay() === 0;
}

export function getWeekendDayName(date: Date | string): string | null {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  const day = d.getDay();
  if (day === 6) return "Cumartesi";
  if (day === 0) return "Pazar";
  return null;
}

/**
 * "YYYY-MM-DD" veya Date için tatil / özel gün bilgisini döner.
 */
export function getHolidayInfo(
  date: Date | string,
  customOverrideList?: HolidayInfo[]
): HolidayInfo | null {
  const dateStr =
    typeof date === "string"
      ? date
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;

  const parts = dateStr.split("-");
  if (parts.length < 3) return null;

  const year = parseInt(parts[0], 10);
  const monthDay = `${parts[1]}-${parts[2]}`;

  // Devre dışı bırakılmış mı?
  const disabledList = getDisabledHolidaysFromStorage();
  if (disabledList.includes(dateStr) || disabledList.includes(monthDay)) {
    return null;
  }

  // 1. Kullanıcı özel listesinde var mı?
  const customList = customOverrideList ?? getCustomHolidaysFromStorage();
  const custom = customList.find((h) => h.date === dateStr);
  if (custom) return custom;

  // 2. Web Cache'de var mı?
  const webCached = getWebCachedHolidays(year);
  if (webCached) {
    const foundWeb = webCached.find((h) => h.date === dateStr);
    if (foundWeb) return foundWeb;
  }

  // 3. Yıla özel dinamik dini bayramlarda var mı?
  const yearDynamic = DYNAMIC_RELIGIOUS_HOLIDAYS[year];
  if (yearDynamic) {
    const found = yearDynamic.find((h) => h.date === dateStr);
    if (found) return found;
  }

  // 4. Sabit resmi tatillerde var mı?
  const fixed = FIXED_ANNUAL_HOLIDAYS.find((h) => h.monthDay === monthDay);
  if (fixed) {
    return {
      date: dateStr,
      title: fixed.title,
      shortTitle: fixed.shortTitle,
      type: fixed.type,
      calendarType: fixed.calendarType || "miladi",
      isOffDay: fixed.isOffDay,
      isHalfDay: fixed.isHalfDay,
      icon: fixed.icon,
      description: fixed.description,
      isVerified: true,
      source: "system",
    };
  }

  return null;
}

export function isPublicHoliday(date: Date | string): boolean {
  const info = getHolidayInfo(date);
  return !!info && info.isOffDay;
}

export function isOffDay(date: Date | string): boolean {
  return isWeekend(date) || isPublicHoliday(date);
}

/**
 * Belirli bir yıla ait tüm aktif tatilleri birleşik liste olarak döner.
 */
export function getHolidaysForYear(year: number): HolidayInfo[] {
  const map = new Map<string, HolidayInfo>();
  const disabledList = getDisabledHolidaysFromStorage();

  // 1. Sabit tatiller (Miladi)
  for (const fixed of FIXED_ANNUAL_HOLIDAYS) {
    const fullDate = `${year}-${fixed.monthDay}`;
    if (!disabledList.includes(fullDate) && !disabledList.includes(fixed.monthDay)) {
      map.set(fullDate, {
        date: fullDate,
        title: fixed.title,
        shortTitle: fixed.shortTitle,
        type: fixed.type,
        calendarType: fixed.calendarType || "miladi",
        isOffDay: fixed.isOffDay,
        isHalfDay: fixed.isHalfDay,
        icon: fixed.icon,
        description: fixed.description,
        isVerified: true,
        source: "system",
      });
    }
  }

  // 2. Web Cached veya Dinamik Hicri Dini bayramlar
  const webCached = getWebCachedHolidays(year);
  if (webCached && webCached.length > 0) {
    for (const h of webCached) {
      if (!disabledList.includes(h.date)) {
        map.set(h.date, h);
      }
    }
  } else if (DYNAMIC_RELIGIOUS_HOLIDAYS[year]) {
    for (const h of DYNAMIC_RELIGIOUS_HOLIDAYS[year]) {
      if (!disabledList.includes(h.date)) {
        map.set(h.date, h);
      }
    }
  }

  // 3. Custom kullanıcı tatilleri (en yüksek öncelikli)
  const customList = getCustomHolidaysFromStorage();
  for (const c of customList) {
    if (c.date.startsWith(`${year}-`)) {
      map.set(c.date, c);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
