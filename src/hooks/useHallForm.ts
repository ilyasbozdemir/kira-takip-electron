import { useState } from "react";
import { toast } from "sonner";
import { sqliteStore } from "@/lib/db-client";

export function useHallForm() {
  const [targetVenueId, setTargetVenueId] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallFloor, setNewHallFloor] = useState("1. Kat");
  const [newHallCapacity, setNewHallCapacity] = useState(250);
  const [newHallHourlyPrice, setNewHallHourlyPrice] = useState(1500);
  const [newHallColor, setNewHallColor] = useState("#8b5cf6");

  const handleCreateHall = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!targetVenueId || !newHallName) {
      toast.error("Salon adı zorunludur.");
      return;
    }
    try {
      await sqliteStore.addHall({
        venueId: targetVenueId,
        name: newHallName,
        capacity: Number(newHallCapacity),
        hourlyPrice: Number(newHallHourlyPrice),
        floor: newHallFloor,
        color: newHallColor,
      });
      setNewHallName("");
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
    newHallColor,
    setNewHallColor,
    handleCreateHall,
  };
}
