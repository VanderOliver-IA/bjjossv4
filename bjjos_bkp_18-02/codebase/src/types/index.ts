// User Roles
export type UserRole = 'super_admin' | 'admin_ct' | 'professor' | 'atendente' | 'aluno';

// Belt Types
export type BeltType = 'branca' | 'azul' | 'roxa' | 'marrom' | 'preta';

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  ctId?: string;
}

// Student (Aluno)
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  belt: BeltType;
  stripes: number;
  photoFront: string;
  photoLeft?: string;
  photoRight?: string;
  classIds: string[];
  status: 'ativo' | 'inativo' | 'experimental';
  enrollmentDate: string;
  birthDate: string;
  emergencyContact?: string;
  notes?: string;
  balance: number;
}

// Class (Turma)
export interface TrainingClass {
  id: string;
  name: string;
  professorId: string;
  professorName: string;
  schedule: string;
  dayOfWeek: string[];
  time: string;
  studentIds: string[];
  maxStudents: number;
  level: 'iniciante' | 'intermediario' | 'avancado' | 'todos';
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  studentIds: string[];
  visitors: number;
  experimental: number;
  photoUrl?: string;
  createdBy: string;
  createdAt: string;
}

// Financial Transaction
export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  type: 'mensalidade' | 'cantina' | 'loja' | 'evento' | 'outros';
  description: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'pix' | 'cartao' | 'dinheiro' | 'boleto';
}

// Product (Cantina/Loja)
export interface Product {
  id: string;
  name: string;
  category: 'cantina' | 'loja';
  price: number;
  stock: number;
  imageUrl?: string;
}

// Event
export interface Event {
  id: string;
  title: string;
  type: 'graduacao' | 'campeonato' | 'interno' | 'seminario';
  date: string;
  description: string;
  location?: string;
  participantIds: string[];
}

// Lead (CRM)
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'novo' | 'contatado' | 'agendado' | 'experimental' | 'matriculado' | 'perdido';
  source: 'instagram' | 'facebook' | 'indicacao' | 'site' | 'outros';
  notes?: string;
  createdAt: string;
  lastContact?: string;
}

// Message
export interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// CT (Centro de Treinamento)
export interface CT {
  id: string;
  name: string;
  cnpj?: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  subscription: 'trial' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'ativo' | 'inativo' | 'pendente';
  createdAt: string;
  modules: ModulePermissions;
}

// Module Permissions
export interface ModulePermissions {
  alunos: boolean;
  turmas: boolean;
  presenca: boolean;
  crm: boolean;
  financeiro: boolean;
  cantina: boolean;
  eventos: boolean;
  graduacao: boolean;
  comunicacao: boolean;
  relatorios: boolean;
}

// Role Permissions (controlled by Admin CT)
export interface RolePermissions {
  professor: ModulePermissions;
  atendente: ModulePermissions;
  aluno: ModulePermissions;
}

// Feature Flag
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  ctIds?: string[]; // If empty, applies to all CTs
}

// Graduation Record
export interface GraduationRecord {
  id: string;
  studentId: string;
  fromBelt: BeltType;
  toBelt: BeltType;
  fromStripes: number;
  toStripes: number;
  date: string;
  eventId?: string;
  notes?: string;
}

// Daily Cash (Caixa do Dia)
export interface DailyCash {
  id: string;
  date: string;
  openingBalance: number;
  closingBalance?: number;
  transactions: CashTransaction[];
  status: 'aberto' | 'fechado';
  closedBy?: string;
  closedAt?: string;
}

export interface CashTransaction {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  paymentMethod: 'pix' | 'cartao' | 'dinheiro';
  createdAt: string;
}
