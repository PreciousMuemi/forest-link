import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RangerMobile from "./pages/RangerMobile";
import NotFound from "./pages/NotFound";
import AdminSetup from "./pages/AdminSetup";
import PitchDeckPage from "./pages/PitchDeckPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminIncidents from "./pages/admin/Incidents";
import AdminAlerts from "./pages/admin/Alerts";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminDebug from "./pages/admin/Debug";
import RangerLayout from "./layouts/RangerLayout";
import RangerDashboard from "./pages/ranger/Dashboard";
import RangerMapView from "./pages/ranger/MapView";
import RangerNotifications from "./pages/ranger/Notifications";
import RangerIncidentDetail from "./pages/ranger/IncidentDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/ranger-mobile" element={<RangerMobile />} />
            <Route path="/pitch" element={<PitchDeckPage />} />

            {/* Ranger Portal Routes (Demo Mode) */}
            <Route path="/ranger" element={<RangerLayout />}>
              <Route index element={<RangerDashboard />} />
              <Route path="map" element={<RangerMapView />} />
              <Route path="notifications" element={<RangerNotifications />} />
              <Route path="incidents/:id" element={<RangerIncidentDetail />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="incidents" element={<AdminIncidents />} />
              <Route path="alerts" element={<AdminAlerts />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="debug" element={<AdminDebug />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
