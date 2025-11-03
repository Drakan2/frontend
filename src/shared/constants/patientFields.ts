import { PatientField, Sexe, GroupeSanguin, TypePatient, SituationFamiliale, CauseFin } from '../types/patient';

export const PATIENT_FIELDS: PatientField[] = [
  // Informations Personnelles
  { key: 'nom_complet', label: 'Nom & Prénom', type: 'text', required: true, category: 'personal' },
  { key: 'cin', label: 'CIN', type: 'number', required: true, category: 'personal' },
  { key: 'ass_cnss', label: 'Ass/CNSS', type: 'text', required: true, category: 'personal' },
  { key: 'date_naissance', label: 'Date de Naissance', type: 'date', required: true, category: 'personal' },
  { key: 'sexe', label: 'Sexe', type: 'select', required: true, options: ['Homme', 'Femme'] as Sexe[], category: 'personal' },
  { key: 'groupe_sanguin', label: 'Groupe Sanguin', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as GroupeSanguin[], category: 'personal' },
  { key: 'profession', label: 'Profession', type: 'text', required: false, category: 'personal' },
  { key: 'situation_familiale', label: 'Situation Familiale', type: 'select', required: false, options: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'] as SituationFamiliale[], category: 'personal' },

  // Informations de Contact - CORRECTION : garder 'number' ou utiliser 'tel'
  { key: 'telephone', label: 'Téléphone', type: 'number', required: false, category: 'contact' }, // ✅ Revenir à 'number'
  { key: 'telephone_urgence', label: 'Téléphone d\'Urgence', type: 'number', required: false, category: 'contact' }, // ✅ Revenir à 'number'
  { key: 'adresse', label: 'Adresse', type: 'text', required: false, category: 'contact' },

  // Informations de Dialyse
  { key: 'date_debut', label: 'Date de Début', type: 'date', required: true, category: 'dialysis' },
  { key: 'type_patient', label: 'Type', type: 'select', required: true, options: ['Permanent', 'Vacancier', 'Fin Traitement'] as TypePatient[], category: 'dialysis' },
  { key: 'date_fin', label: 'Date de Fin', type: 'date', required: false, category: 'dialysis' },
  { key: 'cause_fin', label: 'Cause de Fin', type: 'select', required: false, options: ['Transféré', 'Décès', 'Greffe'] as CauseFin[], category: 'dialysis' }
];