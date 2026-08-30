import React from "react";
import { PartyPopper, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoriesTabProps {
  theme: "dark" | "light";
  newEventTypeInput: string;
  setNewEventTypeInput: (v: string) => void;
  handleAddCustomEventType: (typeName?: string) => void;
  handleResetEventTypes: () => void;
  handleRemoveEventType: (val: string) => void;
  allEventTypes: string[];
  getEventTypeColor: (type?: string) => string;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  theme,
  newEventTypeInput,
  setNewEventTypeInput,
  handleAddCustomEventType,
  handleResetEventTypes,
  handleRemoveEventType,
  allEventTypes,
  getEventTypeColor,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-4 pt-1">
      <Card className={isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <PartyPopper className="h-5 w-5 text-indigo-500" /> Etkinlik ve Organizasyon Türleri
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Salon kiralarken seçilen etkinlik kategorilerini (Düğün, Konferans, Tiyatro, Seminer vb.) yönetin.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetEventTypes}
              className="text-xs h-8"
            >
              Varsayılanlara Sıfırla
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* Add New Type Input */}
          <div className="flex items-center gap-2">
            <Input
              value={newEventTypeInput}
              onChange={(e) => setNewEventTypeInput(e.target.value)}
              placeholder="Yeni etkinlik türü adı (örn: Sergi, Kokteyl, Turnuva)"
              className="text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomEventType();
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => handleAddCustomEventType()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4 font-semibold shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Tür Ekle
            </Button>
          </div>

          {/* Current Event Types List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-400">Tanımlı Etkinlik Türleri ({allEventTypes.length})</h4>
            <div className="flex flex-wrap gap-2">
              {allEventTypes.map((type) => {
                const colorClass = getEventTypeColor(type);
                return (
                  <div
                    key={type}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${colorClass}`}
                  >
                    <span className="font-bold text-xs">{type}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEventType(type)}
                      className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Etkinlik Türünü Sil"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
