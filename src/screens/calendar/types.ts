import { type Reservation, type Venue } from "@/lib/rental-store";

export type RightPanelViewMode = "list" | "timeline" | "table" | "cards";

export interface CalendarScreenProps {
  theme: "dark" | "light";
  cursor: Date;
  setCursor: (d: Date) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  calendarViewMode: "grid" | "timeline";
  setCalendarViewMode: (mode: "grid" | "timeline") => void;
  calendarVenueFilter: string;
  setCalendarVenueFilter: (v: string) => void;
  store: {
    venues: Venue[];
    reservations: Reservation[];
  };
  grid: (Date | null)[];
  byDate: Map<string, Reservation[]>;
  filteredReservations: Reservation[];
  hallById: (id: string) => { name: string; color?: string } | undefined;
  getEventTypeColor: (type?: string) => string;
  today: Date;
  onOpenNewReservationModal: () => void;
  onSelectReservation: (r: Reservation) => void;
  onPromptDeleteReservation: (id: string, title: string) => void;
  onPrintOfficialDoc: (r: Reservation) => void;
  onCopySMS: (r: Reservation) => void;
  onQuickMail: (r: Reservation) => void;
  onNavigateToCustomer?: (customerName: string) => void;
}
