import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Modifications non sauvegardées",
  description = "Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ? Vos modifications seront perdues.",
  confirmText = "Quitter",
  cancelText = "Rester",
}) => {
  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle className="text-destructive">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
