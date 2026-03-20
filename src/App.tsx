import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ChatWidget } from "@/components/chat/ChatWidget";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Reservations from "./pages/Reservations";
import Guests from "./pages/Guests";
import Settings from "./pages/Settings";
import RoomService from "./pages/RoomService";
import Housekeeping from "./pages/Housekeeping";
import Staff from "./pages/Staff";
import OnlineBooking from "./pages/OnlineBooking";
import Reports from "./pages/Reports";
import Billing from "./pages/Billing";
import Restaurant from "./pages/Restaurant";
import Marketing from "./pages/Marketing";
import MobileAppSettings from "./pages/MobileAppSettings";
import Security from "./pages/Security";
import UserManagement from "./pages/UserManagement";
import Bar from "./pages/Bar";
import Inventory from "./pages/Inventory";
import Vendors from "./pages/Vendors";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import InstallApp from "./pages/InstallApp";
import SiteManagement from "./pages/SiteManagement";
import BackupRestore from "./pages/BackupRestore";
import Notifications from "./pages/Notifications";
import Events from "./pages/Events";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <ChatWidget />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/online-booking" element={<OnlineBooking />} />
              <Route path="/install" element={<InstallApp />} />
              
              {/* Protected routes */}
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/housekeeping" element={<Housekeeping />} />
                <Route path="/restaurant" element={<Restaurant />} />
                <Route path="/room-service" element={<RoomService />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/events" element={<Events />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/security" element={<Security />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/mobile-app" element={<MobileAppSettings />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/site-management" element={<SiteManagement />} />
                <Route path="/backup" element={<BackupRestore />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
