import React from "react";
import {
  BookOpen,
  Mail,
  PartyPopper,
  Scale,
  User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdentityTab } from "./tabs/identity-tab";
import { TariffTab } from "./tabs/tariff-tab";
import { IntegrationsTab } from "./tabs/integrations-tab";
import { CategoriesTab } from "./tabs/categories-tab";
import { SystemGuideTab } from "./tabs/system-guide-tab";
import { SettingsScreenProps } from "./types";

export function SettingsScreen({
  theme,
  store,
  newEventTypeInput,
  setNewEventTypeInput,
  handleAddCustomEventType,
  handleResetEventTypes,
  handleRemoveEventType,
  allEventTypes,
  getEventTypeColor,
  draftAppName,
  setDraftAppName,
  draftInstitutionName,
  setDraftInstitutionName,
  draftInstitutionSubHeader,
  setDraftInstitutionSubHeader,
  draftInstitutionLogo,
  handleDraftLogoUpload,
  handleRemoveDraftLogo,
  handleCancelInstitutionSettings,
  handleSaveInstitutionSettings,
  draftTariffBasis,
  setDraftTariffBasis,
  handleCancelTariffSettings,
  handleSaveTariffSettings,
}: SettingsScreenProps): React.JSX.Element {
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Sistem ve Kurum Yapılandırması
        </h2>
        <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Kurumsal kimlik, tarife yasal dayanağı, SMTP sunucusu, etkinlik türleri ve sistem rehberi.
        </p>
      </div>

      <Tabs defaultValue="identity" className="w-full space-y-4">
        {/* Navigation Tab Triggers */}
        <TabsList
          className={`grid grid-cols-2 md:grid-cols-5 h-auto p-1 border gap-1 ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-400"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
        >
          <TabsTrigger
            value="identity"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <User className="h-3.5 w-3.5" /> Kimlik & Logo
          </TabsTrigger>
          <TabsTrigger
            value="tariff"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <Scale className="h-3.5 w-3.5" /> Tarife Dayanağı
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <Mail className="h-3.5 w-3.5" /> E-posta & Takvim
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-indigo-600 data-[state=active]:text-white shadow-xs"
          >
            <PartyPopper className="h-3.5 w-3.5" /> Etkinlik Türleri
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Sistem Rehberi
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Kurumsal Kimlik & Logo */}
        <TabsContent value="identity">
          <IdentityTab
            theme={theme}
            draftAppName={draftAppName}
            setDraftAppName={setDraftAppName}
            draftInstitutionName={draftInstitutionName}
            setDraftInstitutionName={setDraftInstitutionName}
            draftInstitutionSubHeader={draftInstitutionSubHeader}
            setDraftInstitutionSubHeader={setDraftInstitutionSubHeader}
            draftInstitutionLogo={draftInstitutionLogo}
            handleDraftLogoUpload={handleDraftLogoUpload}
            handleRemoveDraftLogo={handleRemoveDraftLogo}
            handleCancelInstitutionSettings={handleCancelInstitutionSettings}
            handleSaveInstitutionSettings={handleSaveInstitutionSettings}
          />
        </TabsContent>

        {/* TAB 2: Tarife Dayanağı */}
        <TabsContent value="tariff">
          <TariffTab
            theme={theme}
            draftTariffBasis={draftTariffBasis}
            setDraftTariffBasis={setDraftTariffBasis}
            handleCancelTariffSettings={handleCancelTariffSettings}
            handleSaveTariffSettings={handleSaveTariffSettings}
          />
        </TabsContent>

        {/* TAB 3: Entegrasyonlar & E-posta */}
        <TabsContent value="integrations">
          <IntegrationsTab theme={theme} store={store} />
        </TabsContent>

        {/* TAB 4: Etkinlik Türleri */}
        <TabsContent value="categories">
          <CategoriesTab
            theme={theme}
            newEventTypeInput={newEventTypeInput}
            setNewEventTypeInput={setNewEventTypeInput}
            handleAddCustomEventType={handleAddCustomEventType}
            handleResetEventTypes={handleResetEventTypes}
            handleRemoveEventType={handleRemoveEventType}
            allEventTypes={allEventTypes}
            getEventTypeColor={getEventTypeColor}
          />
        </TabsContent>

        {/* TAB 5: Sistem Rehberi */}
        <TabsContent value="guide">
          <SystemGuideTab theme={theme} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export * from "./types";
