import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PatientModal } from "@/components/PatientModal";
import { PatientFileProps } from "@/shared/types";
import { PATIENT_FIELDS } from "@/shared/constants/patientFields";
import { CATEGORY_SPECS } from "@/shared/constants/categories";
import { UI_LABELS, COMMON_STYLES } from "@/shared/constants";
import { useAuth } from "@/context/AuthContext";
import { Edit, User, Phone, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/shared/config/database"; // ← AJOUTER CET IMPORT
import { Patient } from "@/shared/types"; // ← AJOUTER CET IMPORT

export const PatientFile: React.FC<PatientFileProps> = ({
  patient: initialPatient,
  onPatientUpdated,
}) => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // ✅ CORRECTION : État local pour les données du patient
  const [patient, setPatient] = useState<Patient>(initialPatient);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // CORRECTION : Fonction de sauvegarde réelle
  const handleSavePatient = async (patientData: Omit<Patient, "id">) => {
    try {
      // Sauvegarder les modifications
      const updatedPatient = await dataService.savePatient({
        ...patientData,
        id: patient.id,
      } as Patient);

      // ✅ CORRECTION : Mettre à jour l'état local avec les nouvelles données
      setPatient(updatedPatient);

      toast({
        title: UI_LABELS.patient_modified,
        description: `Les informations de ${patient.nom_complet} ont été mises à jour.`,
      });

      setIsEditModalOpen(false);

      // ✅ CORRECTION : Appeler le callback pour mettre à jour le parent
      if (onPatientUpdated) {
        console.log("🔄 PatientFile - Appel du callback onPatientUpdated");
        onPatientUpdated();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du patient:", error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du patient",
        variant: "destructive",
      });
    }
  };

  // ✅ CORRECTION : Mettre à jour l'état local si le patient parent change
  React.useEffect(() => {
    setPatient(initialPatient);
  }, [initialPatient]);

  // Organiser les champs par catégorie
  const getFieldsByCategory = (category: string) => {
    return PATIENT_FIELDS.filter((field) => field.category === category);
  };

  // Déterminer si un champ doit être affiché
  const shouldShowField = (fieldKey: string) => {
    if (fieldKey === "date_fin" || fieldKey === "cause_fin") {
      return patient.type_patient === "Fin Traitement" && patient[fieldKey];
    }
    return true;
  };

  // Formater la valeur d'un champ
  const formatFieldValue = (fieldKey: string, value: unknown): string => {
    if (!value && value !== 0) return COMMON_STYLES.emptyValue;

    if (
      fieldKey === "date_naissance" ||
      fieldKey === "date_debut" ||
      fieldKey === "date_fin"
    ) {
      return new Date(value as Date | string).toLocaleDateString("fr-FR");
    }

    return String(value);
  };

  // Icônes par catégorie
  const categoryIcons = {
    personal: User,
    contact: Phone,
    dialysis: Activity,
  };

  return (
    <Card className={COMMON_STYLES.card}>
      <CardContent className={COMMON_STYLES.cardContent}>
        {/* Bouton modifier */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={handleEdit}
              className="bg-primary hover:bg-primary/90 transition-smooth w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              {UI_LABELS.modify}
            </Button>
          </div>
        )}

        <Separator className="mb-6" />

        <div className="space-y-6">
          {/* Rendu dynamique des sections */}
          {Object.entries(CATEGORY_SPECS).map(
            ([categoryKey, categoryConfig]) => {
              const fields = getFieldsByCategory(categoryKey);
              const Icon =
                categoryIcons[categoryKey as keyof typeof categoryIcons];

              return (
                <div key={categoryKey}>
                  <h3 className={COMMON_STYLES.sectionTitle}>
                    <Icon className={COMMON_STYLES.sectionIcon} />
                    <span>{categoryConfig.label}</span>
                  </h3>

                  <div className={COMMON_STYLES.fieldGrid}>
                    {fields.map((field) => {
                      if (!shouldShowField(field.key)) return null;

                      const value = patient[field.key];

                      return (
                        <div key={field.key}>
                          <label className={COMMON_STYLES.fieldLabel}>
                            {field.label}
                            {field.required && (
                              <span className={COMMON_STYLES.requiredMark}>
                                {" "}
                                *
                              </span>
                            )}
                          </label>
                          <p
                            className={
                              field.key === "nom_complet"
                                ? COMMON_STYLES.fieldValueBold
                                : COMMON_STYLES.fieldValue
                            }
                          >
                            {formatFieldValue(field.key, value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Modal de modification */}
        <PatientModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={handleSavePatient}
          editingPatient={patient}
        />
      </CardContent>
    </Card>
  );
};
