import { Patient } from '../types';

/**
 * Calcule l'âge en années à partir d'une date de naissance
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calcule l'âge au début de la dialyse
 */
export const calculateAgeAtDialysisStart = (birthDate: Date, dialysisStartDate: Date): number => {
  const birth = new Date(birthDate);
  const dialysisStart = new Date(dialysisStartDate);
  let age = dialysisStart.getFullYear() - birth.getFullYear();
  const monthDiff = dialysisStart.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && dialysisStart.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calcule la durée de traitement
 */
export const calculateTreatmentDuration = (startDate: Date, endDate?: Date | null): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  }
};

/**
 * Calcule les statistiques des patients
 */
export const getPatientStats = (patients: Patient[]) => {
  const total = patients.length;
  const permanent = patients.filter(p => p.type_patient === 'Permanent').length;
  const vacancier = patients.filter(p => p.type_patient === 'Vacancier').length;
  const finTraitement = patients.filter(p => p.type_patient === 'Fin Traitement').length;
  
  const actifs = patients.filter(p => p.type_patient !== 'Fin Traitement').length;
  const inactifs = finTraitement;
  
  return {
    total,
    permanent,
    vacancier,
    finTraitement,
    actifs,
    inactifs,
    tauxActivite: total > 0 ? ((actifs / total) * 100).toFixed(1) : '0'
  };
};