import React, { useState } from "react";
import { Patient } from "@/shared/types";
import { SideBarDM } from "@/components/SideBarDM";
import { ContenuCommun } from "@/components/ContenuCommun";
import { AntecedentsCard } from "@/components/AntecedentsCard";
import { SECTIONS } from "@/shared/constants/sections";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface PatientDMProps {
  patient: Patient;
}

export const PatientDM: React.FC<PatientDMProps> = ({ patient }) => {
  const [activeSection, setActiveSection] = useState("serologies_vaccinations");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Carte Antécédents (toujours visible) */}
      <AntecedentsCard patient={patient} />

      {/* Mobile Drawer Menu */}
      <div className="block md:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mb-4 flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              Menu Dossier Médical
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[70vh]">
            <div className="p-3">
              <SideBarDM
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                menuItems={SECTIONS}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-6 min-h-[600px]">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <SideBarDM
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            menuItems={SECTIONS}
          />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <ContenuCommun patient={patient} activeSection={activeSection} />
        </div>
      </div>

      {/* Mobile Content */}
      <div className="block md:hidden">
        <ContenuCommun patient={patient} activeSection={activeSection} />
      </div>
    </div>
  );
};
