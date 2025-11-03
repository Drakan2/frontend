import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Patient, User, ID } from "@/shared/types";
import { X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: {
    username: string;
    password: string;
    selectedPatients?: number[];
  }) => void;
  editingUser?: User | null;
  patients: Patient[];
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  editingUser,
  patients,
}) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  // ✅ On n’utilise que ce dont on a besoin du hook
  const { setOriginalContent, handleContentChange, hasUnsavedChanges, reset } =
    useUnsavedChanges();

  // ✅ Initialisation du formulaire sans provoquer de re-render infini
  useEffect(() => {
    if (!open) return;

    if (editingUser) {
      const initialData = {
        username: editingUser.username || "",
        password: editingUser.password || "",
        selectedPatients: editingUser.assignedPatients || [],
      };
      setFormData({
        username: initialData.username,
        password: initialData.password,
      });
      setSelectedPatients(initialData.selectedPatients);
      setOriginalContent(JSON.stringify(initialData));
    } else {
      const initialData = { username: "", password: "", selectedPatients: [] };
      setFormData(initialData);
      setSelectedPatients([]);
      setOriginalContent(JSON.stringify(initialData));
    }

    setSearchQuery("");
    setErrors([]);
  }, [open, editingUser, setOriginalContent]);

  // 🔍 Filtrage des patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.nom_complet
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const notSelected = !selectedPatients.includes(patient.id);
    return matchesSearch && notSelected;
  });

  // Données des patients sélectionnés
  const selectedPatientsData = patients.filter((p) =>
    selectedPatients.includes(p.id)
  );

  // 🔠 Gestion des champs de formulaire
  const handleInputChange =
    (field: "username" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const updated = { ...formData, [field]: newValue };
      setFormData(updated);
      if (errors.length > 0) setErrors([]);
      handleContentChange(JSON.stringify({ ...updated, selectedPatients }));
    };

  // ✅ Sélection / retrait de patients
  const handlePatientSelect = (patientId: ID) => {
    const updated = [...selectedPatients, patientId];
    setSelectedPatients(updated);
    setSearchQuery("");
    handleContentChange(
      JSON.stringify({ ...formData, selectedPatients: updated })
    );
  };

  const removeSelectedPatient = (patientId: ID) => {
    const updated = selectedPatients.filter((id) => id !== patientId);
    setSelectedPatients(updated);
    handleContentChange(
      JSON.stringify({ ...formData, selectedPatients: updated })
    );
  };

  // ✅ Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) {
      newErrors.push("Le nom d'utilisateur est obligatoire");
    } else if (formData.username.trim().length < 3) {
      newErrors.push(
        "Le nom d'utilisateur doit contenir au moins 3 caractères"
      );
    }

    if (!formData.password.trim()) {
      newErrors.push("Le mot de passe est obligatoire");
    } else if (formData.password.trim().length < 3) {
      newErrors.push("Le mot de passe doit contenir au moins 3 caractères");
    }

    if (selectedPatients.length === 0) {
      newErrors.push("L'utilisateur doit avoir au moins un patient autorisé");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // ✅ Sauvegarde
  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    try {
      onSave({
        username: formData.username.trim(),
        password: formData.password.trim(),
        selectedPatients:
          selectedPatients.length > 0 ? selectedPatients : undefined,
      });
      reset();
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  // ✅ Fermeture sécurisée
  const handleClose = () => {
    if (hasUnsavedChanges) {
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
    setFormData({ username: "", password: "" });
    setSelectedPatients([]);
    setSearchQuery("");
    setErrors([]);
    reset();
  };

  const handleUnsavedConfirm = () => {
    reset();
    pendingAction?.();
    setPendingAction(null);
  };

  const handleUnsavedCancel = () => setPendingAction(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges) {
      setPendingAction(() => () => onOpenChange(false));
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  const dialogTitle = editingUser
    ? "Modifier l'utilisateur"
    : "Ajouter un utilisateur";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <ul className="space-y-1">
                  {errors.map((error, i) => (
                    <li
                      key={i}
                      className="text-sm text-destructive flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="Nom d'utilisateur"
                  value={formData.username}
                  onChange={handleInputChange("username")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Mot de passe (min. 3 caractères)"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">
                Recherche par Nom de Patient
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tapez pour rechercher un patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchQuery && filteredPatients.length > 0 && (
                <div className="border rounded-lg p-3 bg-muted/50 max-h-40 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handlePatientSelect(patient.id)}
                      />
                      <span className="text-sm">{patient.nom_complet}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && filteredPatients.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Aucun patient trouvé.
                </p>
              )}

              {selectedPatients.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Patients Sélectionnés ({selectedPatients.length})
                  </Label>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex flex-wrap gap-2">
                      {selectedPatientsData.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                        >
                          <span>{p.nom_complet}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedPatient(p.id)}
                            className="ml-2 h-4 w-4 p-0 hover:bg-primary/20"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
              >
                {editingUser ? "Modifier" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleUnsavedConfirm}
        onCancel={handleUnsavedCancel}
        title="Modifications non sauvegardées"
        description="Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?"
        confirmText="Quitter"
        cancelText="Rester"
      />
    </>
  );
};
