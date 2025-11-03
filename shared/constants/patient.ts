import { Sexe, TypePatient } from '../types/patient';

// Options pour les filtres et sélections
export const SEXE_OPTIONS = ['Homme', 'Femme'] as const;
export const GROUPE_SANGUIN_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const TYPE_PATIENT_OPTIONS = ['Permanent', 'Vacancier', 'Fin Traitement'] as const;
export const SITUATION_FAMILIALE_OPTIONS = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'] as const;

export const PATIENT_TYPE_COLORS = {
  'Permanent': 'primary',
  'Vacancier': 'success',
  'Fin Traitement': 'warning'
} as const;

export const PATIENT_TYPE_STYLES: Record<TypePatient, { backgroundColor: string; color: string; borderColor: string }> = {
  Permanent: { backgroundColor: '#ecfdf5', color: '#16a34a', borderColor: '#bbf7d0' },
  Vacancier: { backgroundColor: '#fff7ed', color: '#ea580c', borderColor: '#fed7aa' },
  'Fin Traitement': { backgroundColor: '#faf5ff', color: '#7c3aed', borderColor: '#ddd6fe' },
};

export const SEXE_COLORS: Record<Sexe, string> = {
  'Homme': '#3498db',
  'Femme': '#e74c3c'
};

export const BLOOD_GROUP_COLORS: Record<string, string> = {
  'A+': '#d1d5db', 'A-': '#d1d5db', 'B+': '#d1d5db', 'B-': '#d1d5db',
  'AB+': '#d1d5db', 'AB-': '#d1d5db', 'O+': '#d1d5db', 'O-': '#d1d5db'
};

// Helper functions for consistent styling
export const getPatientTypeColor = (type: string): string => {
  switch (type) {
    case 'Permanent':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'Vacancier':
      return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'Fin Traitement':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const getBloodGroupColor = (groupeSanguin: string): string => {
  return BLOOD_GROUP_COLORS[groupeSanguin as keyof typeof BLOOD_GROUP_COLORS] || '#6b7280';
};

export function typeBadgeClass(t: TypePatient | string) {
  return PATIENT_TYPE_STYLES[t] || { backgroundColor: "#f0f0f0", color: "#000", borderColor: "#ccc" };
}