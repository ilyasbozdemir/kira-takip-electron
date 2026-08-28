import { useState, useEffect, useCallback } from "react";
import { type Store, type Hall, type Venue, type Reservation, type Personnel } from "./rental-store";

let currentStoreData: Store = { venues: [], reservations: [], personnel: [] };
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

export const sqliteStore = {
  getSnapshot(): Store {
    return currentStoreData;
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  async loadFromDb(): Promise<Store> {
    try {
      if (window.electronAPI?.db?.getStore) {
        const data = await window.electronAPI.db.getStore();
        currentStoreData = data || { venues: [], reservations: [], personnel: [] };
      } else {
        const raw = localStorage.getItem("venuekeeper-store-backup");
        if (raw) currentStoreData = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to load sqlite store:", err);
    }
    notifyListeners();
    return currentStoreData;
  },
  async addReservation(r: any) {
    if (window.electronAPI?.db?.addReservation) {
      await window.electronAPI.db.addReservation(r);
    } else {
      currentStoreData.reservations.push({ ...r, id: Math.random().toString(36).slice(2) });
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async deleteReservation(id: string) {
    if (window.electronAPI?.db?.deleteReservation) {
      await window.electronAPI.db.deleteReservation(id);
    } else {
      currentStoreData.reservations = currentStoreData.reservations.filter((x) => x.id !== id);
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async updateReservationStatus(id: string, status: string) {
    if (window.electronAPI?.db?.updateReservationStatus) {
      await window.electronAPI.db.updateReservationStatus(id, status);
    } else {
      const res = currentStoreData.reservations.find((x) => x.id === id);
      if (res) res.status = status;
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async updateReservationDetails(id: string, details: any) {
    if (window.electronAPI?.db?.updateReservationDetails) {
      await window.electronAPI.db.updateReservationDetails(id, details);
    } else {
      const res = currentStoreData.reservations.find((x) => x.id === id);
      if (res) Object.assign(res, details);
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async addVenue(data: any) {
    if (window.electronAPI?.db?.addVenue) {
      await window.electronAPI.db.addVenue(data);
    } else {
      currentStoreData.venues.push({ ...data, id: Math.random().toString(36).slice(2), halls: [] });
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async deleteVenue(id: string) {
    if (window.electronAPI?.db?.deleteVenue) {
      await window.electronAPI.db.deleteVenue(id);
    } else {
      currentStoreData.venues = currentStoreData.venues.filter((x) => x.id !== id);
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async addHall(data: any) {
    if (window.electronAPI?.db?.addHall) {
      await window.electronAPI.db.addHall(data);
    } else {
      const v = currentStoreData.venues.find((x) => x.id === data.venueId);
      if (v) v.halls.push({ ...data, id: Math.random().toString(36).slice(2) });
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async deleteHall(venueId: string, hallId: string) {
    if (window.electronAPI?.db?.deleteHall) {
      await window.electronAPI.db.deleteHall(venueId, hallId);
    } else {
      const v = currentStoreData.venues.find((x) => x.id === venueId);
      if (v) v.halls = v.halls.filter((h) => h.id !== hallId);
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async addPersonnel(p: any) {
    if (window.electronAPI?.db?.addPersonnel) {
      await window.electronAPI.db.addPersonnel(p);
    } else {
      if (!currentStoreData.personnel) currentStoreData.personnel = [];
      currentStoreData.personnel.push({ ...p, id: Math.random().toString(36).slice(2) });
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async deletePersonnel(id: string) {
    if (window.electronAPI?.db?.deletePersonnel) {
      await window.electronAPI.db.deletePersonnel(id);
    } else {
      if (currentStoreData.personnel) {
        currentStoreData.personnel = currentStoreData.personnel.filter((x) => x.id !== id);
      }
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
};

export function useSQLiteStore() {
  const [store, setStore] = useState<Store>({ venues: [], reservations: [], personnel: [] });
  const [ready, setReady] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    try {
      const data = await sqliteStore.loadFromDb();
      setStore(data);
      if (window.electronAPI?.db?.getCurrentPath) {
        const path = await window.electronAPI.db.getCurrentPath();
        setCurrentFilePath(path);
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

  return {
    store,
    ready,
    currentFilePath,
    fetchStore,
    addVenue: sqliteStore.addVenue.bind(sqliteStore),
    removeVenue: sqliteStore.deleteVenue.bind(sqliteStore),
    addHall: sqliteStore.addHall.bind(sqliteStore),
    removeHall: sqliteStore.deleteHall.bind(sqliteStore),
    addReservation: sqliteStore.addReservation.bind(sqliteStore),
    removeReservation: sqliteStore.deleteReservation.bind(sqliteStore),
    updateReservationStatus: sqliteStore.updateReservationStatus.bind(sqliteStore),
    updateReservationDetails: sqliteStore.updateReservationDetails.bind(sqliteStore),
    addPersonnel: sqliteStore.addPersonnel.bind(sqliteStore),
    removePersonnel: sqliteStore.deletePersonnel.bind(sqliteStore),
  };
}
