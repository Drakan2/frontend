import { BaseEntity } from './common';
import { ID } from './common';
import { Patient } from './patient';

export interface Antecedent extends BaseEntity {
  patientId: Patient['id'];
  type: 'Médicaux' | 'Chirurgicaux' | 'Allergies' | 'Statut Infectieux';
  content: string;
  createdBy: ID;
}