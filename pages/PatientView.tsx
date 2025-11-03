import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PatientFile } from "@/components/PatientFile";
import { PatientDM } from "@/components/PatientDM";
import { PrintModal } from "@/components/PrintModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@/shared/types";
import { dataService } from "@/shared/config/database";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Printer, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ID } from "@/shared/types";

const PatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId: ID = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const { canAccessPatient } = useAuth();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("fiche");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // ✅ CORRECTION: Utiliser useCallback pour stabiliser la fonction
  const loadPatient = useCallback(async () => {
    if (!id) {
      navigate("/patients");
      return;
    }

    const patients = await dataService.getPatients();
    const foundPatient = patients.find((p) => p.id === patientId);

    if (!foundPatient) {
      toast({
        title: "Patient non trouvé",
        description: "Le patient demandé n'existe pas.",
        variant: "destructive",
      });
      navigate("/patients");
      return;
    }

    if (!canAccessPatient(patientId)) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas l'autorisation d'accéder à ce patient.",
        variant: "destructive",
      });
      navigate("/patients");
      return;
    }

    setPatient(foundPatient);
  }, [id, patientId, navigate, canAccessPatient, toast]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]); // ✅ Maintenant loadPatient est stable

  // ✅ CORRECTION: Fonction pour mettre à jour le patient après modification
  const handlePatientUpdated = async () => {
    console.log("🔄 PatientView - Mise à jour des données du patient");
    await loadPatient(); // Recharge les données depuis le serveur
  };

  const handleBack = () => {
    navigate("/patients");
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  if (!patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const patientPrefix = patient.sexe === "Homme" ? "Mr" : "Mme";
  const ficheTitle = `Fiche ${patientPrefix} ${patient.nom_complet}`;
  const dossierTitle = `Dossier Médical ${patientPrefix} ${patient.nom_complet}`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-smooth border-2 hover:border-primary/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center space-x-2 transition-smooth border-2 hover:border-primary/20"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </Button>
        </div>

        {/* Patient Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50 h-auto p-2 rounded-lg border-2 border-gray-200">
            <TabsTrigger
              value="fiche"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-smooth text-base py-3 px-4 text-center flex-1 rounded-md font-medium"
            >
              <span className="flex items-center justify-center space-x-2">
                <User className="h-5 w-5" />
                <span className="truncate">
                  <span className="hidden sm:inline">{ficheTitle}</span>
                  <span className="sm:hidden">Fiche</span>
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="dossier"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-smooth text-base py-3 px-4 text-center flex-1 rounded-md font-medium"
            >
              <span className="flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5" />
                <span className="truncate">
                  <span className="hidden sm:inline">{dossierTitle}</span>
                  <span className="sm:hidden">Dossier</span>
                </span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fiche" className="mt-6">
            {/* ✅ CORRECTION: Passer la fonction de callback */}
            <PatientFile
              patient={patient}
              onPatientUpdated={handlePatientUpdated}
            />
          </TabsContent>

          <TabsContent value="dossier" className="mt-6">
            <PatientDM patient={patient} />
          </TabsContent>
        </Tabs>

        {/* Print Modal */}
        <PrintModal
          open={isPrintModalOpen}
          onOpenChange={setIsPrintModalOpen}
          patient={patient}
        />
      </div>
    </Layout>
  );
};

export default PatientView;
