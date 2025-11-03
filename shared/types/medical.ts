import { BaseEntity } from './common';
import { ID } from './common';
import { Patient } from './patient';

export interface DossierMenuItem {
  key: string;
  label: string;
  icon: string; // Garder comme string pour la compatibilité avec l'ancien code
  hasSubMenu: boolean;
  subMenuItems?: string[];
}

export interface MedicalRecord extends BaseEntity {
  patientId: Patient['id'];
  category: string;
  date: Date;
  details?: string;
  createdBy: ID;
}