import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Patient, Antecedent } from "@/shared/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Trash2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { dataService } from "@/shared/config/database";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";

// Import Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface AntecedentsCardProps {
  patient: Patient;
}

const ANTECEDENT_TYPES = [
  "Médicaux",
  "Chirurgicaux",
  "Allergies",
  "Statut Infectieux",
] as const;

export const AntecedentsCard: React.FC<AntecedentsCardProps> = ({
  patient,
}) => {
  const [activeType, setActiveType] =
    useState<(typeof ANTECEDENT_TYPES)[number]>("Médicaux");
  const [antecedents, setAntecedents] = useState<Antecedent[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { isAdmin } = useAuth();
  const { toast } = useToast();

  // Hook de gestion des changements non sauvegardés
  const unsavedChanges = useUnsavedChanges();

  // Éditeur Tiptap - 🔥 CORRECTION: Désactiver onUpdate lors de l'initialisation
  const isSettingContentRef = React.useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: false, // ❌ désactive les listes numérotées
        bulletList: false, // ❌ désactive les listes à puces
      }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      // 🔥 CORRECTION: Ignorer les updates pendant le setContent
      if (isSettingContentRef.current) {
        console.log("⏭️ Ignorer update pendant setContent");
        return;
      }

      const currentContent = editor.getHTML();
      unsavedChanges.handleContentChange(currentContent);
    },
  });

  const loadAntecedents = useCallback(async () => {
    try {
      console.log("🔄 Chargement des antécédents pour patient:", patient.id);
      const data = await dataService.getAntecedents(patient.id);
      console.log("📦 Données reçues de l'API:", data);
      setAntecedents(data);
    } catch (error) {
      console.error("❌ Erreur chargement antécédents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les antécédents",
        variant: "destructive",
      });
    }
  }, [patient.id, toast]);

  useEffect(() => {
    loadAntecedents();
  }, [loadAntecedents]);

  const getCurrentAntecedent = () => {
    // 🔥 CORRECTION: Normaliser les types pour ignorer les accents
    const normalizeType = (type: string) => {
      return type
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .trim();
    };

    const normalizedActiveType = normalizeType(activeType);

    const found = antecedents.find(
      (a) => normalizeType(a.type) === normalizedActiveType
    );

    console.log("🔍 Recherche antécédent normalisée:", {
      activeType,
      normalizedActiveType,
      antecedents: antecedents.map((a) => ({
        type: a.type,
        normalized: normalizeType(a.type),
        id: a.id,
      })),
      found,
    });

    return found;
  };

  const currentAntecedent = getCurrentAntecedent();
  const currentContent = currentAntecedent?.content || "";

  const handleEdit = () => {
    const contentToSet = currentContent || "";

    // 🔥 CORRECTION: Définir le flag AVANT de modifier l'éditeur
    isSettingContentRef.current = true;

    if (editor) {
      editor.commands.setContent(contentToSet);
    }

    // 🔥 CORRECTION: Attendre que l'éditeur soit prêt
    setTimeout(() => {
      unsavedChanges.setOriginalContent(contentToSet);
      isSettingContentRef.current = false;
      setIsEditModalOpen(true);
    }, 50);
  };

  const handleDelete = () => {
    if (currentAntecedent) {
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (currentAntecedent) {
      try {
        await dataService.deleteAntecedent(currentAntecedent.id);
        await loadAntecedents();
        toast({
          title: "Antécédent supprimé",
          description: "L'antécédent a été supprimé avec succès.",
        });
      } catch (error) {
        console.error("Erreur suppression antécédent:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'antécédent",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    const content = editor.getHTML();

    try {
      if (!content.trim() || content === "<p></p>") {
        toast({
          title: "Erreur",
          description: "Le contenu est obligatoire",
          variant: "destructive",
        });
        return;
      }

      const antecedentData = {
        patientId: patient.id,
        type: activeType,
        content: content.trim(),
        createdBy: 1,
      };

      if (currentAntecedent && currentAntecedent.id) {
        await dataService.saveAntecedent({
          ...antecedentData,
          id: currentAntecedent.id,
        });
        toast({
          title: "Antécédent modifié",
          description: "L'antécédent a été modifié avec succès.",
        });
      } else {
        await dataService.saveAntecedent(antecedentData);
        toast({
          title: "Antécédent enregistré",
          description: "L'antécédent a été enregistré avec succès.",
        });
      }

      await loadAntecedents();
      unsavedChanges.reset();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erreur sauvegarde antécédent:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'antécédent",
        variant: "destructive",
      });
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (unsavedChanges.hasUnsavedChanges) {
        setPendingAction(() => () => {
          setIsEditModalOpen(false);
          unsavedChanges.reset();
        });
        setShowUnsavedDialog(true);
      } else {
        setIsEditModalOpen(false);
        unsavedChanges.reset();
      }
    } else {
      setIsEditModalOpen(open);
    }
  };

  const handleTypeChange = (type: (typeof ANTECEDENT_TYPES)[number]) => {
    if (unsavedChanges.hasUnsavedChanges) {
      setPendingAction(() => () => {
        setActiveType(type);
        unsavedChanges.reset();
      });
      setShowUnsavedDialog(true);
    } else {
      setActiveType(type);
    }
  };

  const handleUnsavedConfirm = () => {
    pendingAction?.();
    setPendingAction(null);
    unsavedChanges.reset();
    setShowUnsavedDialog(false);
  };

  const handleUnsavedCancel = () => {
    setPendingAction(null);
    setShowUnsavedDialog(false);
  };

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

  return (
    <>
      <Card className="shadow-card mb-6">
        <CardContent className="p-6">
          <div className="w-full overflow-x-auto scrollbar-hide mb-6">
            <div className="flex border-b border-gray-200 min-w-max">
              {ANTECEDENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`
                    px-3 py-3 text-sm font-medium transition-all flex-shrink-0
                    whitespace-nowrap min-w-[90px] text-center
                    border-b-2 border-transparent
                    hover:bg-gray-50 hover:border-gray-200
                    ${
                      activeType === type
                        ? "text-primary border-primary bg-primary/5"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">
              Antécédents - {activeType}
            </h3>

            {isAdmin && (
              <div className="flex space-x-2">
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {currentAntecedent ? "Modifier" : "Ajouter"}
                </Button>
                {currentAntecedent && (
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-4 bg-muted/30 min-h-[150px] max-h-[300px] overflow-y-auto">
            {currentContent ? (
              <div
                className="text-sm text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: currentContent }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Aucun antécédent saisi pour cette catégorie</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {currentAntecedent
                ? "Modifier l'antécédent"
                : "Ajouter un antécédent"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Catégorie: {activeType}
            </p>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
              <Toolbar />
              <div className="flex-1 overflow-auto">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleModalClose(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {currentAntecedent ? "Modifier" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cet antécédent ? Cette action est irréversible."
        itemName={`Antécédent ${activeType}`}
      />

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleUnsavedConfirm}
        onCancel={handleUnsavedCancel}
      />
    </>
  );
};
