import { type Store, type Reservation } from "@/lib/rental-store";

export interface AccountingScreenProps {
  theme: "dark" | "light";
  store: Store;
  onAddTransaction: (t: any) => Promise<void> | void;
  onUpdateTransaction: (t: any) => Promise<void> | void;
  onDeleteTransaction: (id: string) => Promise<void> | void;
  onSelectReservation?: (res: Reservation) => void;
  institutionName?: string;
  institutionSubHeader?: string;
  institutionLogo?: string;
  authorizedPersonnelName?: string;
  authorizedPersonnelTitle?: string;
}


