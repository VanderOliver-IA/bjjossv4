import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LoginDemo from "./pages/LoginDemo";
import Dashboard from "./pages/Dashboard";
import WhatsAppVerification from "./pages/WhatsAppVerification";
import PremiumAccount from "./pages/PremiumAccount";
import Alunos from "./pages/Alunos";
import { DemoGuardProvider } from "./contexts/DemoGuardContext";
import { DemoGuardModal } from "./components/demo/DemoGuardModal";
import Turmas from "./pages/Turmas";
import Presenca from "./pages/Presenca";
import Financeiro from "./pages/Financeiro";
import Cantina from "./pages/Cantina";
import Configuracoes from "./pages/Configuracoes";
import CRM from "./pages/CRM";
import Eventos from "./pages/Eventos";
import Graduacao from "./pages/Graduacao";
import Comunicacao from "./pages/Comunicacao";
import Relatorios from "./pages/Relatorios";
import Perfil from "./pages/Perfil";
import CTs from "./pages/CTs";
import SuperAdminLeads from "./pages/SuperAdminLeads";
import CTManagement from "./pages/CTManagement";
import ManagePermissions from "./pages/ManagePermissions";
import FeatureFlags from "./pages/FeatureFlags";
import GlobalLogs from "./pages/GlobalLogs";
import CaixaDia from "./pages/CaixaDia";
import NotasPessoais from "./pages/NotasPessoais";
import MainLayout from "./components/layouts/MainLayout";
import LandingA from "./pages/landing/LandingA";
import LandingB from "./pages/landing/LandingB";
import LandingC from "./pages/landing/LandingC";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DemoGuardProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DemoGuardModal />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<SignUp />} />
                <Route path="/verificar-whatsapp" element={<WhatsAppVerification />} />
                <Route path="/assinar" element={<PremiumAccount />} />
                <Route path="/logindemo" element={<LoginDemo />} />

                {/* Landing Pages (Public) */}
                <Route path="/vendas/dojo-digital" element={<LandingA />} />
                <Route path="/vendas/gestao-pro" element={<LandingB />} />
                <Route path="/vendas/comunidade" element={<LandingC />} />
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/crm-saas" element={<SuperAdminLeads />} />
                  <Route path="/alunos" element={<Alunos />} />
                  <Route path="/turmas" element={<Turmas />} />
                  <Route path="/presenca" element={<Presenca />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/cantina" element={<Cantina />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/crm" element={<CRM />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/graduacao" element={<Graduacao />} />
                  <Route path="/comunicacao" element={<Comunicacao />} />
                  <Route path="/mensagens" element={<Comunicacao />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/cts" element={<CTManagement />} />
                  <Route path="/cts/list" element={<CTs />} />
                  <Route path="/configuracoes/permissoes" element={<ManagePermissions />} />
                  <Route path="/feature-flags" element={<FeatureFlags />} />
                  <Route path="/caixa" element={<CaixaDia />} />
                  <Route path="/frequencia" element={<Relatorios />} />
                  <Route path="/extrato" element={<Financeiro />} />
                  <Route path="/loja" element={<Cantina />} />
                  <Route path="/lancamentos" element={<Financeiro />} />
                  <Route path="/auditoria" element={<GlobalLogs />} />
                  <Route path="/notas" element={<NotasPessoais />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DemoGuardProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
