import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserDetailsModalProps } from "@/shared/types";
import { User as UserIcon, Calendar, Shield, Users, Key } from "lucide-react";

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onOpenChange,
  user,
  patients,
}) => {
  const patientNames = user.assignedPatients
    .map((id) => {
      const patient = patients.find((p) => p.id === id);
      return patient ? patient.nom_complet : null;
    })
    .filter((name): name is string => name !== null && name !== undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <span>Détails de l'utilisateur</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nom d'utilisateur
              </label>
              <p className="text-lg font-semibold text-foreground mt-1">
                {user.username}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mot de passe
              </label>
              <p className="text-lg font-semibold text-foreground mt-1 font-mono bg-muted px-3 py-2 rounded">
                {user.password}
              </p>
            </div>
          </div>

          {user.role === "user" && (
            <>
              <Separator />

              {/* Accès aux patients pour les users uniquement */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Liste des patients autorisés</span>
                  </label>

                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {user.assignedPatients.length} patient(s) assigné(s) -{" "}
                      {patientNames.length} patient(s) trouvé
                    </p>

                    {patientNames.length > 0 ? (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {patientNames.map((name, index) => (
                          <div
                            key={index}
                            className="text-sm bg-muted/50 px-2 py-1 rounded"
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    ) : user.assignedPatients.length > 0 ? (
                      <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-3">
                        <p className="text-sm text-destructive font-medium">
                          ⚠️ Aucun patient trouvé
                        </p>
                        <p className="text-xs text-destructive/80 mt-1">
                          Les patients assignés ont peut-être été supprimés
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Aucun patient assigné
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
