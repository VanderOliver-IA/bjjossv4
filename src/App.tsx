import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
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
import NotasPessoais from "./pages/NotasPessoais";
import MainLayout from "./components/layouts/MainLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<MainLayout />}>
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
                <Route path="/notas" element={<NotasPessoais />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
