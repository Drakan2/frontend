import { 
  Shield, Eye, Beaker, Stethoscope, Calendar 
} from "lucide-react";
import { SideBarMenuItem } from "@/shared/types";

export const SECTIONS: SideBarMenuItem[] = [
  {
    key: "serologies_vaccinations",
    label: "Sérologies et Vaccinations",
    icon: Shield,
    color: "text-teal-600",
  },
  {
    key: "observations",
    label: "Observations",
    icon: Eye,
    color: "text-indigo-600",
  },
  {
    key: "biologie",
    label: "Biologie",
    icon: Beaker,
    color: "text-purple-600",
  },
  {
    key: "examens_complementaires",
    label: "Examens Complémentaires",
    icon: Stethoscope,
    color: "text-orange-600",
  },
  {
    key: "traitements",
    label: "Traitements",
    icon: Calendar,
    color: "text-green-600",
  },
];