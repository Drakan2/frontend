import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FiltersProvider } from "@/context/FiltersContext";
import Login from "./pages/Login";
import Stats from "./pages/Stats";
import Index from "./pages/Index";
import PatientView from "./pages/PatientView";
import Administration from "./pages/Administration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/patients" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to={isAdmin ? "/stats" : "/patients"} />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? (isAdmin ? "/stats" : "/patients") : "/login"}
          />
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute adminOnly>
            <Stats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/administration"
        element={
          <ProtectedRoute adminOnly>
            <Administration />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          {/* ✅ NOUVEAU */}
          {/* ✅ CORRECTEMENT ENVELOPPÉ : FiltersProvider DOIT ÊTRE À L'EXTÉRIEUR */}
          <FiltersProvider>
            <AuthProvider>
              <AppRoutes />
              <Toaster />
            </AuthProvider>
          </FiltersProvider>
          {/* ✅ NOUVEAU */}
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
