import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient, ID } from "@/shared/types";
import {
  calculateAge,
  calculateAgeAtDialysisStart, // Nouvelle fonction importée
  calculateTreatmentDuration,
} from "@/shared/utils/calculations";
import { useAuth } from "@/context/AuthContext";
import { TABLE_COLUMNS, TABLE_LABELS } from "@/shared/constants/table";
import {
  PATIENT_TYPE_STYLES,
  BLOOD_GROUP_COLORS,
  SEXE_COLORS,
} from "@/shared/constants/patient";
import { UI_LABELS } from "@/shared/constants/ui";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Pagination } from "@/components/pagination";
import { PatientsListeProps } from "@/shared/types";

// Type pour les colonnes de table
type TableColumn =
  | (typeof TABLE_COLUMNS.desktop)[number]
  | (typeof TABLE_COLUMNS.mobile)[number];

// Options de pagination
const PAGINATION_OPTIONS = [10, 25, 50, 100] as const;

export const PatientsListe: React.FC<PatientsListeProps> = ({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}) => {
  const { isAdmin } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Calcul des données paginées
  const { paginatedPatients, totalPages, startIndex, endIndex } =
    useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPatients = patients.slice(startIndex, endIndex);
      const totalPages = Math.ceil(patients.length / itemsPerPage);

      return { paginatedPatients, totalPages, startIndex, endIndex };
    }, [patients, currentPage, itemsPerPage]);

  // Réinitialiser à la page 1 quand itemsPerPage change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  const handleDelete = (patientId: ID) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setPatientToDelete(patient);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (patientToDelete && onDeletePatient) {
      onDeletePatient(patientToDelete.id!);
      setPatientToDelete(null);
    }
  };

  // Formatage du CIN avec les 0 initiaux
  const formatCIN = (cin: string): string => {
    return cin.toString().padStart(8, "0");
  };

  const getCellValue = (patient: Patient, column: string): React.ReactNode => {
    switch (column) {
      case "age":
        return `${calculateAge(patient.date_naissance)} ans`;
      case "age_debut_dialyse": {
        // Nouveau cas pour l'âge en début de dialyse
        const ageAtDialysis = calculateAgeAtDialysisStart(
          patient.date_naissance,
          patient.date_debut
        );
        return `${ageAtDialysis} ans`;
      }
      case "groupe_sanguin":
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor:
                BLOOD_GROUP_COLORS[patient.groupe_sanguin] + "20",
              borderColor: BLOOD_GROUP_COLORS[patient.groupe_sanguin],
              color: "black",
            }}
          >
            {patient.groupe_sanguin}
          </Badge>
        );
      case "type_patient": {
        const typeStyles = PATIENT_TYPE_STYLES[patient.type_patient];
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: typeStyles.backgroundColor,
              color: typeStyles.color,
              borderColor: typeStyles.borderColor,
              fontWeight: "600",
            }}
          >
            {patient.type_patient}
          </Badge>
        );
      }
      case "date_debut":
        return new Date(patient.date_debut).toLocaleDateString("fr-FR");
      case "cin":
        return formatCIN(patient.cin);
      case "ass_cnss":
        return patient.ass_cnss || "";
      case "nom_complet":
        return patient.nom_complet || "";
      case "sexe":
        return (
          <span
            style={{ color: SEXE_COLORS[patient.sexe] }}
            className="font-medium"
          >
            {patient.sexe}
          </span>
        );
      case "duree_traitement":
        return (
          <Badge variant="secondary" className="text-xs">
            {calculateTreatmentDuration(patient.date_debut, patient.date_fin)}
          </Badge>
        );
      default:
        return "";
    }
  };

  const isColumnVisible = (column: string, isMobile: boolean): boolean => {
    if (isMobile) {
      return (TABLE_COLUMNS.mobile as readonly string[]).includes(column);
    }
    return true;
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">
          Aucun patient trouvé
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border shadow-card">
      {/* En-tête avec statistiques et sélecteur */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 border-b">
        <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
          Affichage des patients {startIndex + 1} à{" "}
          {Math.min(endIndex, patients.length)} sur {patients.length}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Patients par page:
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tableau */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {TABLE_COLUMNS.desktop.map((column) => (
              <TableHead
                key={column}
                className={`font-semibold border-r ${
                  !isColumnVisible(column, true) ? "hidden md:table-cell" : ""
                }`}
              >
                {TABLE_LABELS[column]}
              </TableHead>
            ))}
            <TableHead className="font-semibold w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPatients.map((patient) => (
            <TableRow
              key={patient.id}
              className="hover:bg-muted/30 transition-smooth"
            >
              {TABLE_COLUMNS.desktop.map((column) => (
                <TableCell
                  key={column}
                  className={`${
                    column === "nom_complet"
                      ? "font-medium"
                      : "text-muted-foreground"
                  } border-r ${
                    !isColumnVisible(column, true) ? "hidden md:table-cell" : ""
                  }`}
                >
                  {getCellValue(patient, column)}
                </TableCell>
              ))}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted transition-smooth"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onViewPatient(patient.id!)}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </DropdownMenuItem>
                    {isAdmin && onEditPatient && (
                      <DropdownMenuItem
                        onClick={() => onEditPatient(patient)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {UI_LABELS.modify}
                      </DropdownMenuItem>
                    )}
                    {isAdmin && onDeletePatient && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(patient.id!)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {UI_LABELS.delete}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="border-t"
        />
      )}

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer ce patient ? Cette action supprimera également tous les dossiers médicaux associés."
        itemName={patientToDelete ? patientToDelete.nom_complet : ""}
      />
    </div>
  );
};
