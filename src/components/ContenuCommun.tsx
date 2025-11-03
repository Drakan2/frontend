import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Patient, MedicalRecord, ID } from "@/shared/types";
import { UI_LABELS } from "@/shared/constants";
import { Plus, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { SECTIONS } from "@/shared/constants/sections";
import { dataService } from "@/shared/config/database";

interface ContenuCommunProps {
  patient: Patient;
  activeSection: string;
}

export const ContenuCommun: React.FC<ContenuCommunProps> = ({
  patient,
  activeSection,
}) => {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(
    null
  );
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(
    null
  );
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const getSectionConfig = () => {
    return SECTIONS.find((s) => s.key === activeSection);
  };
  const sectionConfig = getSectionConfig();

  // Charger les données depuis l'API
  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        setIsLoading(true);
        const records = await dataService.getMedicalRecords(patient.id);
        setMedicalRecords(records);
      } catch (error) {
        console.error("Erreur chargement dossiers médicaux:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les dossiers médicaux",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (patient.id) {
      loadMedicalRecords();
    }
  }, [patient.id, toast]);

  // Filtrer les enregistrements médicaux
  const filteredRecords = medicalRecords.filter((record) => {
    const recordDate =
      record.date instanceof Date ? record.date : new Date(record.date);
    const startDate = dateDebut ? new Date(dateDebut) : null;
    const endDate = dateFin ? new Date(dateFin) : null;

    return (
      record.patientId === patient.id &&
      record.category === activeSection &&
      (!startDate || recordDate >= startDate) &&
      (!endDate || recordDate <= endDate)
    );
  });

  const getSectionTitle = () => {
    const sectionKey = `section_${activeSection}` as keyof typeof UI_LABELS;
    return UI_LABELS[sectionKey] || activeSection;
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (recordId: ID) => {
    const record = medicalRecords.find((r) => r.id === recordId);
    if (record) {
      setEditingRecord(record);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (recordId: ID) => {
    const record = medicalRecords.find((r) => r.id === recordId);
    if (record) {
      setRecordToDelete(record);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleSaveRecord = async (recordData: Omit<MedicalRecord, "id">) => {
    try {
      setIsLoading(true);

      let savedRecord: MedicalRecord;

      if (editingRecord) {
        savedRecord = await dataService.saveMedicalRecord({
          ...recordData,
          id: editingRecord.id,
        });
        setMedicalRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? savedRecord : r))
        );
        toast({
          title: "Enregistrement modifié",
          description: "L'enregistrement médical a été modifié avec succès.",
        });
      } else {
        savedRecord = await dataService.saveMedicalRecord(
          recordData as MedicalRecord
        );
        setMedicalRecords((prev) => [...prev, savedRecord]);
        toast({
          title: "Enregistrement ajouté",
          description: "L'enregistrement médical a été ajouté avec succès.",
        });
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Erreur sauvegarde dossier médical:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'enregistrement médical",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (recordToDelete) {
      try {
        setIsLoading(true);
        await dataService.deleteMedicalRecord(recordToDelete.id);
        setMedicalRecords((prev) =>
          prev.filter((r) => r.id !== recordToDelete.id)
        );
        toast({
          title: "Enregistrement supprimé",
          description: "L'enregistrement médical a été supprimé avec succès.",
          variant: "destructive",
        });
        setRecordToDelete(null);
      } catch (error) {
        console.error("Erreur suppression dossier médical:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'enregistrement médical",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetFilters = () => {
    setDateDebut("");
    setDateFin("");
  };

  return (
    <Card className="shadow-card min-h-[500px]">
      <CardContent className="p-6">
        {/* Header avec titre et bouton ajouter */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              {sectionConfig && (
                <sectionConfig.icon
                  className={`h-5 w-5 ${sectionConfig.color}`}
                />
              )}
              {getSectionTitle()}
            </h3>

            {isAdmin && (
              <Button
                onClick={handleAdd}
                className="bg-primary hover:bg-primary/90 transition-smooth hidden sm:flex"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {UI_LABELS.add}
              </Button>
            )}
          </div>

          {isAdmin && (
            <div className="sm:hidden mt-4">
              <Button
                onClick={handleAdd}
                className="bg-primary hover:bg-primary/90 transition-smooth w-full"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {UI_LABELS.add}
              </Button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Filtres par date */}
        <Card className="mb-6 bg-muted/20">
          <CardContent className="p-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {UI_LABELS.medical_record_date_start}
                </label>
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full"
                  disabled={filteredRecords.length === 0 || isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {UI_LABELS.medical_record_date_end}
                </label>
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full"
                  disabled={filteredRecords.length === 0 || isLoading}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-muted-foreground opacity-0">
                  Actions
                </label>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full transition-smooth"
                  disabled={filteredRecords.length === 0 || isLoading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {UI_LABELS.reset_filters}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des enregistrements */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold border-r">
                  {UI_LABELS.medical_record_date}
                </TableHead>
                <TableHead className="font-semibold border-r">
                  {UI_LABELS.medical_record_content}
                </TableHead>
                {isAdmin && (
                  <TableHead className="font-semibold w-24">
                    {UI_LABELS.medical_record_actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 3 : 2}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {isLoading
                      ? "Chargement..."
                      : UI_LABELS.medical_record_no_records}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-muted/30 transition-smooth"
                  >
                    <TableCell className="font-medium border-r">
                      {record.date instanceof Date
                        ? record.date.toLocaleDateString("fr-FR")
                        : new Date(record.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className={isAdmin ? "border-r" : ""}>
                      <div className="max-w-none">
                        <div
                          className="text-sm text-foreground prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: record.details || "",
                          }}
                        />
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted transition-smooth"
                              disabled={isLoading}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(record.id)}
                              className="cursor-pointer"
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {UI_LABELS.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(record.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {UI_LABELS.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modals */}
        <MedicalRecordModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSave={handleSaveRecord}
          patientId={patient.id}
          category={activeSection}
          existingRecords={medicalRecords}
        />

        <MedicalRecordModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={handleSaveRecord}
          patientId={patient.id}
          category={activeSection}
          editingRecord={editingRecord}
          existingRecords={medicalRecords}
        />

        <ConfirmDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Confirmer la suppression"
          description="Êtes-vous sûr de vouloir supprimer cet enregistrement médical ?"
          itemName={
            recordToDelete
              ? `Enregistrement du ${
                  recordToDelete.date instanceof Date
                    ? recordToDelete.date.toLocaleDateString("fr-FR")
                    : new Date(recordToDelete.date).toLocaleDateString("fr-FR")
                }`
              : ""
          }
        />
      </CardContent>
    </Card>
  );
};
