import { useState, useMemo } from "react";
import { toast } from "sonner";
import { allEventTypes } from "@/lib/rental-store";

export function useEventTypes() {
  const [customEventTypes, setCustomEventTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("custom_event_types");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newEventTypeInput, setNewEventTypeInput] = useState("");

  const mergedEventTypes = useMemo(() => {
    const set = new Set([...allEventTypes, ...customEventTypes]);
    return Array.from(set);
  }, [customEventTypes]);

  const handleAddCustomEventType = (typeName?: string) => {
    const val = (typeName || newEventTypeInput).trim();
    if (!val) return;
    if (mergedEventTypes.includes(val)) {
      toast.error(`"${val}" türü zaten mevcut.`);
      return;
    }
    const updated = [...customEventTypes, val];
    setCustomEventTypes(updated);
    localStorage.setItem("custom_event_types", JSON.stringify(updated));
    setNewEventTypeInput("");
    toast.success(`"${val}" türü eklendi.`);
  };

  const handleRemoveEventType = (val: string) => {
    const updated = customEventTypes.filter((t) => t !== val);
    setCustomEventTypes(updated);
    localStorage.setItem("custom_event_types", JSON.stringify(updated));
    toast.info(`"${val}" türü listeden kaldırıldı.`);
  };

  const handleResetEventTypes = () => {
    setCustomEventTypes([]);
    localStorage.removeItem("custom_event_types");
    toast.success("Etkinlik türleri varsayılan değerlere sıfırlandı.");
  };

  const getEventTypeColor = (type?: string): string => {
    switch (type) {
      case "Düğün & Davet":
        return "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400";
      case "Nişan & Kına":
        return "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
      case "Sünnet Düğünü":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
      case "Konser & Tiyatro":
        return "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400";
      case "Kongre & Seminer":
        return "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400";
      case "Toplantı & Lansman":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400";
      case "Sergi & Fuar":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
      case "Mezuniyet & Balo":
        return "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400";
      case "Spor & Turnuva":
        return "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400";
      case "İftar & Yemek":
        return "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400";
    }
  };

  return {
    customEventTypes,
    mergedEventTypes,
    newEventTypeInput,
    setNewEventTypeInput,
    handleAddCustomEventType,
    handleRemoveEventType,
    handleResetEventTypes,
    getEventTypeColor,
  };
}
