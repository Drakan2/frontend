import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, ID } from "@/shared/types";
import { dataService } from "@/shared/config/database";
import { storage, STORAGE_KEYS } from "@/shared/constants/storage";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  canAccessPatient: (patientId: ID) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storage.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { user: loggedUser, token } = await dataService.login(
        username,
        password
      );
      setUser(loggedUser);
      storage.set(STORAGE_KEYS.CURRENT_USER, loggedUser);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      console.error("❌ Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    storage.remove(STORAGE_KEYS.CURRENT_USER);
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  };

  const isAdmin = user?.role === "admin";

  const canAccessPatient = (patientId: ID): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.assignedPatients.includes(patientId);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAdmin,
    canAccessPatient,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
