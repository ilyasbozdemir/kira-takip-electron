import type { Store } from "@/lib/rental-store";

export interface ReportsScreenProps {
  theme: "dark" | "light";
  monthStats: {
    totalRev: number;
    totalPaid: number;
    remaining: number;
  };
  store?: Store;
}

export interface VenueStatItem {
  id: string;
  name: string;
  category: string;
  count: number;
  totalRev: number;
  totalPaid: number;
  remaining: number;
  collectionRate: number;
}
