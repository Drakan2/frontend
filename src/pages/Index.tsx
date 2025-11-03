import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Filtres } from "@/components/Filtres";
import { PatientsListe } from "@/components/PatientsListe";
import { PatientModal } from "@/components/PatientModal";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Patient, ID } from "@/shared/types";
import { dataService } from "@/shared/config/database";
import {
  filterPatients,
  getDefaultFilters,
  PatientFilters,
} from "@/shared/utils/filters";
import { UI_LABELS } from "@/shared/constants/ui";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/context/FiltersContext";

const Index = () => {
  const { isAdmin, user, canAccessPatient } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filters, setFilters] = useState<PatientFilters>(getDefaultFilters());
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { setResetPatientsFilters } = useFilters();

  // ✅ CORRECTION : Créez la fonction avec useCallback
  const resetFilters = useCallback(() => {
    console.log("🔄 Réinitialisation des filtres patients");
    setFilters(getDefaultFilters());
    navigate("/patients", { replace: true });
  }, [navigate]);

  // ✅ CORRECTION : useEffect avec seulement resetFilters comme dépendance
  useEffect(() => {
    setResetPatientsFilters(resetFilters);

    // Cleanup
    return () => {
      setResetPatientsFilters(() => {});
    };
  }, [resetFilters, setResetPatientsFilters]); // ← resetFilters est maintenant stable

  const loadPatients = async () => {
    const loadedPatients = await dataService.getPatients();
    setPatients(loadedPatients);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && typeParam !== "tous") {
      setFilters((prev) => ({ ...prev, type: typeParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    let accessiblePatients = patients;

    if (!isAdmin && user) {
      accessiblePatients = patients.filter((patient) =>
        canAccessPatient(patient.id!)
      );
    }

    const filtered = filterPatients(accessiblePatients, filters);
    setFilteredPatients(filtered);
  }, [filters, isAdmin, user, canAccessPatient, patients]);

  const handleFiltersChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters(getDefaultFilters());
  };

  const handleViewPatient = (patientId: ID) => {
    navigate(`/patients/${patientId}`);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleDeletePatient = async (patientId: ID) => {
    try {
      await dataService.deletePatient(patientId);

      const updatedPatients = await dataService.getPatients();
      setPatients(updatedPatients);
      toast({
        title: "Patient supprimé",
        description: "Le patient a été supprimé avec succès.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Erreur suppression patient:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du patient.",
        variant: "destructive",
      });
    }
  };

  const handleAddPatient = () => {
    setIsAddModalOpen(true);
  };

  const handleSavePatient = async (patientData: Omit<Patient, "id">) => {
    try {
      if (editingPatient) {
        await dataService.savePatient({
          ...patientData,
          id: editingPatient.id,
        });
        const updatedPatients = await dataService.getPatients();
        setPatients(updatedPatients);
        toast({
          title: "Patient modifié",
          description: "Le patient a été modifié avec succès.",
        });
      } else {
        await dataService.savePatient(patientData as Patient);
        const updatedPatients = await dataService.getPatients();
        setPatients(updatedPatients);
        toast({
          title: "Patient ajouté",
          description: "Le patient a été ajouté avec succès.",
        });
      }
    } catch (error) {
      console.error("Erreur sauvegarde patient:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du patient.",
        variant: "destructive",
      });
    }
  };

  const pageTitle = isAdmin
    ? UI_LABELS.patients_title_admin
    : UI_LABELS.patients_title_user;
  const totalPatients = filteredPatients.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {pageTitle}
                </h1>
                <p className="text-muted-foreground">
                  Total: {totalPatients} patient{totalPatients > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {isAdmin && (
              <Button
                onClick={handleAddPatient}
                className="bg-gradient-primary hover:opacity-90 transition-smooth hidden sm:flex"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {UI_LABELS.add_patient}
              </Button>
            )}
          </div>

          {/* Mobile Add Button */}
          {isAdmin && (
            <Button
              onClick={handleAddPatient}
              className="bg-gradient-primary hover:opacity-90 transition-smooth w-full sm:hidden"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {UI_LABELS.add_patient}
            </Button>
          )}
        </div>

        {/* Filtres */}
        <Filtres
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
        />

        {/* Liste des patients */}
        <PatientsListe
          patients={filteredPatients}
          onViewPatient={handleViewPatient}
          onEditPatient={isAdmin ? handleEditPatient : undefined}
          onDeletePatient={isAdmin ? handleDeletePatient : undefined}
        />

        {/* Modals */}
        <PatientModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSave={handleSavePatient}
        />

        <PatientModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={handleSavePatient}
          editingPatient={editingPatient}
        />
      </div>
    </Layout>
  );
};

export default Index;
