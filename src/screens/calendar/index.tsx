import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarGridView } from "./calendar-grid-view";
import { CalendarTimelineView } from "./calendar-timeline-view";
import { CalendarDayPanel } from "./calendar-day-panel";
import { CalendarAgendaModal } from "./calendar-agenda-modal";
import { CalendarScreenProps, RightPanelViewMode } from "./types";

export function CalendarScreen({
  theme,
  cursor,
  setCursor,
  selectedDay,
  setSelectedDay,
  calendarViewMode,
  setCalendarViewMode,
  calendarVenueFilter,
  setCalendarVenueFilter,
  store,
  grid,
  byDate,
  filteredReservations,
  hallById,
  getEventTypeColor,
  today,
  workingYear,
  setWorkingYear,
  onOpenExportModal,
  onOpenNewReservationModal,
  onSelectReservation,
  onPromptDeleteReservation,
  onPrintOfficialDoc,
  onCopySMS,
  onQuickMail,
  onNavigateToCustomer,
}: CalendarScreenProps): React.JSX.Element {
  const [rightPanelViewMode, setRightPanelViewMode] = useState<RightPanelViewMode>("list");
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);

  const dayReservations = byDate.get(selectedDay) ?? [];

  return (
    <div className="space-y-4">
      {/* Calendar Toolbar */}
      <CalendarToolbar
        theme={theme}
        cursor={cursor}
        setCursor={setCursor}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        calendarViewMode={calendarViewMode}
        setCalendarViewMode={setCalendarViewMode}
        calendarVenueFilter={calendarVenueFilter}
        setCalendarVenueFilter={setCalendarVenueFilter}
        venues={store.venues}
        today={today}
        workingYear={workingYear}
        setWorkingYear={setWorkingYear}
        onOpenExportModal={onOpenExportModal}
        onOpenNewReservationModal={onOpenNewReservationModal}
      />

      {/* Main Calendar Grid & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar Grid or Timeline */}
        <Card
          className={`lg:col-span-8 ${
            theme === "dark"
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <CardContent className="p-4">
            {calendarViewMode === "grid" ? (
              <CalendarGridView
                theme={theme}
                grid={grid}
                today={today}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                byDate={byDate}
                calendarVenueFilter={calendarVenueFilter}
                venues={store.venues}
                hallById={hallById}
                getEventTypeColor={getEventTypeColor}
                onSelectReservation={onSelectReservation}
                onOpenNewReservationModal={onOpenNewReservationModal}
              />
            ) : (
              <CalendarTimelineView
                theme={theme}
                cursor={cursor}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                filteredReservations={filteredReservations}
                venues={store.venues}
                hallById={hallById}
                getEventTypeColor={getEventTypeColor}
                onSelectReservation={onSelectReservation}
              />
            )}
          </CardContent>
        </Card>

        {/* Right Column: Selected Day Details Panel */}
        <CalendarDayPanel
          theme={theme}
          selectedDay={selectedDay}
          dayReservations={dayReservations}
          rightPanelViewMode={rightPanelViewMode}
          setRightPanelViewMode={setRightPanelViewMode}
          venues={store.venues}
          hallById={hallById}
          getEventTypeColor={getEventTypeColor}
          onOpenNewReservationModal={onOpenNewReservationModal}
          onOpenExpandedModal={() => setIsExpandedModalOpen(true)}
          onSelectReservation={onSelectReservation}
          onPromptDeleteReservation={onPromptDeleteReservation}
          onPrintOfficialDoc={onPrintOfficialDoc}
          onCopySMS={onCopySMS}
          onQuickMail={onQuickMail}
          onNavigateToCustomer={onNavigateToCustomer}
        />
      </div>

      {/* Expanded Full-Screen Day Agenda Modal */}
      <CalendarAgendaModal
        theme={theme}
        isOpen={isExpandedModalOpen}
        onOpenChange={setIsExpandedModalOpen}
        selectedDay={selectedDay}
        dayReservations={dayReservations}
        venues={store.venues}
        hallById={hallById}
        getEventTypeColor={getEventTypeColor}
        onOpenNewReservationModal={onOpenNewReservationModal}
        onSelectReservation={onSelectReservation}
        onPrintOfficialDoc={onPrintOfficialDoc}
        onQuickMail={onQuickMail}
        onNavigateToCustomer={onNavigateToCustomer}
      />
    </div>
  );
}

export * from "./types";
