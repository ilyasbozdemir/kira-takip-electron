import React from "react";
import type { Reservation, Store } from "@/lib/rental-store";
import { NewReservationModal } from "@/components/modals/new-reservation-modal";
import { NewVenueModal } from "@/components/modals/new-venue-modal";
import { NewHallModal } from "@/components/modals/new-hall-modal";
import { PersonnelModal } from "@/components/modals/personnel-modal";
import { MailDialog } from "@/components/mail-dialog";
import { CopySettingsModal } from "@/components/copy-settings-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { OfficialPrintModal } from "@/components/official-print-modal";
import { ReservationDrawer } from "@/components/modals/reservation-drawer";
import { LauncherModal } from "@/components/launcher-modal";
import { timeSlots } from "@/lib/rental-store";

interface AppModalsProps {
  theme: "dark" | "light";
  store: Store;
  selectedDay: string;
  setSelectedDay?: (day: string) => void;
  // New Reservation Props
  resModalOpen: boolean;
  setResModalOpen: (open: boolean) => void;
  resVenueId: string;
  setResVenueId: (v: string) => void;
  resHallId: string;
  setResHallId: (v: string) => void;
  resEventType: string;
  setResEventType: (v: string) => void;
  resCustomer: string;
  setResCustomer: (v: string) => void;
  pricingMode: any;
  setPricingMode: (v: any) => void;
  timeSlotSession?: "Gece" | "Gündüz" | "Tüm Gün";
  handleTimeSlotChange?: (session: "Gece" | "Gündüz" | "Tüm Gün") => void;
  resStart: string;
  setResStart: (v: string) => void;
  resEnd: string;
  setResEnd: (v: string) => void;
  guestCount?: number | "";
  setGuestCount?: (v: number | "") => void;
  resPhone: string;
  setResPhone: (v: string) => void;
  resPrice: number | "";
  setResPrice: (v: number | "") => void;
  resPaid: number | "";
  setResPaid: (v: number | "") => void;
  resStatus: string;
  setResStatus: (v: string) => void;
  resReceiptNo: string;
  setResReceiptNo: (v: string) => void;
  resPaymentMethod: string;
  setResPaymentMethod: (v: string) => void;
  resDecisionInfo: string;
  setResDecisionInfo: (v: string) => void;
  resNote: string;
  setResNote: (v: string) => void;
  mergedEventTypes: string[];
  customerSuggestions: string[];
  phoneSuggestions: string[];
  decisionSuggestions: string[];
  handleCreateReservation: (e: React.FormEvent) => void;

  // New Venue Props
  venueModalOpen: boolean;
  setVenueModalOpen: (open: boolean) => void;
  newVenueName: string;
  setNewVenueName: (v: string) => void;
  newVenueDistrict: string;
  setNewVenueDistrict: (v: string) => void;
  newVenueAddress: string;
  setNewVenueAddress: (v: string) => void;
  newVenueMapUrl: string;
  setNewVenueMapUrl: (v: string) => void;
  newVenueCategory: string;
  setNewVenueCategory: (v: string) => void;
  newVenueManagerName: string;
  setNewVenueManagerName: (v: string) => void;
  newVenueManagerTitle: string;
  setNewVenueManagerTitle: (v: string) => void;
  newVenueManagerPhone: string;
  setNewVenueManagerPhone: (v: string) => void;
  newVenueColor: string;
  setNewVenueColor: (v: string) => void;
  handleCreateVenue: (e: React.FormEvent) => void;

  // New Hall Props
  hallModalOpen: boolean;
  setHallModalOpen: (open: boolean) => void;
  newHallName: string;
  setNewHallName: (v: string) => void;
  newHallFloor: string;
  setNewHallFloor: (v: string) => void;
  newHallCapacity: number;
  setNewHallCapacity: (v: number) => void;
  newHallHourlyPrice: number;
  setNewHallHourlyPrice: (v: number) => void;
  newHallColor: string;
  setNewHallColor: (v: string) => void;
  handleCreateHall: (e: React.FormEvent) => void;

