import type React from "react";
import type { AppRole, ModulePermissions } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Camera,
  DollarSign,
  ShoppingBag,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  Flag,
  FileText,
  UserCircle,
  Receipt,
  Wallet,
  Store,
  ClipboardList,
  StickyNote,
} from "lucide-react";

export interface AppNavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  module?: keyof ModulePermissions;
  group?: string;
}

export const DASHBOARD_ITEM: AppNavItem = {
  key: "dashboard",
  label: "Painel Principal",
  icon: LayoutDashboard,
  path: "/dashboard",
  group: "Principal",
};

export const CONFIG_ITEM: AppNavItem = {
  key: "configuracoes",
  label: "Configurações",
  icon: Settings,
  path: "/configuracoes",
  group: "Sistema",
};

export const PROFILE_ITEM: AppNavItem = {
  key: "perfil",
  label: "Perfil",
  icon: UserCircle,
  path: "/perfil",
  group: "Sistema",
};

export function getPrimaryActionItem(role: AppRole | null): AppNavItem {
  switch (role) {
    case "super_admin":
      return {
        key: "cts",
        label: "CTs",
        icon: Building2,
        path: "/cts",
        group: "Administração",
      };
    case "admin_ct":
      return {
        key: "presenca",
        label: "Presença",
        icon: Camera,
        path: "/presenca",
        module: "presenca",
        group: "Operação",
      };
    case "professor":
      return {
        key: "presenca",
        label: "Presença",
        icon: Camera,
        path: "/presenca",
        module: "presenca",
        group: "Operação",
      };
    case "atendente":
      return {
        key: "lancamentos",
        label: "Lançar",
        icon: Receipt,
        path: "/lancamentos",
        module: "financeiro",
        group: "Financeiro",
      };
    case "aluno":
      return {
        key: "frequencia",
        label: "Frequência",
        icon: Calendar,
        path: "/frequencia",
        group: "Aluno",
      };
    default:
      return DASHBOARD_ITEM;
  }
}

export function getDefaultQuickAccess(role: AppRole | null): { leftPath: string | null; rightPath: string | null } {
  switch (role) {
    case "super_admin":
      return { leftPath: "/feature-flags", rightPath: "/auditoria" };
    case "admin_ct":
      return { leftPath: "/alunos", rightPath: "/financeiro" };
    case "professor":
      return { leftPath: "/turmas", rightPath: "/mensagens" };
    case "atendente":
      return { leftPath: "/cantina", rightPath: "/caixa" };
    case "aluno":
      return { leftPath: "/perfil", rightPath: "/extrato" };
    default:
      return { leftPath: null, rightPath: null };
  }
}

export function getAllNavItemsForRole(role: AppRole | null): AppNavItem[] {
  // Observação: itens com `module` são filtrados por `hasModuleAccess`.
  // Itens sem `module` seguem o comportamento original (sempre visíveis).
  switch (role) {
    case "super_admin":
      return [
        DASHBOARD_ITEM,
        { key: "cts", label: "CTs", icon: Building2, path: "/cts", group: "Administração" },
        { key: "flags", label: "Flags", icon: Flag, path: "/feature-flags", group: "Administração" },
        { key: "auditoria", label: "Auditoria", icon: FileText, path: "/auditoria", group: "Administração" },
        { key: "financeiro", label: "Financeiro", icon: DollarSign, path: "/financeiro", group: "Financeiro" },
        { key: "notas", label: "Notas", icon: StickyNote, path: "/notas", group: "Pessoal" },
        CONFIG_ITEM,
      ];

    case "admin_ct":
      return [
        DASHBOARD_ITEM,
        { key: "alunos", label: "Alunos", icon: Users, path: "/alunos", module: "alunos", group: "Operação" },
        { key: "turmas", label: "Turmas", icon: Calendar, path: "/turmas", module: "turmas", group: "Operação" },
        { key: "presenca", label: "Presença", icon: Camera, path: "/presenca", module: "presenca", group: "Operação" },
        { key: "financeiro", label: "Financeiro", icon: DollarSign, path: "/financeiro", module: "financeiro", group: "Financeiro" },
        { key: "cantina", label: "Cantina", icon: ShoppingBag, path: "/cantina", module: "cantina", group: "Operação" },
        { key: "crm", label: "CRM", icon: ClipboardList, path: "/crm", module: "crm", group: "Vendas" },
        { key: "eventos", label: "Eventos", icon: Calendar, path: "/eventos", module: "eventos", group: "Eventos" },
        { key: "graduacao", label: "Graduação", icon: Award, path: "/graduacao", module: "graduacao", group: "Acadêmico" },
        { key: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/mensagens", module: "comunicacao", group: "Comunicação" },
        { key: "relatorios", label: "Relatórios", icon: BarChart3, path: "/relatorios", module: "relatorios", group: "Relatórios" },
        { key: "notas", label: "Notas", icon: StickyNote, path: "/notas", group: "Pessoal" },
        PROFILE_ITEM,
        CONFIG_ITEM,
      ];

    case "professor":
      return [
        DASHBOARD_ITEM,
        { key: "turmas", label: "Turmas", icon: Calendar, path: "/turmas", module: "turmas", group: "Acadêmico" },
        { key: "alunos", label: "Alunos", icon: Users, path: "/alunos", module: "alunos", group: "Acadêmico" },
        { key: "presenca", label: "Presença", icon: Camera, path: "/presenca", module: "presenca", group: "Operação" },
        { key: "graduacao", label: "Graduação", icon: Award, path: "/graduacao", module: "graduacao", group: "Acadêmico" },
        { key: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/mensagens", module: "comunicacao", group: "Comunicação" },
        { key: "notas", label: "Notas", icon: StickyNote, path: "/notas", group: "Pessoal" },
        PROFILE_ITEM,
        CONFIG_ITEM,
      ];

    case "atendente":
      return [
        DASHBOARD_ITEM,
        { key: "cantina", label: "Cantina", icon: ShoppingBag, path: "/cantina", module: "cantina", group: "Operação" },
        { key: "lancamentos", label: "Lançar", icon: Receipt, path: "/lancamentos", module: "financeiro", group: "Financeiro" },
        { key: "alunos", label: "Alunos", icon: Users, path: "/alunos", module: "alunos", group: "Operação" },
        { key: "caixa", label: "Caixa", icon: Wallet, path: "/caixa", module: "financeiro", group: "Financeiro" },
        { key: "crm", label: "CRM", icon: ClipboardList, path: "/crm", module: "crm", group: "Vendas" },
        { key: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/mensagens", module: "comunicacao", group: "Comunicação" },
        { key: "notas", label: "Notas", icon: StickyNote, path: "/notas", group: "Pessoal" },
        PROFILE_ITEM,
        CONFIG_ITEM,
      ];

    case "aluno":
      return [
        DASHBOARD_ITEM,
        { key: "perfil", label: "Perfil", icon: UserCircle, path: "/perfil", group: "Aluno" },
        { key: "frequencia", label: "Frequência", icon: Calendar, path: "/frequencia", group: "Aluno" },
        { key: "extrato", label: "Extrato", icon: Receipt, path: "/extrato", group: "Aluno" },
        { key: "loja", label: "Loja", icon: Store, path: "/loja", group: "Aluno" },
        { key: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/mensagens", module: "comunicacao", group: "Comunicação" },
        { key: "notas", label: "Notas", icon: StickyNote, path: "/notas", group: "Pessoal" },
        CONFIG_ITEM,
      ];

    default:
      return [DASHBOARD_ITEM, CONFIG_ITEM];
  }
}
