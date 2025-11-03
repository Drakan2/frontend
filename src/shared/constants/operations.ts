// Constantes pour les opérations et options de l'application

// Opérations sur les patients
export const PATIENT_OPERATIONS = {
  CREATE: 'CREATE_PATIENT',
  UPDATE: 'UPDATE_PATIENT',
  DELETE: 'DELETE_PATIENT',
  VIEW: 'VIEW_PATIENT'
} as const;

// Options de filtres
export const FILTER_OPTIONS = {
  ALL: 'tous'
} as const;

// Options de cause de fin de traitement
export const CAUSE_FIN_OPTIONS = ['Transféré', 'Décès', 'Greffe'] as const;

export type PatientOperation = typeof PATIENT_OPERATIONS[keyof typeof PATIENT_OPERATIONS];
export type CauseFinOption = typeof CAUSE_FIN_OPTIONS[number];
