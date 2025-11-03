import { DossierMenuItem } from '../types/medical';

export const CATEGORY_SPECS = {
  personal: { label: "Informations Personnelles", icon: "User" },
  contact: { label: "Informations de Contact", icon: "Phone" },
  dialysis: { label: "Informations de Dialyse", icon: "Activity" },
} as const;

{/*export const DOSSIER_MENU_ITEMS: DossierMenuItem[] = [
  { key: 'consultations', label: 'Consultations', icon: 'Stethoscope', hasSubMenu: false },
  { key: 'acces_vasculaire', label: 'Accès vasculaire', icon: 'Droplet', hasSubMenu: false },
  { key: 'traitements', label: 'Traitements', icon: 'Calendar', hasSubMenu: false },
  { key: 'examens_biologiques', label: 'Examens Biologiques', icon: 'Beaker', hasSubMenu: false },
  { key: 'imagerie_bilans', label: 'Imagerie et Bilans', icon: 'Camera', hasSubMenu: false },
  { key: 'vaccinations', label: 'Vaccinations', icon: 'Circle', hasSubMenu: false }
];*/}