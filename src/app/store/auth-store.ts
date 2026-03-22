/**
 * CASIPass — Auth Store (Zustand)
 * ═══════════════════════════════════════════════════════════
 * Sistema de autenticação mock com credenciais de teste.
 *
 * CREDENCIAIS DE TESTE — CLIENTE:
 *   E-mail: maria.silva@universidade.br
 *   Senha:  CASIPass2026
 *
 * CREDENCIAIS DE TESTE — STAFF/ADMIN:
 *   E-mail: admin@casi.ufra.br
 *   Senha:  Staff@2026
 *
 * ═══════════════════════════════════════════════════════════
 */
import { create } from 'zustand';

export type UserRole = 'client' | 'staff';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  password?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Actions
  loginClient: (email: string, password: string) => { success: boolean; error?: string };
  loginStaff: (email: string, password: string) => { success: boolean; error?: string };
  register: (payload: RegisterPayload) => { success: boolean; errors?: RegisterErrors };
  logout: () => void;
  updateProfile: (data: { name: string; phone: string }) => void;
}

// ── Seed users (simula banco de dados) ──────────────────────
const SEED_USERS: (AuthUser & { password: string })[] = [
  {
    id: 'USR-0x7F3A',
    name: 'Maria Eduarda Silva',
    email: 'maria.silva@universidade.br',
    phone: '(91) 99999-0000',
    cpf: '123.456.789-00',
    role: 'client',
    password: 'CASIPass2026',
  },
  {
    id: 'STF-0xAD01',
    name: 'Carlos Admin CASI',
    email: 'admin@casi.ufra.br',
    phone: '(91) 98888-1111',
    cpf: '987.654.321-00',
    role: 'staff',
    password: 'Staff@2026',
  },
];

// Registered users (mutable at runtime)
let registeredUsers = [...SEED_USERS];

// ── Validation helpers ──────────────────────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidCpf = (cpf: string) =>
  /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);

const isValidPhone = (phone: string) =>
  /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone);

// ── Store ───────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  loginClient: (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }

    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
    }

    if (found.role === 'staff') {
      return { success: false, error: 'Esta conta é de operador. Use o login Staff.' };
    }

    const { password: _, ...user } = found;
    set({ user, isAuthenticated: true });
    return { success: true };
  },

  loginStaff: (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }

    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Credenciais inválidas.' };
    }

    if (found.role !== 'staff') {
      return { success: false, error: 'Sem permissão. Esta conta não é de operador.' };
    }

    const { password: _, ...user } = found;
    set({ user, isAuthenticated: true });
    return { success: true };
  },

  register: (payload) => {
    const errors: RegisterErrors = {};

    // Name
    if (!payload.name.trim() || payload.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres.';
    }

    // Email
    if (!payload.email.trim()) {
      errors.email = 'E-mail é obrigatório.';
    } else if (!isValidEmail(payload.email)) {
      errors.email = 'E-mail inválido.';
    } else if (registeredUsers.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      errors.email = 'Este e-mail já está cadastrado.';
    }

    // Phone
    if (!payload.phone.trim()) {
      errors.phone = 'Telefone é obrigatório.';
    } else if (!isValidPhone(payload.phone)) {
      errors.phone = 'Formato inválido. Ex: (91) 99999-0000';
    }

    // CPF
    if (!payload.cpf.trim()) {
      errors.cpf = 'CPF é obrigatório.';
    } else if (!isValidCpf(payload.cpf)) {
      errors.cpf = 'CPF inválido. Use o formato 000.000.000-00';
    } else if (registeredUsers.some((u) => u.cpf === payload.cpf)) {
      errors.cpf = 'Este CPF já está cadastrado.';
    }

    // Password
    if (!payload.password) {
      errors.password = 'Senha é obrigatória.';
    } else if (payload.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres.';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Create user
    const newUser: AuthUser & { password: string } = {
      id: `USR-0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      cpf: payload.cpf.trim(),
      role: 'client',
      password: payload.password,
    };

    registeredUsers.push(newUser);

    const { password: _, ...user } = newUser;
    set({ user, isAuthenticated: true });
    return { success: true };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (data) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, name: data.name, phone: data.phone };
      // Also update in "DB"
      const idx = registeredUsers.findIndex((u) => u.id === state.user!.id);
      if (idx !== -1) {
        registeredUsers[idx] = { ...registeredUsers[idx], ...data };
      }
      return { user: updatedUser };
    });
  },
}));
