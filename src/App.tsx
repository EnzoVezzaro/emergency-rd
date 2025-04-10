
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { I18nProvider } from "@/context/I18nContext"; // Import I18nProvider
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Theme constants (could be moved to a config file)
const SETTINGS_STORAGE_KEY = 'appSettings';
const THEME_DARK_CLASS = 'dark'; // Tailwind dark mode class

// Auth components
import { LoginPage } from "./pages/dashboard/LoginPage";

// Home/Index Page
import Index from "./pages/Index";

// Mobile App Pages
import MapPage from "./pages/mobile/MapPage";
import HospitalsPage from "./pages/mobile/HospitalsPage";
import HospitalDetailsPage from "./pages/mobile/HospitalDetailsPage";
import SearchPage from "./pages/mobile/SearchPage";
import DonatePage from "./pages/mobile/DonatePage";

// Dashboard Pages
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import UploadPage from "./pages/dashboard/UploadPage";
import DashboardHospitalsPage from "./pages/dashboard/HospitalsPage";
import EventsPage from "./pages/dashboard/EventsPage";
import PatientsPage from "./pages/dashboard/PatientsPage";
import SettingsPage from "./pages/dashboard/SettingsPage"; // Import the new Settings page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return authenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Theme Loading Effect ---
  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let currentTheme = 'light'; // Default theme

    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.theme === 'dark' || parsedSettings.theme === 'light') {
          currentTheme = parsedSettings.theme;
        }
      } catch (error) {
        console.error("Failed to parse theme from localStorage:", error);
      }
    }

    // Apply the theme class
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Remove existing theme classes
    root.classList.add(currentTheme); // Add the current theme class
    console.log(`Applied initial theme: ${currentTheme}`);

  }, []); // Run only once on initial app load

  return (
    <QueryClientProvider client={queryClient}>
    <AppProvider>
      <I18nProvider> {/* Wrap with I18nProvider */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page route */}
            <Route path="/" element={<Index />} />
            
            {/* Mobile app routes */}
            <Route path="/map" element={<MapPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/hospitals/:hospitalId" element={<HospitalDetailsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/donate" element={<DonatePage />} />
            
            {/* Login route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard routes - protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardHomePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/hospitals" element={
              <ProtectedRoute>
                <DashboardHospitalsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/patients" element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={ // Add the new route for settings
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider> {/* Close I18nProvider */}
    </AppProvider>
  </QueryClientProvider>
  );
};

export default App;
