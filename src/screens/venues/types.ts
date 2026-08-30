import { type Hall, type Venue, type Personnel } from "@/lib/rental-store";

export interface VenuesScreenProps {
  theme: "dark" | "light";
  store: {
    venues: Venue[];
    personnel?: Personnel[];
  };
  onOpenVenueModal: () => void;
  onOpenHallModal: (venueId: string) => void;
  onPromptDelete: (type: "venue" | "hall", id: string, title: string, venueId?: string) => void;
}
