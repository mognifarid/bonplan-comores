import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminStats from "./pages/AdminStats";
import AdminAds from "./pages/AdminAds";
import AdminReports from "./pages/AdminReports";
import PaymentSuccess from "./pages/PaymentSuccess";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Messages from "./pages/Messages";
import AdminMessages from "./pages/AdminMessages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/annonces" element={<Listings />} />
            <Route path="/annonce/:id" element={<ListingDetail />} />
            <Route path="/annonce/:id/modifier" element={<EditListing />} />
            <Route path="/deposer" element={<CreateListing />} />
            <Route path="/mes-annonces" element={<Dashboard />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/annonces" element={<AdminAds />} />
            <Route path="/admin/signalements" element={<AdminReports />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/alertes" element={<Alerts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
