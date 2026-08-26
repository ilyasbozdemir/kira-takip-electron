import { useState, useEffect, useCallback } from "react";
import { type Store, type Hall, type Venue, type Reservation } from "./rental-store";

export function useSQLiteStore() {
  const [store, setStore] = useState<Store>({ venues: [], reservations: [] });
  const [ready, setReady] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    try {
      if (window.electronAPI?.db?.getStore) {
        const data = await window.electronAPI.db.getStore();
        setStore(data);
        const path = await window.electronAPI.db.getCurrentPath();
        setCurrentFilePath(path);
      } else {
        // Fallback for browser preview mode
        const raw = localStorage.getItem("venuekeeper-store-backup");
        if (raw) setStore(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Failed to load database store:", err);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    fetchStore();

    if (window.electronAPI?.onDbUpdated) {
      const unsubscribe = window.electronAPI.onDbUpdated(() => {
        fetchStore();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [fetchStore]);

  const addVenue = useCallback(
    async (name: string, district: string, category: string = "Genel") => {
      if (window.electronAPI?.db?.addVenue) {
        await window.electronAPI.db.addVenue({ name, district, category });
        await fetchStore();
      } else {
        setStore((s) => ({
          ...s,
          venues: [...s.venues, { id: Math.random().toString(36).slice(2), name, district, halls: [] }],
        }));
      }
    },
    [fetchStore]
  );

  const removeVenue = useCallback(
    async (venueId: string): Promise<{ success: boolean; error?: string }> => {
      if (window.electronAPI?.db?.deleteVenue) {
        const res = await window.electronAPI.db.deleteVenue(venueId);
        if (res?.success) {
          await fetchStore();
        }
        return res || { success: true };
      } else {
        const v = store.venues.find((x) => x.id === venueId);
        if (v && v.halls.length > 0) {
          return { success: false, error: "Bu mekana ait bağlı salonlar bulunmaktadır. Önce salonları silmelisiniz!" };
        }
        setStore((s) => ({
          venues: s.venues.filter((v) => v.id !== venueId),
          reservations: s.reservations.filter((r) => r.venueId !== venueId),
        }));
        return { success: true };
      }
    },
    [fetchStore, store.venues]
  );

  const addHall = useCallback(
    async (venueId: string, hall: Omit<Hall, "id">) => {
      if (window.electronAPI?.db?.addHall) {
        await window.electronAPI.db.addHall({ venueId, hall });
        await fetchStore();
      } else {
        setStore((s) => ({
          ...s,
          venues: s.venues.map((v) =>
            v.id === venueId ? { ...v, halls: [...v.halls, { ...hall, id: Math.random().toString(36).slice(2) }] } : v
          ),
        }));
      }
    },
    [fetchStore]
  );

  const removeHall = useCallback(
    async (venueId: string, hallId: string): Promise<{ success: boolean; error?: string }> => {
      if (window.electronAPI?.db?.deleteHall) {
        const res = await window.electronAPI.db.deleteHall(venueId, hallId);
        if (res?.success) {
          await fetchStore();
        }
        return res || { success: true };
      } else {
        const resCount = store.reservations.filter((r) => r.hallId === hallId).length;
        if (resCount > 0) {
          return { success: false, error: "Bu salona ait aktif etkinlik rezervasyonu bulunmaktadır!" };
        }
        setStore((s) => ({
          venues: s.venues.map((v) => (v.id === venueId ? { ...v, halls: v.halls.filter((h) => h.id !== hallId) } : v)),
          reservations: s.reservations.filter((r) => r.hallId !== hallId),
        }));
        return { success: true };
      }
    },
    [fetchStore, store.reservations]
  );

  const addReservation = useCallback(
    async (res: {
      venueId: string;
      hallId: string;
      date: string;
      start: string;
      end: string;
      customer: string;
      phone: string;
      eventType: string;
      price: number;
      paid: number;
      note?: string;
      decisionInfo?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (window.electronAPI?.db?.addReservation) {
        const result = await window.electronAPI.db.addReservation(res);
        if (result.success) {
          await fetchStore();
        }
        return result;
      } else {
        setStore((s) => ({
          ...s,
          reservations: [
            ...s.reservations,
            { ...res, id: Math.random().toString(36).slice(2) },
          ],
        }));
        return { success: true };
      }
    },
    [fetchStore]
  );

  const removeReservation = useCallback(
    async (id: string) => {
      if (window.electronAPI?.db?.deleteReservation) {
        await window.electronAPI.db.deleteReservation(id);
        await fetchStore();
      } else {
        setStore((s) => ({ ...s, reservations: s.reservations.filter((r) => r.id !== id) }));
      }
    },
    [fetchStore]
  );

  const updatePaid = useCallback(
    async (id: string, paid: number) => {
      if (window.electronAPI?.db?.updatePaid) {
        await window.electronAPI.db.updatePaid(id, paid);
        await fetchStore();
      } else {
        setStore((s) => ({ ...s, reservations: s.reservations.map((r) => (r.id === id ? { ...r, paid } : r)) }));
      }
    },
    [fetchStore]
  );

  return {
    store,
    ready,
    currentFilePath,
    fetchStore,
    addVenue,
    removeVenue,
    addHall,
    removeHall,
    addReservation,
    removeReservation,
    updatePaid,
  };
}
