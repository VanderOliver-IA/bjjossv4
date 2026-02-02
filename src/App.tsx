import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DevAuthProvider } from "@/contexts/DevAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
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
import FeatureFlags from "./pages/FeatureFlags";
import CaixaDia from "./pages/CaixaDia";
import DevMainLayout from "./components/layouts/DevMainLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <DevAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to dashboard in dev mode */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<DevMainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
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
                <Route path="/cts" element={<CTs />} />
                <Route path="/feature-flags" element={<FeatureFlags />} />
                <Route path="/caixa" element={<CaixaDia />} />
                <Route path="/frequencia" element={<Relatorios />} />
                <Route path="/extrato" element={<Financeiro />} />
                <Route path="/loja" element={<Cantina />} />
                <Route path="/lancamentos" element={<Financeiro />} />
                <Route path="/auditoria" element={<Relatorios />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DevAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
