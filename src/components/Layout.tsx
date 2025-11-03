import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Settings, LogOut, Stethoscope } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useFilters } from "@/context/FiltersContext"; // ← AJOUTEZ CET IMPORT

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  path: string;
  label: string;
  mobileLabel: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  resetFilters?: boolean; // ← NOUVEAU
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { resetPatientsFilters } = useFilters(); // ← AJOUTEZ CETTE LIGNE

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path: string, resetFilters?: boolean) => {
    // Si on clique sur "Patients" ET qu'on est déjà sur la page patients, réinitialiser les filtres
    if (
      path === "/patients" &&
      location.pathname === "/patients" &&
      resetFilters
    ) {
      resetPatientsFilters();
    }
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems: NavigationItem[] = [
    {
      path: "/stats",
      label: "Statistiques",
      mobileLabel: "Stats",
      icon: BarChart3,
      adminOnly: true,
    },
    {
      path: "/patients",
      label: "Patients",
      mobileLabel: "Patients",
      icon: Users,
      adminOnly: false,
      resetFilters: true, // ← CET ITEM RÉINITIALISE LES FILTRES
    },
    {
      path: "/administration",
      label: "Administration",
      mobileLabel: "Admin",
      icon: Settings,
      adminOnly: true,
    },
  ];

  const filteredNavigationItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const getButtonVariant = (path: string) =>
    isActive(path) ? "secondary" : "ghost";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-primary bg-transparent">
                  <Stethoscope className="w-4 h-4 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground hidden lg:block">
                  Gestion Patients
                </span>
                <span className="text-lg font-bold text-foreground lg:hidden">
                  GP
                </span>
              </div>

              {/* Separator après le nom de l'application */}
              <div className="h-6 w-px bg-border hidden lg:block" />
            </div>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
                {filteredNavigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={getButtonVariant(item.path)}
                    size="sm"
                    onClick={() =>
                      handleNavigation(item.path, item.resetFilters)
                    }
                    className="text-sm transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            )}

            {/* User Info and Logout */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="h-6 w-px bg-border hidden lg:block" />

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground hidden lg:block">
                    {user.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:inline">Déconnexion</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "container mx-auto px-4 py-6",
          user && isMobile && "pb-24",
          !isMobile && "pb-6"
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {user && isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 md:hidden pb-safe">
          <div className="flex items-center justify-around py-2 px-2">
            {filteredNavigationItems.map((item) => (
              <Button
                key={item.path}
                variant={getButtonVariant(item.path)}
                size="sm"
                onClick={() => handleNavigation(item.path, item.resetFilters)}
                className="flex-1 flex-col h-12 gap-1 min-w-0 px-1"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.mobileLabel}</span>
              </Button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};
