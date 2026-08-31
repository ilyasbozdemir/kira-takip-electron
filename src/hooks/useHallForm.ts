import { useState, useCallback } from "react";
import { toast } from "sonner";
import { sqliteStore } from "@/lib/db-client";

export function useHallForm() {
  const [targetVenueId, setTargetVenueId] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallFloor, setNewHallFloor] = useState("1. Kat");
  const [newHallCapacity, setNewHallCapacity] = useState(250);
  const [newHallHourlyPrice, setNewHallHourlyPrice] = useState(1500);
  const [newHallPricingType, setNewHallPricingType] = useState<"session" | "hourly" | "daily">("session");
  const [newHallColor, setNewHallColor] = useState("#8b5cf6");

  const resetHallForm = useCallback(() => {
    setNewHallName("");
    setNewHallFloor("1. Kat");
    setNewHallCapacity(250);
    setNewHallHourlyPrice(1500);
    setNewHallPricingType("session");
    setNewHallColor("#8b5cf6");
  }, []);

  const handleCreateHall = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!targetVenueId || !newHallName.trim()) {
      toast.error("Salon adı zorunludur.");
      return;
    }
    try {
      await sqliteStore.addHall({
        venueId: targetVenueId,
        name: newHallName.trim(),
        capacity: Number(newHallCapacity) || 100,
        hourlyPrice: Number(newHallHourlyPrice) || 0,
        pricingType: newHallPricingType,
        floor: newHallFloor.trim() || "1. Kat",
        color: newHallColor || "#8b5cf6",
      });
      resetHallForm();
      if (onSuccess) onSuccess();
      toast.success("Salon mekana eklendi!");
    } catch (err: any) {
      toast.error(`Salon ekleme hatası: ${err.message || err}`);
    }
  };

  return {
    targetVenueId,
    setTargetVenueId,
    newHallName,
    setNewHallName,
    newHallFloor,
    setNewHallFloor,
    newHallCapacity,
    setNewHallCapacity,
    newHallHourlyPrice,
    setNewHallHourlyPrice,
    newHallPricingType,
    setNewHallPricingType,
    newHallColor,
    setNewHallColor,
    handleCreateHall,
    resetHallForm,
  };
}
