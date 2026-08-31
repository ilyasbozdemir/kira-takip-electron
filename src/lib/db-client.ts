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
        if (window.electronAPI?.db?.getAllSettings) {
          const settings = await window.electronAPI.db.getAllSettings();
          if (settings?.financial_transactions_json) {
            try {
              currentStoreData.transactions = JSON.parse(settings.financial_transactions_json);
            } catch {}
          }
        }
      } else {
        const raw = localStorage.getItem("venuekeeper-store-backup");
        if (raw) currentStoreData = JSON.parse(raw);
        const txRaw = localStorage.getItem("venuekeeper-transactions-backup");
        if (txRaw) {
          try {
            currentStoreData.transactions = JSON.parse(txRaw);
          } catch {}
        }
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
  async getDeletedReservations(): Promise<any[]> {
    if (window.electronAPI?.db?.getDeletedReservations) {
      return await window.electronAPI.db.getDeletedReservations();
    }
    return [];
  },
  async restoreReservation(id: string) {
    if (window.electronAPI?.db?.restoreReservation) {
      await window.electronAPI.db.restoreReservation(id);
    }
    await this.loadFromDb();
  },
  async permanentDeleteReservation(id: string) {
    if (window.electronAPI?.db?.permanentDeleteReservation) {
      await window.electronAPI.db.permanentDeleteReservation(id);
    }
    await this.loadFromDb();
  },
  async emptyRecycleBin() {
    if (window.electronAPI?.db?.emptyRecycleBin) {
      await window.electronAPI.db.emptyRecycleBin();
    }
    await this.loadFromDb();
  },
  async cleanupOldTrash(days?: number) {
    if (window.electronAPI?.db?.cleanupOldTrash) {
      await window.electronAPI.db.cleanupOldTrash(days);
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
  async updateVenue(arg1: any, arg2?: any) {
    const v = arg2 ? { ...arg2, id: arg1 } : arg1;
    if ((window.electronAPI?.db as any)?.updateVenue) {
      await (window.electronAPI?.db as any).updateVenue(v);
    } else {
      const idx = currentStoreData.venues.findIndex((x) => x.id === v.id);
      if (idx !== -1) {
        currentStoreData.venues[idx] = { ...currentStoreData.venues[idx], ...v };
        localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
      }
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
  async updateHall(arg1: any, arg2?: any) {
    const h = arg2 ? { ...arg2, id: arg2.id || (typeof arg1 === "string" ? arg2.id : arg1.id), venueId: typeof arg1 === "string" ? arg1 : arg1.venueId } : arg1;
    if ((window.electronAPI?.db as any)?.updateHall) {
      await (window.electronAPI?.db as any).updateHall(h);
    } else {
      for (const v of currentStoreData.venues) {
        const hIdx = v.halls.findIndex((x) => x.id === h.id);
        if (hIdx !== -1) {
          v.halls[hIdx] = { ...v.halls[hIdx], ...h };
          localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
          break;
        }
      }
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
  async updatePersonnel(p: any) {
    if (window.electronAPI?.db?.updatePersonnel) {
      await window.electronAPI.db.updatePersonnel(p);
    } else {
      if (currentStoreData.personnel) {
        currentStoreData.personnel = currentStoreData.personnel.map((x) =>
          x.id === p.id ? { ...x, ...p } : x
        );
      }
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
  async addCustomer(c: any) {
    if (window.electronAPI?.db?.addCustomer) {
      await window.electronAPI.db.addCustomer(c);
    } else {
      if (!currentStoreData.customers) currentStoreData.customers = [];
      currentStoreData.customers.push({ ...c, id: Math.random().toString(36).slice(2) });
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async updateCustomer(c: any) {
    if (window.electronAPI?.db?.updateCustomer) {
      await window.electronAPI.db.updateCustomer(c);
    } else {
      if (!currentStoreData.customers) currentStoreData.customers = [];
      const idx = currentStoreData.customers.findIndex((x) => x.id === c.id);
      if (idx !== -1) currentStoreData.customers[idx] = c;
      localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
    }
    await this.loadFromDb();
  },
  async deleteCustomer(id: string) {
    if (window.electronAPI?.db?.deleteCustomer) {
      await window.electronAPI.db.deleteCustomer(id);
    } else {
      if (currentStoreData.customers) {
        currentStoreData.customers = currentStoreData.customers.filter((x) => x.id !== id);
        localStorage.setItem("venuekeeper-store-backup", JSON.stringify(currentStoreData));
      }
    }
    await this.loadFromDb();
  },
  async addTransaction(t: any) {
    if (!currentStoreData.transactions) currentStoreData.transactions = [];
    const newTx = {
      ...t,
      id: t.id || Math.random().toString(36).slice(2, 10),
      createdAt: t.createdAt || new Date().toISOString(),
    };
    currentStoreData.transactions.push(newTx);
    localStorage.setItem("venuekeeper-transactions-backup", JSON.stringify(currentStoreData.transactions));
    if (window.electronAPI?.db?.setSetting) {
      await window.electronAPI.db.setSetting("financial_transactions_json", JSON.stringify(currentStoreData.transactions));
    }
    notifyListeners();
    await this.loadFromDb();
  },
  async updateTransaction(t: any) {
    if (!currentStoreData.transactions) currentStoreData.transactions = [];
    const idx = currentStoreData.transactions.findIndex((x) => x.id === t.id);
    if (idx !== -1) {
      currentStoreData.transactions[idx] = { ...currentStoreData.transactions[idx], ...t };
    }
    localStorage.setItem("venuekeeper-transactions-backup", JSON.stringify(currentStoreData.transactions));
    if (window.electronAPI?.db?.setSetting) {
      await window.electronAPI.db.setSetting("financial_transactions_json", JSON.stringify(currentStoreData.transactions));
    }
    notifyListeners();
    await this.loadFromDb();
  },
  async deleteTransaction(id: string) {
    if (currentStoreData.transactions) {
      currentStoreData.transactions = currentStoreData.transactions.filter((x) => x.id !== id);
      localStorage.setItem("venuekeeper-transactions-backup", JSON.stringify(currentStoreData.transactions));
      if (window.electronAPI?.db?.setSetting) {
        await window.electronAPI.db.setSetting("financial_transactions_json", JSON.stringify(currentStoreData.transactions));
      }
    }
    notifyListeners();
    await this.loadFromDb();
  },
};

export function useSQLiteStore() {
  const [store, setStore] = useState<Store>({ venues: [], reservations: [], personnel: [], customers: [] });
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
      setReady(true);
    } catch (error) {
      console.error("Failed to load store data:", error);
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
    addCustomer: sqliteStore.addCustomer.bind(sqliteStore),
    updateCustomer: sqliteStore.updateCustomer.bind(sqliteStore),
    removeCustomer: sqliteStore.deleteCustomer.bind(sqliteStore),
  };
}
