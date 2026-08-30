import type { Customer, Store } from "@/lib/rental-store";

export interface CustomersScreenProps {
  theme: "dark" | "light";
  store: Store;
  onAddCustomer: (c: Omit<Customer, "id">) => Promise<void>;
  onUpdateCustomer: (c: Customer) => Promise<void>;
  onRemoveCustomer: (id: string) => Promise<void>;
  onOpenMailModal?: (recipientEmail?: string) => void;
}