  // Personnel Props
  personnelModalOpen: boolean;
  setPersonnelModalOpen: (open: boolean) => void;
  personnelName: string;
  setPersonnelName: (v: string) => void;
  personnelTitle: string;
  setPersonnelTitle: (v: string) => void;
  personnelPhone: string;
  setPersonnelPhone: (v: string) => void;
  personnelEmail: string;
  setPersonnelEmail: (v: string) => void;
  handleCreatePersonnel: (e: React.FormEvent) => void;
  removePersonnel: (id: string) => void;

  // Mail Modal Props
  mailModalOpen: boolean;
  setMailModalOpen: (open: boolean) => void;
  mailPreset: { recipient: string; subject: string; body: string };

  // Copy Settings Modal Props
  copyModalOpen: boolean;
  setCopyModalOpen: (open: boolean) => void;

  // Delete Confirm Modal Props
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (open: boolean) => void;
  deleteTarget: any;
  handleExecuteDelete: () => void;

  // Official Print Modal Props
  printModalOpen: boolean;
  setPrintModalOpen: (open: boolean) => void;
  selectedPrintReservation: Reservation | null;
  setSelectedPrintReservation: (r: Reservation | null) => void;
  institutionName: string;
  institutionSubHeader?: string;
  institutionLogo: string;
  defaultTariffBasis: string;
  hallById: (id: string) => any;

  // Reservation Drawer Props
  selectedReservation: Reservation | null;
  setSelectedReservation: React.Dispatch<React.SetStateAction<Reservation | null>>;
  editReceiptNo: string;
  setEditReceiptNo: (v: string) => void;
  editPaymentMethod: string;
  setEditPaymentMethod: (v: string) => void;
  editPaidAmount: number | "";
  setEditPaidAmount: (v: number | "") => void;
  updateReservationStatus: (id: string, status: "confirmed" | "option") => Promise<void>;
  updateReservationDetails: (id: string, details: Partial<Reservation>) => Promise<void>;
  handleCopySMS: (r: Reservation) => void;
  handleQuickMail: (r: Reservation) => void;
  promptDelete: (type: "venue" | "hall" | "reservation", id: string, title: string, venueId?: string) => void;

  // Launcher Modal Props
  showLauncherModal: boolean;
  setShowLauncherModal: (open: boolean) => void;
  currentFilePath: string;
  recentFiles: any[];
  openFile: (path?: string) => void;
  createFile: () => void;
  fetchRecentFiles: () => void;
}

