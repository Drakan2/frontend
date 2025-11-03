// Fonctions de validation - Centralisées
import { Patient } from '../types/patient';
import { UI_LABELS } from '../constants/ui';

export const validatePatientData = (patient: Partial<Patient>): string[] => {
  const errors: string[] = [];
  
  if (!patient.nom_complet?.trim()) {
    errors.push('Le nom complet est obligatoire');
  }
  
  if (!patient.cin) {
    errors.push('Le CIN est obligatoire');
  }
  
  if (!patient.ass_cnss?.trim()) {
    errors.push('L\'Ass/Cnss est obligatoire');
  }
  
  if (!patient.date_naissance) {
    errors.push('La date de naissance est obligatoire');
  }
  
  if (!patient.sexe) {
    errors.push('Le sexe est obligatoire');
  }
  
  if (!patient.groupe_sanguin) {
    errors.push('Le groupe sanguin est obligatoire');
  }
  
  if (!patient.date_debut) {
    errors.push('La date de début est obligatoire');
  }
  
  if (!patient.type_patient) {
    errors.push('Le type de patient est obligatoire');
  }
  
  return errors;
};

export const generatePatientId = (): number => {
  return Date.now();
};
