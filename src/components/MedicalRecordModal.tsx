import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MedicalRecord, ID } from "@/shared/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react";

// Import Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface MedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recordData: Omit<MedicalRecord, "id">) => void;
  patientId: ID;
  category: string;
  editingRecord?: MedicalRecord | null;
  existingRecords?: MedicalRecord[];
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  open,
  onOpenChange,
  onSave,
  patientId,
  category,
  editingRecord,
  existingRecords = [],
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!editingRecord;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const unsavedChanges = useUnsavedChanges();
  const isSettingContentRef = useRef(false);

  // Éditeur Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: false, // ❌ désactive les listes numérotées
        bulletList: false, // ❌ désactive les listes à puces
      }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (isSettingContentRef.current) return;
      const currentContent = editor.getHTML();
      const currentState = JSON.stringify({ date, content: currentContent });
      unsavedChanges.handleContentChange(currentState);
    },
  });

  // ✅ LOGIQUE SIMPLE ET EFFICACE POUR VÉRIFIER LES DOUBLONS (comme dans l'ancienne version)
  // Dans la fonction checkDuplicate, ajoutez des console.log :
  // Dans MedicalRecordModal.tsx, remplacez la fonction checkDuplicate :

  const normalizeDate = (input: string | Date): string => {
    if (!input) return "";
    try {
      if (input instanceof Date) {
        // Formater comme date locale (ex: 2025-10-31)
        return input.toLocaleDateString("fr-CA"); // format ISO local
      }
      const dateObj = new Date(input);
      return dateObj.toLocaleDateString("fr-CA");
    } catch (err) {
      console.error("Erreur parsing date:", input, err);
      return "";
    }
  };

  const checkDuplicate = (): boolean => {
    if (!date || isEditing) return false;

    const selectedDate = normalizeDate(date);

    const isDuplicate = existingRecords.some((record) => {
      if (editingRecord && record.id === editingRecord.id) return false;

      const recordDate = normalizeDate(record.date);

      return (
        record.patientId === patientId &&
        record.category === category &&
        recordDate === selectedDate
      );
    });

    if (isDuplicate) {
      console.warn("🚨 Doublon détecté pour la date", selectedDate);
    }

    return isDuplicate;
  };

  // Réinitialiser le formulaire
  useEffect(() => {
    if (open) {
      let currentDate: string;
      let currentContent: string;

      if (editingRecord) {
        // Pour l'édition, formater la date correctement
        if (editingRecord.date instanceof Date) {
          currentDate = editingRecord.date.toISOString().split("T")[0];
        } else {
          // Si c'est une string, essayer d'extraire la partie date
          const dateMatch = String(editingRecord.date).match(
            /^(\d{4}-\d{2}-\d{2})/
          );
          currentDate = dateMatch
            ? dateMatch[1]
            : new Date().toISOString().split("T")[0];
        }
        currentContent = editingRecord.details || "";
      } else {
        // Pour l'ajout, utiliser la date du jour au format YYYY-MM-DD
        currentDate = new Date().toISOString().split("T")[0];
        currentContent = "";
      }

      console.log("📅 Date initialisée:", currentDate);
      setDate(currentDate);

      if (editor) {
        isSettingContentRef.current = true;
        editor.commands.setContent(currentContent);
        setTimeout(() => {
          unsavedChanges.setOriginalContent(
            JSON.stringify({ date: currentDate, content: currentContent })
          );
          isSettingContentRef.current = false;
        }, 50);
      }

      setErrors({});
    }
  }, [editingRecord, open, editor]);

  // VALIDATION AVANT SOUMISSION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = "La date est obligatoire";
    if (!editor?.getText().trim())
      newErrors.content = "Le contenu est obligatoire";

    // Vérifier doublon uniquement à l’ajout
    if (!isEditing && !newErrors.date) {
      if (checkDuplicate()) {
        newErrors.date =
          "Un enregistrement existe déjà pour cette date dans cette section";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!editor) return;

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    const dateObj = new Date(date);
    const recordData: Omit<MedicalRecord, "id"> = {
      patientId,
      category,
      date: dateObj,
      details: editor.getHTML(),
      createdBy: user?.id || 1,
    };

    unsavedChanges.reset();
    onOpenChange(false);
    onSave(recordData);
  };

  const handleDateChange = (value: string) => {
    setDate(value);

    // Effacer l'erreur de date si elle existe
    if (errors.date) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }

    if (editor && !isSettingContentRef.current) {
      const currentState = JSON.stringify({
        date: value,
        content: editor.getHTML(),
      });
      unsavedChanges.handleContentChange(currentState);
    }
  };

  const handleClose = () => {
    if (unsavedChanges.hasUnsavedChanges) {
      setPendingAction(() => () => {
        resetForm();
        onOpenChange(false);
      });
      setShowUnsavedDialog(true);
    } else {
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setErrors({});
    if (editor) {
      editor.commands.setContent("");
    }
    unsavedChanges.reset();
  };

  const handleUnsavedConfirm = () => {
    unsavedChanges.reset();
    pendingAction?.();
    setPendingAction(null);
  };

  const handleUnsavedCancel = () => {
    setPendingAction(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && unsavedChanges.hasUnsavedChanges) {
      setPendingAction(() => () => onOpenChange(false));
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  // Toolbar pour l'éditeur
  const Toolbar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("bold") ? "bg-accent" : ""
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("italic") ? "bg-accent" : ""
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("bulletList") ? "bg-accent" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("orderedList") ? "bg-accent" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const getSectionTitle = () => {
    const sectionLabels: Record<string, string> = {
      serologies_vaccinations: "Sérologies et Vaccinations",
      observations: "Observations",
      biologie: "Biologie",
      examens_complementaires: "Examens Complémentaires",
      traitements: "Traitements",
    };

    return sectionLabels[category] || category;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-4xl h-[80vh] flex flex-col"
          aria-describedby="medical-record-description"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing
                ? "Modifier l'enregistrement"
                : "Ajouter un enregistrement"}
            </DialogTitle>
            <p
              id="medical-record-description"
              className="text-sm text-muted-foreground"
            >
              Section: {getSectionTitle()}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className={errors.date ? "border-destructive" : ""}
              />
              {errors.date && (
                <p className="text-sm text-destructive mt-1">{errors.date}</p>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <Label className="mb-2">
                Contenu <span className="text-destructive">*</span>
              </Label>
              <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
                <Toolbar />
                <div className="flex-1 overflow-auto">
                  <EditorContent editor={editor} />
                </div>
              </div>
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(errors).length > 0}
            >
              {isEditing ? "Modifier" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleUnsavedConfirm}
        onCancel={handleUnsavedCancel}
        title="Modifications non sauvegardées"
        description="Vous avez des modifications non sauvegardées dans l'enregistrement médical. Voulez-vous vraiment quitter ? Vos modifications seront perdues."
        confirmText="Quitter"
        cancelText="Rester"
      />
    </>
  );
};
