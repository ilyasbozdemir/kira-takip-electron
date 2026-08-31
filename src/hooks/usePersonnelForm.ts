import { useState, useCallback } from "react";
import { toast } from "sonner";
import { sqliteStore } from "@/lib/db-client";

export function usePersonnelForm() {
  const [personnelName, setPersonnelName] = useState("");
  const [personnelTitle, setPersonnelTitle] = useState("");
  const [personnelPhone, setPersonnelPhone] = useState("");
  const [personnelEmail, setPersonnelEmail] = useState("");
  const [personnelNotes, setPersonnelNotes] = useState("");

  const resetPersonnelForm = useCallback(() => {
    setPersonnelName("");
    setPersonnelTitle("");
    setPersonnelPhone("");
    setPersonnelEmail("");
    setPersonnelNotes("");
  }, []);

  const handleCreatePersonnel = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!personnelName.trim()) {
      toast.error("Lütfen personel adını girin.");
      return;
    }
    try {
      await sqliteStore.addPersonnel({
        name: personnelName.trim(),
        title: personnelTitle.trim() || undefined,
        phone: personnelPhone.trim() || undefined,
        email: personnelEmail.trim() || undefined,
        notes: personnelNotes.trim() || undefined,
      });
      resetPersonnelForm();
      if (onSuccess) onSuccess();
      toast.success("Yeni personel başarıyla eklendi.");
    } catch (err: any) {
      toast.error(`Personel ekleme hatası: ${err.message || err}`);
    }
  };

  const removePersonnel = async (id: string) => {
    try {
      await sqliteStore.deletePersonnel(id);
      toast.success("Personel kaydı silindi.");
    } catch (err: any) {
      toast.error(`Silme hatası: ${err.message || err}`);
    }
  };

  return {
    personnelName,
    setPersonnelName,
    personnelTitle,
    setPersonnelTitle,
    personnelPhone,
    setPersonnelPhone,
    personnelEmail,
    setPersonnelEmail,
    personnelNotes,
    setPersonnelNotes,
    handleCreatePersonnel,
    removePersonnel,
    resetPersonnelForm,
  };
}
