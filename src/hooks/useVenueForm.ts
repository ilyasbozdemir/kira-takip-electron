import { useState } from "react";
import { toast } from "sonner";
import { sqliteStore } from "@/lib/db-client";

export function useVenueForm() {
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueDistrict, setNewVenueDistrict] = useState("");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueMapUrl, setNewVenueMapUrl] = useState("");
  const [newVenueCategory, setNewVenueCategory] = useState("Kongre & Balo");
  const [newVenueManagerPersonnelId, setNewVenueManagerPersonnelId] = useState("");
  const [newVenueManagerName, setNewVenueManagerName] = useState("");
  const [newVenueManagerTitle, setNewVenueManagerTitle] = useState("Tesis Sorumlusu");
  const [newVenueManagerPhone, setNewVenueManagerPhone] = useState("");
  const [newVenueColor, setNewVenueColor] = useState("#6366f1");

  const handleCreateVenue = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!newVenueName || !newVenueDistrict) {
      toast.error("Lütfen mekan adı ve ilçe bilgisini girin.");
      return;
    }
    try {
      await sqliteStore.addVenue({
        name: newVenueName,
        district: newVenueDistrict,
        category: newVenueCategory,
        address: newVenueAddress.trim() || undefined,
        mapUrl: newVenueMapUrl.trim() || undefined,
        managerPersonnelId: newVenueManagerPersonnelId || undefined,
        managerName: newVenueManagerName.trim() || undefined,
        managerTitle: newVenueManagerTitle.trim() || undefined,
        managerPhone: newVenueManagerPhone.trim() || undefined,
        color: newVenueColor,
      });
      setNewVenueName("");
      setNewVenueDistrict("");
      setNewVenueAddress("");
      setNewVenueMapUrl("");
      setNewVenueManagerPersonnelId("");
      setNewVenueManagerName("");
      setNewVenueManagerPhone("");
      if (onSuccess) onSuccess();
      toast.success("Yeni mekan başarıyla tanımlandı!");
    } catch (err: any) {
      toast.error(`Mekan oluşturma hatası: ${err.message || err}`);
    }
  };

  return {
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
    newVenueManagerPersonnelId,
    setNewVenueManagerPersonnelId,
    newVenueManagerName,
    setNewVenueManagerName,
    newVenueManagerTitle,
    setNewVenueManagerTitle,
    newVenueManagerPhone,
    setNewVenueManagerPhone,
    newVenueColor,
    setNewVenueColor,
    handleCreateVenue,
  };
}
