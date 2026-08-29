import { useCallback, useEffect, useState } from "react";

export type Hall = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  hourlyPrice: number;
  color?: string;
};

export type Personnel = {
  id: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

export type Venue = {
  id: string;
  name: string;
  district: string;
  category?: string;
  address?: string;
  mapUrl?: string;
  managerName?: string;
  managerPhone?: string;
  managerTitle?: string;
  color?: string;
  halls: Hall[];
};

export type ReservationStatus = "option" | "confirmed" | "cancelled";

export type Reservation = {
  id: string;
  venueId: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  customer: string;
  phone: string;
  eventType?: string;
  price: number;
  paid: number;
  note?: string;
  decisionInfo?: string;
  status?: ReservationStatus | string;
  receiptNo?: string;
  paymentMethod?: string;
  mailSentAt?: string;
  mailSentTo?: string;
  customerMailSentAt?: string;
  customerMailSentTo?: string;
  staffMailSentAt?: string;
  staffMailSentTo?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  taxNo?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
};

export type NavSection = "dashboard" | "calendar" | "venues" | "events" | "customers" | "personnel" | "reports" | "settings" | "help";
export type PricingMode = "hourly" | "daily";

export const allEventTypes = [
  "Düğün & Davet",
  "Nişan & Kına",
  "Sünnet Düğünü",
  "Konser & Tiyatro",
  "Kongre & Seminer",
  "Toplantı & Lansman",
  "Sergi & Fuar",
  "Mezuniyet & Balo",
  "Spor & Turnuva",
  "İftar & Yemek",
];

export type Store = {
  venues: Venue[];
  reservations: Reservation[];
  personnel?: Personnel[];
  customers?: Customer[];
};

const KEY = "belediye-kiralama-v2";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const trMonths = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export const trDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export const money = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

/** "14:30" -> 870 dakika */
export const toMin = (t: string) => {
  if (t === "24:00") return 24 * 60;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const hoursBetween = (start: string, end: string) => {
  let sMin = toMin(start);
  let eMin = toMin(end);
  if (eMin === 0 && sMin > 0) eMin = 24 * 60;
  return Math.max(0, (eMin - sMin) / 60);
};

export const timeSlots = Array.from({ length: 33 }, (_, i) => {
  const mins = 8 * 60 + i * 30; // 08:00 - 00:00
  const hours = Math.floor(mins / 60) % 24;
  return `${String(hours).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});

export const overlaps = (aS: string, aE: string, bS: string, bE: string) => {
  let aEnd = toMin(aE);
  if (aEnd === 0 && toMin(aS) > 0) aEnd = 24 * 60;
  let bEnd = toMin(bE);
  if (bEnd === 0 && toMin(bS) > 0) bEnd = 24 * 60;
  return toMin(aS) < bEnd && toMin(bS) < aEnd;
};

function seed(): Store {
  return {
    venues: [],
    reservations: [],
  };
}

export function useRentalStore() {
  const [store, setStore] = useState<Store>({ venues: [], reservations: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setStore(raw ? (JSON.parse(raw) as Store) : seed());
    } catch {
      setStore(seed());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(store));
  }, [store, ready]);

  const addVenue = useCallback((name: string, district: string) => {
    setStore((s) => ({ ...s, venues: [...s.venues, { id: uid(), name, district, halls: [] }] }));
  }, []);

  const removeVenue = useCallback((venueId: string) => {
    setStore((s) => ({
      venues: s.venues.filter((v) => v.id !== venueId),
      reservations: s.reservations.filter((r) => r.venueId !== venueId),
    }));
  }, []);

  const addHall = useCallback((venueId: string, hall: Omit<Hall, "id">) => {
    setStore((s) => ({
      ...s,
      venues: s.venues.map((v) => (v.id === venueId ? { ...v, halls: [...v.halls, { ...hall, id: uid() }] } : v)),
    }));
  }, []);

  const removeHall = useCallback((venueId: string, hallId: string) => {
    setStore((s) => ({
      venues: s.venues.map((v) => (v.id === venueId ? { ...v, halls: v.halls.filter((h) => h.id !== hallId) } : v)),
      reservations: s.reservations.filter((r) => r.hallId !== hallId),
    }));
  }, []);

  /** Aynı salon + aynı gün + çakışan saat aralığı varsa reddeder. */
  const addReservation = useCallback((r: Omit<Reservation, "id">) => {
    let ok = true;
    setStore((s) => {
      const clash = s.reservations.some(
        (x) => x.hallId === r.hallId && x.date === r.date && overlaps(r.start, r.end, x.start, x.end),
      );
      if (clash) {
        ok = false;
        return s;
      }
      return { ...s, reservations: [...s.reservations, { ...r, id: uid() }] };
    });
    return ok;
  }, []);

  const removeReservation = useCallback((id: string) => {
    setStore((s) => ({ ...s, reservations: s.reservations.filter((r) => r.id !== id) }));
  }, []);

  const updatePaid = useCallback((id: string, paid: number) => {
    setStore((s) => ({ ...s, reservations: s.reservations.map((r) => (r.id === id ? { ...r, paid } : r)) }));
  }, []);

  const reset = useCallback(() => setStore(seed()), []);

  return {
    store,
    ready,
    addVenue,
    removeVenue,
    addHall,
    removeHall,
    addReservation,
    removeReservation,
    updatePaid,
    reset,
  };
}
