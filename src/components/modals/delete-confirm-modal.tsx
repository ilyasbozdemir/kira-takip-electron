import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "dark" | "light";
  deleteTarget: {
    type: "venue" | "hall" | "reservation";
    id: string;
    title: string;
    venueId?: string;
  } | null;
  onExecuteDelete: () => void;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  theme,
  deleteTarget,
  onExecuteDelete,
}: DeleteConfirmModalProps): React.JSX.Element {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={theme === "dark"
          ? "bg-slate-900 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-500 text-base font-bold">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            Silme İşlemini Onaylayın
          </AlertDialogTitle>
          <AlertDialogDescription
            className={`text-xs ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <strong>"{deleteTarget?.title}"</strong> kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bağımlı kayıtlar kontrol edilecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            className={`text-xs h-9 ${
              theme === "dark"
                ? "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                : ""
            }`}
          >
            Vazgeç
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onExecuteDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 font-medium"
          >
            Evet, Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
