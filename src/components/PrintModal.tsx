import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SECTIONS } from "@/shared/constants/sections";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Patient, MedicalRecord, Antecedent } from "@/shared/types";
import { Printer, FileText, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/shared/config/database";

interface PrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  open,
  onOpenChange,
  patient,
}) => {
  const [printFiche, setPrintFiche] = useState(true);
  const [printDossier, setPrintDossier] = useState(false);
  const [dossierOption, setDossierOption] = useState<"complet" | "reduit">(
    "complet"
  );
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [antecedents, setAntecedents] = useState<Antecedent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCategoryLabel = (categoryKey: string): string => {
    const section = SECTIONS.find((section) => section.key === categoryKey);
    return section ? section.label : categoryKey;
  };

  // Charger les données depuis la BD
  useEffect(() => {
    const loadData = async () => {
      if (open && patient.id) {
        setLoading(true);
        try {
          const [recordsData, antecedentsData] = await Promise.all([
            dataService.getMedicalRecords(patient.id),
            dataService.getAntecedents(patient.id),
          ]);
          setMedicalRecords(recordsData);
          setAntecedents(antecedentsData);
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les données médicales",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    if (open) {
      loadData();
    }
  }, [open, patient.id, toast]);

  const handlePrint = async () => {
    if (!printFiche && !printDossier) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une option à imprimer.",
        variant: "destructive",
      });
      return;
    }

    const patientPrefix = patient.sexe === "Homme" ? "Mr" : "Mme";
    const printDate = new Date().toLocaleDateString("fr-FR");

    // Filtrer par date si option dossier réduit
    let filteredRecords = medicalRecords;
    if (printDossier && dossierOption === "reduit") {
      filteredRecords = medicalRecords.filter((record) => {
        const recordDate =
          record.date instanceof Date ? record.date : new Date(record.date);
        const startDate = dateDebut ? new Date(dateDebut) : null;
        const endDate = dateFin ? new Date(dateFin) : null;

        if (isNaN(recordDate.getTime())) return false;
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }

    // Grouper les antécédents par type
    const groupedAntecedents: Record<string, Antecedent[]> = {};
    antecedents.forEach((antecedent) => {
      if (!groupedAntecedents[antecedent.type]) {
        groupedAntecedents[antecedent.type] = [];
      }
      groupedAntecedents[antecedent.type].push(antecedent);
    });

    // Grouper les dossiers médicaux par catégorie (sans sous-catégories)
    const groupedRecords: Record<string, MedicalRecord[]> = {};
    filteredRecords.forEach((record) => {
      const category = record.category || "Sans catégorie";
      if (!groupedRecords[category]) {
        groupedRecords[category] = [];
      }
      groupedRecords[category].push(record);
    });

    // Contenu HTML
    let printContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <title></title>
      <link rel="stylesheet" href="/print.css" />
      <style>
        :root {
          --print-date: "${printDate}";
        }
      </style>
    </head>
    <body>
`;

    // Fiche patient
    if (printFiche) {
      printContent += `
    <div class="header">
      <h1>FICHE PATIENT</h1>
      <h2>${patientPrefix} ${patient.nom_complet}</h2>
    </div>
    <div class="patient-info">
      <div class="section">
        <div class="section-title">INFORMATIONS PERSONNELLES</div>
        <div class="info-row"><div class="info-label">NOM COMPLET:</div><div class="info-value">${
          patient.nom_complet
        }</div></div>
        <div class="info-row"><div class="info-label">CIN:</div><div class="info-value">${
          patient.cin
        }</div></div>
        <div class="info-row"><div class="info-label">ASS/CNSS:</div><div class="info-value">${
          patient.ass_cnss
        }</div></div>
        <div class="info-row"><div class="info-label">DATE DE NAISSANCE:</div><div class="info-value">${new Date(
          patient.date_naissance
        ).toLocaleDateString("fr-FR")}</div></div>
        <div class="info-row"><div class="info-label">SEXE:</div><div class="info-value">${
          patient.sexe
        }</div></div>
        <div class="info-row"><div class="info-label">GROUPE SANGUIN:</div><div class="info-value">${
          patient.groupe_sanguin
        }</div></div>
      </div>
      <div class="section">
        <div class="section-title">INFORMATIONS DE CONTACT</div>
        <div class="info-row"><div class="info-label">TÉLÉPHONE:</div><div class="info-value">${
          patient.telephone || "Non renseigné"
        }</div></div>
        <div class="info-row"><div class="info-label">TÉLÉPHONE D'URGENCE:</div><div class="info-value">${
          patient.telephone_urgence || "Non renseigné"
        }</div></div>
        <div class="info-row"><div class="info-label">ADRESSE:</div><div class="info-value">${
          patient.adresse || "Non renseignée"
        }</div></div>
      </div>
      <div class="section">
        <div class="section-title">INFORMATIONS DE DIALYSE</div>
        <div class="info-row"><div class="info-label">DATE DE DÉBUT:</div><div class="info-value">${new Date(
          patient.date_debut
        ).toLocaleDateString("fr-FR")}</div></div>
        <div class="info-row"><div class="info-label">TYPE DE PATIENT:</div><div class="info-value">${
          patient.type_patient
        }</div></div>
        ${
          patient.date_fin
            ? `<div class="info-row"><div class="info-label">DATE DE FIN:</div><div class="info-value">${new Date(
                patient.date_fin
              ).toLocaleDateString("fr-FR")}</div></div>`
            : ""
        }
        ${
          patient.cause_fin
            ? `<div class="info-row"><div class="info-label">CAUSE DE FIN:</div><div class="info-value">${patient.cause_fin}</div></div>`
            : ""
        }
      </div>
    </div>
  `;
    }

    // Dossier médical
    if (printDossier) {
      if (printFiche) {
        printContent += `<div class="page-break"></div>`;
      }

      printContent += `
    <div class="dossier-title">
      <h1>DOSSIER MÉDICAL</h1>
      <h2>${patientPrefix} ${patient.nom_complet}</h2>
    </div>
  `;

      // Section Antécédents - Nouvelle structure
      if (antecedents.length > 0) {
        Object.entries(groupedAntecedents).forEach(
          ([type, typeAntecedents]) => {
            const title = type
              ? `* ANTÉCÉDENTS - ${type.toUpperCase()}:`
              : "* ANTÉCÉDENTS";
            printContent += `<div class="antecedent-header">${title}</div>`;
            typeAntecedents.forEach((antecedent) => {
              printContent += `<div class="antecedent-content">${antecedent.content}</div>`;
            });
          }
        );

        // Séparateur après les antécédents
        printContent += `<div class="antecedent-separator"></div>`;
      }

      // Section Dossier Médical (autres catégories)
      if (Object.keys(groupedRecords).length === 0) {
        //printContent += `<div class="category">DOSSIER MÉDICAL:</div>`;
        printContent += `<div class="no-data">Aucun enregistrement médical trouvé</div>`;
      } else {
        let categoryIndex = 1;

        // Liste des catégories à afficher (exclure antecedents s'il existe encore)
        const categoriesToShow = Object.keys(groupedRecords).filter(
          (cat) => cat !== "antecedents"
        );

        categoriesToShow.forEach((category) => {
          const records = groupedRecords[category];
          const categoryLabel = getCategoryLabel(category);
          printContent += `<div class="category">${categoryIndex}. ${categoryLabel.toUpperCase()}:</div>`;

          if (records.length === 0) {
            printContent += `<div class="no-data">Aucun enregistrement</div>`;
          } else {
            records.forEach((record) => {
              const dateStr =
                record.date instanceof Date
                  ? record.date.toLocaleDateString("fr-FR")
                  : new Date(record.date).toLocaleDateString("fr-FR");
              printContent += `<div class="record"><span class="record-date">- ${dateStr}:</span> <span class="record-details">${
                record.details || "Aucun détail"
              }</span></div>`;
            });
          }
          categoryIndex++;
        });
      }
    }

    printContent += `</body></html>`;

    // Impression
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Erreur",
        description:
          "Impossible d'ouvrir la fenêtre d'impression. Vérifiez le bloqueur de pop-ups.",
      });
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();

      const documentTypes = [];
      if (printFiche) documentTypes.push("fiche patient");
      if (printDossier) documentTypes.push("dossier médical");

      toast({
        title: "Impression lancée",
        description: `${documentTypes.join(" et ")} de ${patientPrefix} ${
          patient.nom_complet
        } envoyé à l'impression.`,
      });

      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Printer className="h-5 w-5 text-primary" />
            <span>Options d'impression</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {loading && (
            <div className="text-center py-4">
              <p>Chargement des données médicales...</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
              <Checkbox
                id="print-fiche"
                checked={printFiche}
                onCheckedChange={(checked) => setPrintFiche(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="print-fiche" className="cursor-pointer">
                  <div className="flex items-center space-x-2 font-medium text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm sm:text-base">
                      Imprimer fiche patient
                    </span>
                  </div>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
              <Checkbox
                id="print-dossier"
                checked={printDossier}
                onCheckedChange={(checked) =>
                  setPrintDossier(checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="print-dossier" className="cursor-pointer">
                  <div className="flex items-center space-x-2 font-medium text-foreground">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <span>Imprimer dossier médical</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inclut les antécédents ({antecedents.length} types) et le
                    dossier médical ({medicalRecords.length} enregistrements)
                  </p>
                </Label>

                {printDossier && (
                  <div className="mt-4 space-y-4 pl-6 border-l-2 border-primary/20">
                    <RadioGroup
                      value={dossierOption}
                      onValueChange={(value) =>
                        setDossierOption(value as "complet" | "reduit")
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="complet" id="dossier-complet" />
                        <Label htmlFor="dossier-complet">
                          Dossier médical complet
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="reduit" id="dossier-reduit" />
                        <Label htmlFor="dossier-reduit">
                          Dossier médical réduit (avec filtre de date)
                        </Label>
                      </div>
                    </RadioGroup>

                    {dossierOption === "reduit" && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <Label
                            htmlFor="date-debut"
                            className="text-sm font-medium"
                          >
                            Date de début (optionnelle)
                          </Label>
                          <Input
                            id="date-debut"
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="date-fin"
                            className="text-sm font-medium"
                          >
                            Date de fin (optionnelle)
                          </Label>
                          <Input
                            id="date-fin"
                            type="date"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 transition-smooth"
              disabled={loading}
            >
              <Printer className="h-4 w-4 mr-2" />
              {loading ? "Chargement..." : "Imprimer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
