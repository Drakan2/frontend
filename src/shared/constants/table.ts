import { Patient } from '../types/patient';

export const TABLE_COLUMNS = {
  desktop: [
    "nom_complet",
    "cin",
    "ass_cnss",
    "age",
    "age_debut_dialyse", // Nouvelle colonne ajoutée
    "sexe",
    "groupe_sanguin",
    "date_debut",
    "duree_traitement",
    "type_patient",
  ] as const,
  mobile: ["nom_complet", "age", "groupe_sanguin", "type_patient"] as const
};

export const TABLE_LABELS: Record<(typeof TABLE_COLUMNS.desktop | typeof TABLE_COLUMNS.mobile)[number], string> = {
  nom_complet: "Nom & Prénom",
  cin: "CIN",
  ass_cnss: "Ass/CNSS",
  age: "Âge actuel",
  age_debut_dialyse: "Âge début dialyse", // Nouveau label
  sexe: "Sexe",
  groupe_sanguin: "GS",
  date_debut: "Date Début",
  duree_traitement: "Durée Traitement",
  type_patient: "Type",
};