/**
 * Formate une Date pour un input[type="date"]
 * Format attendu: yyyy-MM-dd
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse une date depuis un input[type="date"]
 */
export const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};