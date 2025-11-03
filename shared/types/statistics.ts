export interface PatientStats {
  total: number;
  permanent: number;
  vacancier: number;
  finTraitement: number;
  activityRate: number;
  active: number;
  inactive: number;
}

export interface StatCard {
  title: string;
  value: number;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  type: string;
}
