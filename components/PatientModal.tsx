import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/shared/types";
import { PATIENT_FIELDS, CATEGORY_SPECS } from "@/shared/constants";
import { UI_LABELS } from "@/shared/constants/ui";
import {
  VALIDATION_REGEX,
  ERROR_MESSAGES,
} from "@/shared/constants/validation";
import { useToast } from "@/hooks/use-toast";
import { formatDateForInput } from "@/shared/utils/dates";
import { dataService } from "@/shared/config/database";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patientData: Omit<Patient, "id">) => void;
  editingPatient?: Patient | null;
}

type PatientFormData = Record<string, string | number>;

const formatCIN = (cin: number | string): string => {
  if (!cin || cin === "0") {
    return "";
  }
  if (typeof cin === "number") {
    return cin.toString().padStart(8, "0");
  }
  return cin;
};

const parseCIN = (cinString: string): number => {
  if (!cinString || cinString.trim() === "") {
    return 0;
  }
  return parseInt(cinString, 10);
};

const shouldDisableField = (fieldKey: string, isLoading: boolean): boolean => {
  return isLoading && (fieldKey === "cin" || fieldKey === "ass_cnss");
};

const validateDates = (
  dateNaissance: string,
  dateDebut: string,
  dateFin?: string
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const today = new Date();
  const naissance = new Date(dateNaissance);
  const debut = new Date(dateDebut);
  const fin = dateFin ? new Date(dateFin) : null;

  if (naissance > today) {
    errors.date_naissance =
      "La date de naissance ne peut pas être dans le futur";
  }

  if (debut <= naissance) {
    errors.date_debut =
      "La date de début doit être postérieure à la date de naissance";
  }

  if (debut > today) {
    errors.date_debut = "La date de début ne peut pas être dans le futur";
  }

  if (fin && fin <= debut) {
    errors.date_fin = "La date de fin doit être postérieure à la date de début";
  }

  if (fin && fin > today) {
    errors.date_fin = "La date de fin ne peut pas être dans le futur";
  }

  return errors;
};

