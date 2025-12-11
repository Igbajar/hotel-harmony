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
              <Route path="/billing" element={<ComingSoon />} />
              <Route path="/housekeeping" element={<Housekeeping />} />
              <Route path="/restaurant" element={<ComingSoon />} />
              <Route path="/room-service" element={<RoomService />} />
              <Route path="/events" element={<ComingSoon />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/online-booking" element={<ComingSoon />} />
              <Route path="/security" element={<ComingSoon />} />
              <Route path="/mobile-app" element={<ComingSoon />} />
              <Route path="/marketing" element={<ComingSoon />} />
              <Route path="/reports" element={<ComingSoon />} />
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
