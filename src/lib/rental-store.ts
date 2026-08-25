import { useCallback, useEffect, useState } from "react";

export type Hall = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  dailyPrice: number;
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

const KEY = "belediye-kira-takip-v1";

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
      { id: "h1", name: "Lale Salonu", floor: "Zemin Kat", capacity: 400, dailyPrice: 12000 },
      { id: "h2", name: "Menekşe Salonu", floor: "1. Kat", capacity: 250, dailyPrice: 9000 },
      { id: "h3", name: "Teras Bahçe", floor: "Çatı Katı", capacity: 180, dailyPrice: 7500 },
    ],
  };
  const v2: Venue = {
    id: "v2",
    name: "Kültür Merkezi Nikah Salonu",
    district: "Yenişehir",
    halls: [
      { id: "h4", name: "Büyük Salon", floor: "Zemin Kat", capacity: 300, dailyPrice: 10000 },
      { id: "h5", name: "Küçük Salon", floor: "2. Kat", capacity: 120, dailyPrice: 5500 },
    ],
  };
  return {
    venues: [v1, v2],
    reservations: [
      { id: uid(), venueId: "v1", hallId: "h1", date: d(1), customer: "Yılmaz Ailesi", phone: "0532 111 22 33", price: 12000, paid: 6000 },
      { id: uid(), venueId: "v1", hallId: "h2", date: d(1), customer: "Demir Ailesi", phone: "0533 444 55 66", price: 9000, paid: 9000 },
      { id: uid(), venueId: "v2", hallId: "h4", date: d(4), customer: "Kaya Ailesi", phone: "0505 777 88 99", price: 10000, paid: 0 },
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

  const addReservation = useCallback((r: Omit<Reservation, "id">) => {
    let ok = true;
    setStore((s) => {
      const clash = s.reservations.some((x) => x.hallId === r.hallId && x.date === r.date);
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
