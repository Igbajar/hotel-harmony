import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { MainLayout } from "@/components/layout/MainLayout";
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
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/housekeeping" element={<Housekeeping />} />
              <Route path="/restaurant" element={<Restaurant />} />
              <Route path="/room-service" element={<RoomService />} />
              <Route path="/events" element={<ComingSoon />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/online-booking" element={<OnlineBooking />} />
              <Route path="/security" element={<Security />} />
              <Route path="/mobile-app" element={<MobileAppSettings />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
