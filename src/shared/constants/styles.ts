// Styles et couleurs pour les composants - Centralisés

// Couleurs pour les sections du dossier médical
export const SECTION_COLORS: Record<string, string> = {
  'antecedents': 'text-blue-600 bg-blue-50 hover:bg-blue-100',
  'acces_vasculaire': 'text-red-600 bg-red-50 hover:bg-red-100',
  'traitements': 'text-green-600 bg-green-50 hover:bg-green-100',
  'examens_biologiques': 'text-purple-600 bg-purple-50 hover:bg-purple-100',
  'imagerie_bilans': 'text-orange-600 bg-orange-50 hover:bg-orange-100',
  'vaccinations': 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'
};

// Classes CSS communes
export const COMMON_STYLES = {
  card: 'shadow-card',
  cardContent: 'p-6',
  sectionTitle: 'text-xl font-semibold text-foreground mb-4 flex items-center space-x-2',
  sectionIcon: 'h-5 w-5 text-primary',
  fieldLabel: 'text-sm font-medium text-muted-foreground',
  fieldValue: 'text-base text-foreground mt-1',
  fieldValueBold: 'text-base font-medium text-foreground mt-1',
  fieldGrid: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 border rounded-lg p-4 bg-muted/20',
  requiredMark: 'text-red-500',
  emptyValue: '-'
} as const;
