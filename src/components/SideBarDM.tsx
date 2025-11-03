import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SideBarDMProps, SideBarMenuItem } from "@/shared/types";
import { SECTIONS } from "@/shared/constants/sections";

export const SideBarDM: React.FC<SideBarDMProps> = ({
  activeSection,
  onSectionChange,
  isDrawer = false,
  menuItems = SECTIONS,
}) => {
  return (
    <Card className="shadow-card h-fit sticky top-6 border-0 bg-white">
      <CardContent className="p-4">
        <nav className="flex flex-col space-y-2">
          {menuItems.map((section: SideBarMenuItem) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;

            return (
              <button
                key={section.key}
                onClick={() => onSectionChange(section.key)}
                className={`
                  flex items-center gap-3 p-3 w-full rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-primary/20 text-primary font-semibold shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-primary" : section.color || "text-gray-600"
                  }`}
                />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};
