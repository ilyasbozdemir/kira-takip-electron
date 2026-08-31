import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { sqliteStore } from "@/lib/db-client";

export function useVenueForm(defaultCity: string = "Ankara", defaultDistrict: string = "Çankaya") {
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueCity, setNewVenueCity] = useState(defaultCity || "Ankara");
  const [newVenueDistrict, setNewVenueDistrict] = useState(defaultDistrict || "Çankaya");
  const [newVenueAddress, setNewVenueAddress] = useState("");
  const [newVenueMapUrl, setNewVenueMapUrl] = useState("");
  const [newVenueCategory, setNewVenueCategory] = useState("Kongre & Balo");
  const [newVenueManagerPersonnelId, setNewVenueManagerPersonnelId] = useState("");
  const [newVenueManagerName, setNewVenueManagerName] = useState("");
  const [newVenueManagerTitle, setNewVenueManagerTitle] = useState("Tesis Sorumlusu");
  const [newVenueManagerPhone, setNewVenueManagerPhone] = useState("");
  const [newVenueColor, setNewVenueColor] = useState("#6366f1");

  useEffect(() => {
    if (defaultCity) setNewVenueCity(defaultCity);
    if (defaultDistrict) setNewVenueDistrict(defaultDistrict);
  }, [defaultCity, defaultDistrict]);

  const resetVenueForm = useCallback(() => {
    setNewVenueName("");
    setNewVenueCity(defaultCity || "Ankara");
    setNewVenueDistrict(defaultDistrict || "Çankaya");
    setNewVenueAddress("");
    setNewVenueMapUrl("");
    setNewVenueCategory("Kongre & Balo");
    setNewVenueManagerPersonnelId("");
    setNewVenueManagerName("");
    setNewVenueManagerTitle("Tesis Sorumlusu");
    setNewVenueManagerPhone("");
    setNewVenueColor("#6366f1");
  }, [defaultCity, defaultDistrict]);

  const handleCreateVenue = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!newVenueName.trim()) {
      toast.error("Lütfen mekan adını girin.");
      return;
    }
    const combinedDistrict = newVenueCity
      ? `${newVenueDistrict || "Merkez"} / ${newVenueCity}`
      : (newVenueDistrict.trim() || "Merkez");

    try {
      await sqliteStore.addVenue({
        name: newVenueName.trim(),
        district: combinedDistrict,
        category: newVenueCategory,
        address: newVenueAddress.trim() || undefined,
        mapUrl: newVenueMapUrl.trim() || undefined,
        managerPersonnelId: newVenueManagerPersonnelId || undefined,
        managerName: newVenueManagerName.trim() || undefined,
        managerTitle: newVenueManagerTitle.trim() || undefined,
        managerPhone: newVenueManagerPhone.trim() || undefined,
        color: newVenueColor || "#6366f1",
      });
      resetVenueForm();
      if (onSuccess) onSuccess();
      toast.success("Yeni mekan başarıyla tanımlandı!");
    } catch (err: any) {
      toast.error(`Mekan oluşturma hatası: ${err.message || err}`);
    }
  };

  return {
    newVenueName,
    setNewVenueName,
    newVenueCity,
    setNewVenueCity,
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
    resetVenueForm,
  };
}
