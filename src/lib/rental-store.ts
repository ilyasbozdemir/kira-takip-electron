import { useCallback, useEffect, useState } from "react";

export type Hall = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  hourlyPrice: number;
};

export type Venue = {
  id: string;
  name: string;
  district: string;
  halls: Hall[];
};

export type Reservation = {
  id: string;
  venueId: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  customer: string;
  phone: string;
  price: number;
  paid: number;
  note?: string;
};

export type Store = {
  venues: Venue[];
  reservations: Reservation[];
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
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const hoursBetween = (start: string, end: string) =>
  Math.max(0, (toMin(end) - toMin(start)) / 60);

export const timeSlots = Array.from({ length: 33 }, (_, i) => {
  const mins = 8 * 60 + i * 30; // 08:00 - 24:00
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});

export const overlaps = (aS: string, aE: string, bS: string, bE: string) =>
  toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE);

function seed(): Store {
  const today = new Date();
  const d = (offset: number) => {
    const x = new Date(today.getFullYear(), today.getMonth(), Math.min(28, today.getDate() + offset));
    return toKey(x);
  };
  const v1: Venue = {
    id: "v1",
    name: "Şehir Düğün Sarayı",
    district: "Merkez",
    halls: [
      { id: "h1", name: "Lale Salonu", floor: "Zemin Kat", capacity: 400, hourlyPrice: 2000 },
      { id: "h2", name: "Menekşe Salonu", floor: "1. Kat", capacity: 250, hourlyPrice: 1500 },
      { id: "h3", name: "Teras Bahçe", floor: "Çatı Katı", capacity: 180, hourlyPrice: 1200 },
    ],
  };
  const v2: Venue = {
    id: "v2",
    name: "Kültür Merkezi Nikah Salonu",
    district: "Yenişehir",
    halls: [
      { id: "h4", name: "Büyük Salon", floor: "Zemin Kat", capacity: 300, hourlyPrice: 1800 },
      { id: "h5", name: "Küçük Salon", floor: "2. Kat", capacity: 120, hourlyPrice: 900 },
    ],
  };
  return {
    venues: [v1, v2],
    reservations: [
      { id: uid(), venueId: "v1", hallId: "h1", date: d(1), start: "13:00", end: "17:00", customer: "Yılmaz Ailesi", phone: "0532 111 22 33", price: 8000, paid: 4000 },
      { id: uid(), venueId: "v1", hallId: "h1", date: d(1), start: "19:00", end: "23:00", customer: "Aydın Ailesi", phone: "0542 222 33 44", price: 8000, paid: 8000 },
      { id: uid(), venueId: "v1", hallId: "h2", date: d(1), start: "14:00", end: "18:00", customer: "Demir Ailesi", phone: "0533 444 55 66", price: 6000, paid: 6000 },
      { id: uid(), venueId: "v2", hallId: "h4", date: d(4), start: "12:00", end: "16:00", customer: "Kaya Ailesi", phone: "0505 777 88 99", price: 7200, paid: 0 },
    ],
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
