import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import { PatientFilters } from '@/shared/utils/filters';
import { SEXE_OPTIONS, GROUPE_SANGUIN_OPTIONS, TYPE_PATIENT_OPTIONS } from '@/shared/constants/patient';

interface FiltresProps {
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
  onReset: () => void;
}

export const Filtres: React.FC<FiltresProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const handleInputChange = (field: keyof PatientFilters) => (
    value: string
  ) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Filter className="h-5 w-5 text-primary" />
          <span>Recherche & Filtres</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Recherche par nom */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Recherche par nom
            </label>
            <Input
              placeholder="Rechercher un patient..."
              value={filters.search}
              onChange={(e) => handleInputChange('search')(e.target.value)}
              className="transition-smooth"
            />
          </div>

          {/* Filtre Sexe */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Sexe
            </label>
            <Select
              value={filters.sexe}
              onValueChange={handleInputChange('sexe')}
            >
              <SelectTrigger className="transition-smooth">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                {SEXE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Type
            </label>
            <Select
              value={filters.type}
              onValueChange={handleInputChange('type')}
            >
              <SelectTrigger className="transition-smooth">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                {TYPE_PATIENT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Groupe Sanguin */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              GS
            </label>
            <Select
              value={filters.groupeSanguin}
              onValueChange={handleInputChange('groupeSanguin')}
            >
              <SelectTrigger className="transition-smooth">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                {GROUPE_SANGUIN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bouton Reset */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-medium text-muted-foreground opacity-0">
              Actions
            </label>
            <Button
              variant="outline"
              onClick={onReset}
              className="w-full transition-smooth hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};