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
                <Route path="/mensagens" element={<Dashboard />} />
                <Route path="/graduacao" element={<Dashboard />} />
                <Route path="/eventos" element={<Dashboard />} />
                <Route path="/relatorios" element={<Dashboard />} />
                <Route path="/comunicacao" element={<Dashboard />} />
                <Route path="/crm" element={<Dashboard />} />
                <Route path="/perfil" element={<Dashboard />} />
                <Route path="/frequencia" element={<Dashboard />} />
                <Route path="/extrato" element={<Dashboard />} />
                <Route path="/loja" element={<Cantina />} />
                <Route path="/lancamentos" element={<Financeiro />} />
                <Route path="/caixa" element={<Financeiro />} />
                <Route path="/cts" element={<Dashboard />} />
                <Route path="/feature-flags" element={<Dashboard />} />
                <Route path="/auditoria" element={<Dashboard />} />
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
