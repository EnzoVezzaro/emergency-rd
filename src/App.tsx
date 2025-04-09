
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";

// Home/Index Page
import Index from "./pages/Index";

// Mobile App Pages
import MapPage from "./pages/MapPage";
import HospitalsPage from "./pages/HospitalsPage";
import HospitalDetailsPage from "./pages/HospitalDetailsPage";
import SearchPage from "./pages/SearchPage";
import DonatePage from "./pages/DonatePage";

// Dashboard Pages
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import UploadPage from "./pages/dashboard/UploadPage";
import DashboardHospitalsPage from "./pages/dashboard/HospitalsPage";
import EventsPage from "./pages/dashboard/EventsPage";
import PatientsPage from "./pages/dashboard/PatientsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
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
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/dashboard/upload" element={<UploadPage />} />
            <Route path="/dashboard/hospitals" element={<DashboardHospitalsPage />} />
            <Route path="/dashboard/events" element={<EventsPage />} />
            <Route path="/dashboard/patients" element={<PatientsPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
