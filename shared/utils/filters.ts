// Fonctions de filtrage - Centralisées
import { Patient } from '../types/patient';

export interface PatientFilters {
  search: string;
  sexe: string;
  type: string;
  groupeSanguin: string;
}

export const getDefaultFilters = (): PatientFilters => ({
  search: '',
  sexe: 'tous',
  type: 'tous',
  groupeSanguin: 'tous'
});

export const filterPatients = (patients: Patient[], filters: PatientFilters): Patient[] => {
  return patients.filter(patient => {
    const matchesSearch = !filters.search || 
      patient.nom_complet.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSexe = !filters.sexe || filters.sexe === 'tous' || patient.sexe === filters.sexe;
    
    const matchesType = !filters.type || filters.type === 'tous' || patient.type_patient === filters.type;
    
    const matchesGroupeSanguin = !filters.groupeSanguin || filters.groupeSanguin === 'tous' || 
      patient.groupe_sanguin === filters.groupeSanguin;
    
    return matchesSearch && matchesSexe && matchesType && matchesGroupeSanguin;
  });
};
