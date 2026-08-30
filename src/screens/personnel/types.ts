import React from "react";
import type { Venue, Personnel } from "@/lib/rental-store";

export interface PersonnelScreenProps {
  theme: "dark" | "light";
  store: {
    personnel?: Personnel[];
    venues: Venue[];
  };
  personnelName: string;
  setPersonnelName: (v: string) => void;
  personnelTitle: string;
  setPersonnelTitle: (v: string) => void;
  personnelPhone: string;
  setPersonnelPhone: (v: string) => void;
  personnelEmail: string;
  setPersonnelEmail: (v: string) => void;
  personnelNotes: string;
  setPersonnelNotes: (v: string) => void;
  handleCreatePersonnel: (e: React.FormEvent) => void;
  removePersonnel: (id: string) => void;
  onOpenPersonnelModal: () => void;
}