export const PatientModal: React.FC<PatientModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editingPatient,
}) => {
  const { toast } = useToast();
  const isEditing = !!editingPatient;

  const [formData, setFormData] = useState<PatientFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const unsavedChanges = useUnsavedChanges();
  const isInitializingRef = useRef(false);

  const checkExistingPatient = async (
    cin: string,
    assCnss: string
  ): Promise<{ cinExists: boolean; assCnssExists: boolean }> => {
    try {
      const patients = await dataService.getPatients();
      const cinWithPadding = cin.padStart(8, "0");

      const cinExists = patients.some((patient) => {
        const patientCIN = patient.cin.toString().padStart(8, "0");
        return (
          patientCIN === cinWithPadding &&
          (!editingPatient || patient.id !== editingPatient.id)
        );
      });

      const assCnssExists = patients.some(
        (patient) =>
          patient.ass_cnss === assCnss &&
          (!editingPatient || patient.id !== editingPatient.id)
      );

      return { cinExists, assCnssExists };
    } catch (error) {
      console.error("Erreur vérification existence:", error);
      return { cinExists: false, assCnssExists: false };
    }
  };

  // 🔥 CORRECTION: Initialisation avec protection
  useEffect(() => {
    if (!open) {
      unsavedChanges.reset();
      isInitializingRef.current = false;
      return;
    }

    isInitializingRef.current = true;

    if (editingPatient) {
      const formattedData: PatientFormData = {};

      Object.entries(editingPatient).forEach(([key, value]) => {
        if (value instanceof Date || key.includes("date")) {
          formattedData[key] = formatDateForInput(value as Date | string);
        } else if (key === "cin" && value) {
          formattedData[key] = value.toString().padStart(8, "0");
        } else {
          formattedData[key] = value?.toString() || "";
        }
      });

      setFormData(formattedData);

      // 🔥 Double requestAnimationFrame pour être sûr
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          unsavedChanges.setOriginalContent(JSON.stringify(formattedData));
          isInitializingRef.current = false;
        });
      });
    } else {
      const initialData: PatientFormData = {};
      PATIENT_FIELDS.forEach((field) => (initialData[field.key] = ""));
      setFormData(initialData);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          unsavedChanges.setOriginalContent(JSON.stringify(initialData));
          isInitializingRef.current = false;
        });
      });
    }

    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPatient, open]);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    PATIENT_FIELDS.forEach((field) => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = "Ce champ est obligatoire";
      }
    });

    if (formData.cin) {
      const cinValue = formData.cin.toString();
      if (!VALIDATION_REGEX.CIN.test(cinValue)) {
        newErrors.cin = ERROR_MESSAGES.INVALID_CIN;
      }
    }

    if (formData.date_naissance && formData.date_debut) {
      const dateErrors = validateDates(
        formData.date_naissance as string,
        formData.date_debut as string,
        formData.date_fin as string
      );
      Object.assign(newErrors, dateErrors);
    }

    if (formData.type_patient === "Fin Traitement") {
      if (!formData.date_fin) {
        newErrors.date_fin = "La date de fin est obligatoire pour ce type";
      }
      if (!formData.cause_fin) {
        newErrors.cause_fin = "La cause de fin est obligatoire pour ce type";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    if (formData.cin && formData.ass_cnss) {
      setIsLoading(true);
      try {
        const { cinExists, assCnssExists } = await checkExistingPatient(
          formData.cin.toString(),
          formData.ass_cnss as string
        );

        if (cinExists) {
          newErrors.cin = "Un patient avec ce CIN existe déjà";
        }

        if (assCnssExists) {
          newErrors.ass_cnss = "Un patient avec cet Ass/CNSS existe déjà";
        }
      } catch (error) {
        console.error("Erreur vérification doublons:", error);
      } finally {
        setIsLoading(false);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (await validateForm()) {
      const tempData: { [key: string]: unknown } = { ...formData };

      if (tempData.cause_fin === "") {
        tempData.cause_fin = null;
      }

      if (tempData.cin) {
        const cinString = tempData.cin.toString();
        tempData.cin = parseCIN(cinString.padStart(8, "0"));
      }

      if (tempData.telephone) {
        tempData.telephone = Number(tempData.telephone);
      }
      if (tempData.telephone_urgence) {
        tempData.telephone_urgence = Number(tempData.telephone_urgence);
      }

      const processedData = tempData as Omit<Patient, "id">;

      onSave(processedData);
      toast({
        title: isEditing ? "Patient modifié" : "Patient ajouté",
        description: `Le patient ${formData.nom_complet} a été ${
          isEditing ? "modifié" : "ajouté"
        } avec succès.`,
      });

      unsavedChanges.reset();
      resetForm();
      onOpenChange(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // 🔥 CORRECTION: Ne pas vérifier pendant l'initialisation
    if (!isInitializingRef.current) {
      unsavedChanges.handleContentChange(JSON.stringify(newFormData));
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
    setFormData({});
    setErrors({});
    setIsLoading(false);
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

  const renderField = (field: (typeof PATIENT_FIELDS)[0]) => {
    const value = formData[field.key] || "";
    const stringValue = typeof value === "string" ? value : value.toString();

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={stringValue}
            onValueChange={(val) => handleInputChange(field.key, val)}
            disabled={shouldDisableField(field.key, isLoading)}
          >
            <SelectTrigger
              className={errors[field.key] ? "border-destructive" : ""}
            >
              <SelectValue
                placeholder={`Sélectionner ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[field.key] && (
            <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
          )}
        </div>
      );
    }

    if (field.key === "adresse") {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={field.key}
            value={stringValue}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.label}
            rows={3}
            className={errors[field.key] ? "border-destructive" : ""}
            disabled={shouldDisableField(field.key, isLoading)}
          />
          {errors[field.key] && (
            <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
          )}
        </div>
      );
    }

    if (field.key === "cin") {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={field.key}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={stringValue}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, "");
              const limitedValue = numericValue.slice(0, 8);
              handleInputChange(field.key, limitedValue);
            }}
            placeholder="Ex: 00112233 (8 chiffres)"
            className={errors[field.key] ? "border-destructive" : ""}
            maxLength={8}
            disabled={shouldDisableField(field.key, isLoading)}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {stringValue
              ? `${stringValue.length}/8 caractères`
              : "0/8 caractères"}
          </div>
          {errors[field.key] && (
            <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.key}>
        <Label htmlFor={field.key}>
          {field.label}{" "}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={field.key}
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
              ? "date"
              : "text"
          }
          value={stringValue}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          placeholder={field.label}
          className={errors[field.key] ? "border-destructive" : ""}
          disabled={shouldDisableField(field.key, isLoading)}
        />
        {errors[field.key] && (
          <p className="text-sm text-destructive mt-1">{errors[field.key]}</p>
        )}
      </div>
    );
  };

  const fieldsByCategory = Object.keys(CATEGORY_SPECS).map((category) => ({
    category,
    label: CATEGORY_SPECS[category as keyof typeof CATEGORY_SPECS].label,
    fields: PATIENT_FIELDS.filter((field) => field.category === category),
  }));

  const shouldShowField = (fieldKey: string) => {
    if (fieldKey === "date_fin" || fieldKey === "cause_fin") {
      return formData.type_patient === "Fin Traitement";
    }
    return true;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-describedby="patient-modal-description"
          className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEditing ? UI_LABELS.modify : UI_LABELS.add_patient}
            </DialogTitle>
            <p id="patient-modal-description" className="sr-only">
              Formulaire pour {isEditing ? "modifier" : "ajouter"} un patient
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {fieldsByCategory.map(({ category, label, fields }) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  {label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) =>
                    shouldShowField(field.key) ? renderField(field) : null
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {UI_LABELS.cancel}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading
                  ? "Vérification..."
                  : isEditing
                  ? UI_LABELS.modify
                  : UI_LABELS.add}
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
        description="Vous avez des modifications non sauvegardées dans le formulaire patient. Voulez-vous vraiment quitter ? Vos modifications seront perdues."
        confirmText="Quitter"
        cancelText="Rester"
      />
    </>
  );
};
