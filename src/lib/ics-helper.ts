export interface SingleICSProps {
  id?: string;
  customer: string;
  venueName: string;
  hallName: string;
  date: string;
  start: string;
  end: string;
  eventType: string;
  phone?: string;
  note?: string;
}

export function generateSingleICS(props: SingleICSProps): string {
  const dtStart = (props.date || "2026-08-29").replace(/-/g, "") + "T" + (props.start || "09:00").replace(":", "") + "00";
  const dtEnd = (props.date || "2026-08-29").replace(/-/g, "") + "T" + (props.end || "17:00").replace(":", "") + "00";
  const uid = props.id || `evt-${Date.now()}`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const locationStr = `${props.venueName || "Tesis"} - ${props.hallName || "Salon"}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(locationStr)}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VenueKeeper App Pro//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "X-WR-CALNAME:VenueKeeper Etkinlik Davetiyesi",
    "BEGIN:VEVENT",
    `UID:${uid}@venuekeeper.pro`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${props.eventType || "Salon Tahsisi"}: ${props.customer}`,
    `LOCATION:${locationStr}`,
    `DESCRIPTION:Sayın ${props.customer}\\, ${props.venueName} - ${props.hallName} tesislerimizde gerçekleştirilecek ${props.eventType} etkinliğiniz takvime eklenmiştir.\\n\\n📍 Google Maps Yol Tarifi: ${googleMapsUrl}\\n🍏 Apple Maps (iPhone): ${appleMapsUrl}`,
    `URL:${googleMapsUrl}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${props.eventType} etkinliğinize 2 saat kaldı!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
