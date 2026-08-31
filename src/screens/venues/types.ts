import { type Hall, type Venue, type Store } from "@/lib/rental-store";

export interface VenuesScreenProps {
  theme: "dark" | "light";
  store: Store;
  onOpenVenueModal: () => void;
  onOpenHallModal: (venueId: string) => void;
  onPromptDelete: (type: "venue" | "hall", id: string, title: string, venueId?: string) => void;
  onOpenNewReservationModal?: (venueId?: string, hallId?: string) => void;
  onNavigateToCalendar?: (venueId?: string) => void;
  defaultCity?: string;
  defaultDistrict?: string;
}
