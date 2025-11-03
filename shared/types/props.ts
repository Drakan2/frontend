// Interfaces pour les props des composants - Centralisées
import { Patient } from './patient';
import { User } from './user';
import { MedicalRecord } from './medical';
import { ID } from './common';

// Props pour les composants Patient
export interface PatientFileProps {
  patient: Patient;
  onPatientUpdated?: () => void; // ← AJOUTER CETTE PROP OPTIONNELLE

}

export interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patientData: Omit<Patient, 'id'>) => void;
  editingPatient?: Patient | null;
}

export interface PatientsListeProps {
  patients: Patient[];
  onViewPatient: (patientId: ID) => void;
  onEditPatient?: (patient: Patient) => void;
  onDeletePatient?: (patientId: ID) => void;
}

// Props pour les composants Medical Record
export interface MedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recordData: Omit<MedicalRecord, 'id'>) => void;
  patientId: ID;
  category: string;
  editingRecord?: MedicalRecord | null;
}

export interface ContenuCommunProps {
  patient: Patient;
  activeSection: string;
}

export interface SideBarDMProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

// Props pour les composants User
export interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  patients: Patient[];
}

export interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: { username: string; password: string; selectedPatients?: ID[] }) => void;
  editingUser: User | null;
  patients: Patient[];
}

export interface ChangeCredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

// Props pour les composants communs
export interface PrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

export interface FiltresProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  sexe: string;
  type: string;
  groupeSanguin: string;
}
