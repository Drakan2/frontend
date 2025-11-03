import React, { createContext, useContext, useState, ReactNode } from "react";

interface FiltersContextType {
  resetPatientsFilters: () => void;
  setResetPatientsFilters: (callback: () => void) => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resetCallback, setResetCallback] = useState<(() => void) | null>(null);

  const resetPatientsFilters = () => {
    console.log("🔄 FiltersContext - resetPatientsFilters appelé");
    if (resetCallback) {
      resetCallback();
    }
  };

  const setResetPatientsFilters = (callback: () => void) => {
    console.log("🔄 FiltersContext - setResetPatientsFilters appelé");
    setResetCallback(() => callback);
  };

  return (
    <FiltersContext.Provider
      value={{ resetPatientsFilters, setResetPatientsFilters }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};