export function AppModals({
  theme,
  store,
  selectedDay,
  resModalOpen,
  setResModalOpen,
  resVenueId,
  setResVenueId,
  resHallId,
  setResHallId,
  resEventType,
  setResEventType,
  resCustomer,
  setResCustomer,
  pricingMode,
  setPricingMode,
  timeSlotSession,
  handleTimeSlotChange,
  resStart,
  setResStart,
  resEnd,
  setResEnd,
  guestCount,
  setGuestCount,
  resPhone,
  setResPhone,
  resPrice,
  setResPrice,
  resPaid,
  setResPaid,
  resStatus,
  setResStatus,
  resReceiptNo,
  setResReceiptNo,
  resPaymentMethod,
  setResPaymentMethod,
  resDecisionInfo,
  setResDecisionInfo,
  resNote,
  setResNote,
  mergedEventTypes,
  customerSuggestions,
  phoneSuggestions,
  decisionSuggestions,
  handleCreateReservation,
  venueModalOpen,
  setVenueModalOpen,
  newVenueName,
  setNewVenueName,
  newVenueDistrict,
  setNewVenueDistrict,
  newVenueAddress,
  setNewVenueAddress,
  newVenueMapUrl,
  setNewVenueMapUrl,
  newVenueCategory,
  setNewVenueCategory,
  newVenueManagerName,
  setNewVenueManagerName,
  newVenueManagerTitle,
  setNewVenueManagerTitle,
  newVenueManagerPhone,
  setNewVenueManagerPhone,
  newVenueColor,
  setNewVenueColor,
  handleCreateVenue,
  hallModalOpen,
  setHallModalOpen,
  newHallName,
  setNewHallName,
  newHallFloor,
  setNewHallFloor,
  newHallCapacity,
  setNewHallCapacity,
  newHallHourlyPrice,
  setNewHallHourlyPrice,
  newHallColor,
  setNewHallColor,
  handleCreateHall,
  personnelModalOpen,
  setPersonnelModalOpen,
  personnelName,
  setPersonnelName,
  personnelTitle,
  setPersonnelTitle,
  personnelPhone,
  setPersonnelPhone,
  personnelEmail,
  setPersonnelEmail,
  handleCreatePersonnel,
  removePersonnel,
  mailModalOpen,
  setMailModalOpen,
  mailPreset,
  copyModalOpen,
  setCopyModalOpen,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  deleteTarget,
  handleExecuteDelete,
  printModalOpen,
  setPrintModalOpen,
  selectedPrintReservation,
  setSelectedPrintReservation,
  institutionName,
  institutionSubHeader,
  institutionLogo,
  defaultTariffBasis,
  hallById,
  selectedReservation,
  setSelectedReservation,
  editReceiptNo,
  setEditReceiptNo,
  editPaymentMethod,
  setEditPaymentMethod,
  editPaidAmount,
  setEditPaidAmount,
  updateReservationStatus,
  updateReservationDetails,
  handleCopySMS,
  handleQuickMail,
  promptDelete,
  showLauncherModal,
  setShowLauncherModal,
  currentFilePath,
  recentFiles,
  openFile,
  createFile,
  fetchRecentFiles,
}: AppModalsProps): React.JSX.Element {
  return (
    <>
      <NewReservationModal
        open={resModalOpen}
        onOpenChange={setResModalOpen}
        theme={theme}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        resVenueId={resVenueId}
        setResVenueId={setResVenueId}
        resHallId={resHallId}
        setResHallId={setResHallId}
        resEventType={resEventType}
        setResEventType={setResEventType}
        resCustomer={resCustomer}
        setResCustomer={setResCustomer}
        pricingMode={pricingMode}
        setPricingMode={setPricingMode}
        timeSlotSession={timeSlotSession}
        handleTimeSlotChange={handleTimeSlotChange}
        resStart={resStart}
        setResStart={setResStart}
        resEnd={resEnd}
        setResEnd={setResEnd}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        resPhone={resPhone}
        setResPhone={setResPhone}
        resPrice={resPrice}
        setResPrice={setResPrice}
        resPaid={resPaid}
        setResPaid={setResPaid}
        resStatus={resStatus}
        setResStatus={setResStatus}
        resReceiptNo={resReceiptNo}
        setResReceiptNo={setResReceiptNo}
        resPaymentMethod={resPaymentMethod}
        setResPaymentMethod={setResPaymentMethod}
        resDecisionInfo={resDecisionInfo}
        setResDecisionInfo={setResDecisionInfo}
        resNote={resNote}
        setResNote={setResNote}
        store={store}
        allEventTypes={mergedEventTypes}
        customerSuggestions={customerSuggestions}
        phoneSuggestions={phoneSuggestions}
        decisionSuggestions={decisionSuggestions}
        timeSlots={timeSlots}
        handleCreateReservation={handleCreateReservation}
      />

      <NewVenueModal
        open={venueModalOpen}
        onOpenChange={setVenueModalOpen}
        theme={theme}
        newVenueName={newVenueName}
        setNewVenueName={setNewVenueName}
        newVenueDistrict={newVenueDistrict}
        setNewVenueDistrict={setNewVenueDistrict}
        newVenueAddress={newVenueAddress}
        setNewVenueAddress={setNewVenueAddress}
        newVenueMapUrl={newVenueMapUrl}
        setNewVenueMapUrl={setNewVenueMapUrl}
        newVenueCategory={newVenueCategory}
        setNewVenueCategory={setNewVenueCategory}
        newVenueManagerName={newVenueManagerName}
        setNewVenueManagerName={setNewVenueManagerName}
        newVenueManagerTitle={newVenueManagerTitle}
        setNewVenueManagerTitle={setNewVenueManagerTitle}
        newVenueManagerPhone={newVenueManagerPhone}
        setNewVenueManagerPhone={setNewVenueManagerPhone}
        newVenueColor={newVenueColor}
        setNewVenueColor={setNewVenueColor}
        store={store}
        handleCreateVenue={handleCreateVenue}
      />

      <NewHallModal
        open={hallModalOpen}
        onOpenChange={setHallModalOpen}
        theme={theme}
        newHallName={newHallName}
        setNewHallName={setNewHallName}
        newHallFloor={newHallFloor}
        setNewHallFloor={setNewHallFloor}
        newHallCapacity={newHallCapacity}
        setNewHallCapacity={setNewHallCapacity}
        newHallHourlyPrice={newHallHourlyPrice}
        setNewHallHourlyPrice={setNewHallHourlyPrice}
        newHallColor={newHallColor}
        setNewHallColor={setNewHallColor}
        handleCreateHall={handleCreateHall}
      />

      <PersonnelModal
        open={personnelModalOpen}
        onOpenChange={setPersonnelModalOpen}
        theme={theme}
        personnelName={personnelName}
        setPersonnelName={setPersonnelName}
        personnelTitle={personnelTitle}
        setPersonnelTitle={setPersonnelTitle}
        personnelPhone={personnelPhone}
        setPersonnelPhone={setPersonnelPhone}
        personnelEmail={personnelEmail}
        setPersonnelEmail={setPersonnelEmail}
        store={store}
        handleCreatePersonnel={handleCreatePersonnel}
        removePersonnel={removePersonnel}
      />

      <MailDialog
        open={mailModalOpen}
        onOpenChange={setMailModalOpen}
        defaultRecipient={mailPreset.recipient}
        defaultSubject={mailPreset.subject}
        defaultBody={mailPreset.body}
        theme={theme}
      />

      <CopySettingsModal
        open={copyModalOpen}
        onOpenChange={setCopyModalOpen}
        theme={theme}
      />

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        theme={theme}
        deleteTarget={deleteTarget}
        onExecuteDelete={handleExecuteDelete}
      />

      <OfficialPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        reservation={selectedPrintReservation}
        venue={store.venues.find(
          (v) => v.id === selectedPrintReservation?.venueId
        )}
        hall={hallById(selectedPrintReservation?.hallId || "")}
        institutionName={institutionName}
        institutionSubHeader={institutionSubHeader}
        institutionLogo={institutionLogo}
        defaultTariffBasis={defaultTariffBasis}
        theme={theme}
      />

      <ReservationDrawer
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        theme={theme}
        store={store}
        hallById={hallById}
        editReceiptNo={editReceiptNo}
        setEditReceiptNo={setEditReceiptNo}
        editPaymentMethod={editPaymentMethod}
        setEditPaymentMethod={setEditPaymentMethod}
        editPaidAmount={editPaidAmount}
        setEditPaidAmount={setEditPaidAmount}
        updateReservationStatus={updateReservationStatus}
        updateReservationDetails={updateReservationDetails}
        setSelectedReservation={setSelectedReservation}
        onPrintDoc={(r) => {
          setSelectedPrintReservation(r);
          setPrintModalOpen(true);
        }}
        onCopySMS={handleCopySMS}
        onQuickMail={handleQuickMail}
        onPromptDelete={(type, id, title) => promptDelete(type, id, title)}
      />

      {showLauncherModal && (
        <LauncherModal
          open={showLauncherModal}
          onOpenChange={setShowLauncherModal}
          currentFilePath={currentFilePath || ""}
          recentFiles={recentFiles}
          onOpenRecent={(p) => openFile(p)}
          onCreateNew={() => createFile()}
          onOpenDialog={() => openFile()}
          onClearRecent={() => {
            localStorage.removeItem("recent_vke_files");
            fetchRecentFiles();
          }}
          theme={theme}
        />
      )}
    </>
  );
}
