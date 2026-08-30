import React from "react";
import type { Store } from "@/lib/rental-store";

export interface SettingsScreenProps {
  theme: "dark" | "light";
  setMailModalOpen: (v: boolean) => void;
  newEventTypeInput: string;
  setNewEventTypeInput: (v: string) => void;
  handleAddCustomEventType: (typeName?: string) => void;
  handleResetEventTypes: () => void;
  handleRemoveEventType: (val: string) => void;
  allEventTypes: string[];
  getEventTypeColor: (type?: string) => string;
  gdriveToken: string;
  setGdriveToken: (v: string) => void;
  gdriveFolderId: string;
  setGdriveFolderId: (v: string) => void;
  draftAppName?: string;
  setDraftAppName?: (v: string) => void;
  draftInstitutionName: string;
  setDraftInstitutionName: (v: string) => void;
  draftInstitutionSubHeader: string;
  setDraftInstitutionSubHeader: (v: string) => void;
  draftInstitutionLogo: string;
  handleDraftLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDraftLogo: () => void;
  handleCancelInstitutionSettings: () => void;
  handleSaveInstitutionSettings: () => void;
  draftTariffBasis: string;
  setDraftTariffBasis: (v: string) => void;
  handleCancelTariffSettings: () => void;
  handleSaveTariffSettings: () => void;
  store: Store;
}
