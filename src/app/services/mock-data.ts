/**
 * CASIPass — Mock Data Service
 * ═══════════════════════════════════════════════════════════════
 * Simula as respostas da API Django para desenvolvimento do
 * front-end sem backend real. Mantém estado em memória.
 * ═══════════════════════════════════════════════════════════════
 */
import type {
  UserProfile,
  AuthTokens,
  RegisterPayload,
  Order,
  OrderStatus,
  PendingVerification,
  TicketEntry,
  ScanResult,
  PaymentResponse,
} from './endpoints';

// ── Simulated delay ─────────────────────────────────────────
const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

// ── Seed data ───────────────────────────────────────────────
const USERS: (UserProfile & { password: string })[] = [
  {
    id: 'USR-0x7F3A',
    nome_completo: 'Maria Eduarda Silva',
    email: 'maria.silva@universidade.br',
    cpf: '123.456.789-00',
    telefone: '(91) 99999-0000',
    role: 'client',
    is_verificado: true,
    password: 'CASIPass2026',
  },
  {
    id: 'STF-0xAD01',
    nome_completo: 'Carlos Admin CASI',
    email: 'admin@casi.ufra.br',
    cpf: '987.654.321-00',
    telefone: '(91) 98888-1111',
    role: 'admin',
    is_verificado: true,
    password: 'Staff@2026',
  },
];

let currentUser: UserProfile | null = null;

const MOCK_ORDERS: Order[] = [
  {
    id: 'PED-0xA1B2',
    evento_nome: 'Calourada - ROCK DA RURAL!',
    evento_data: '12 de Abril, 2026',
    tipo_ingresso: 'Calouro',
    valor: 25.0,
    status: 'APROVADO',
    created_at: '2026-03-15T10:30:00Z',
    documento_url: '/mock/atestado-maria.pdf',
  },
  {
    id: 'PED-0xC3D4',
    evento_nome: 'Hackathon CASI: 48h de Código',
    evento_data: '25 de Maio, 2026',
    tipo_ingresso: 'Veterano',
    valor: 15.0,
    status: 'PENDENTE_VALIDACAO',
    created_at: '2026-03-18T14:20:00Z',
    documento_url: '/mock/atestado-maria-2.pdf',
  },
  {
    id: 'PED-0xE5F6',
    evento_nome: 'Workshop: IA Generativa',
    evento_data: '08 de Junho, 2026',
    tipo_ingresso: 'Externo',
    valor: 50.0,
    status: 'PAGO',
    created_at: '2026-03-10T09:00:00Z',
  },
];

const MOCK_PENDING: PendingVerification[] = [
  {
    id: 'VER-001',
    pedido_id: 'PED-0xC3D4',
    usuario_nome: 'Maria Eduarda Silva',
    usuario_email: 'maria.silva@universidade.br',
    usuario_cpf: '123.456.789-00',
    tipo_ingresso: 'Veterano',
    evento_nome: 'Hackathon CASI: 48h de Código',
    documento_url: '/mock/atestado-maria-2.pdf',
    created_at: '2026-03-18T14:20:00Z',
  },
  {
    id: 'VER-002',
    pedido_id: 'PED-0xG7H8',
    usuario_nome: 'João Pedro Costa',
    usuario_email: 'joao.costa@universidade.br',
    usuario_cpf: '456.789.123-00',
    tipo_ingresso: 'Calouro',
    evento_nome: 'Calourada - ROCK DA RURAL!',
    documento_url: '/mock/atestado-joao.pdf',
    created_at: '2026-03-19T08:15:00Z',
  },
  {
    id: 'VER-003',
    pedido_id: 'PED-0xI9J0',
    usuario_nome: 'Ana Luísa Martins',
    usuario_email: 'ana.martins@universidade.br',
    usuario_cpf: '789.123.456-00',
    tipo_ingresso: 'Veterano',
    evento_nome: 'Workshop: IA Generativa',
    documento_url: '/mock/atestado-ana.pdf',
    created_at: '2026-03-20T11:45:00Z',
  },
];

const MOCK_TICKETS: TicketEntry[] = [
  {
    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    evento_nome: 'Calourada - ROCK DA RURAL!',
    evento_data: '12 Abr 2026',
    evento_hora: '21h — 04h',
    local: 'Centro de Convenções UFRA',
    titular: 'Maria Eduarda Silva',
    tipo: 'Calouro',
    status: 'VALIDO',
    token: '0xA7F3C2D9E1',
  },
  {
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    evento_nome: 'Workshop: IA Generativa',
    evento_data: '08 Jun 2026',
    evento_hora: '09h — 18h',
    local: 'Auditório Principal UFRA',
    titular: 'Maria Eduarda Silva',
    tipo: 'Externo',
    status: 'VALIDO',
    token: '0xB8E4D3F2A0',
  },
];

// Keep mutable state for demo interactions
let pendingList = [...MOCK_PENDING];
let ordersList = [...MOCK_ORDERS];

// ── Mock Service ────────────────────────────────────────────
export const mockService = {
  // AUTH
  async login(
    email: string,
    password: string
  ): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    await delay(800);
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw { response: { status: 401, data: { detail: 'Credenciais inválidas.' } } };
    const { password: _, ...user } = found;
    currentUser = user;
    return {
      tokens: { access: 'mock-access-token-' + Date.now(), refresh: 'mock-refresh-token' },
      user,
    };
  },

  async register(
    payload: RegisterPayload
  ): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    await delay(1000);
    if (USERS.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw {
        response: { status: 400, data: { email: ['Este e-mail já está cadastrado.'] } },
      };
    }
    const user: UserProfile = {
      id: `USR-0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
      nome_completo: payload.nome_completo,
      email: payload.email.toLowerCase(),
      cpf: payload.cpf,
      telefone: payload.telefone,
      role: 'client',
      is_verificado: false,
    };
    currentUser = user;
    return {
      tokens: { access: 'mock-access-' + Date.now(), refresh: 'mock-refresh-token' },
      user,
    };
  },

  async getMe(): Promise<UserProfile> {
    await delay(300);
    if (!currentUser) throw { response: { status: 401 } };
    return currentUser;
  },

  // ORDERS
  async createOrder(payload: {
    evento_id: string;
    tipo_ingresso_id: string;
    quantidade: number;
  }): Promise<Order> {
    await delay(1000);
    const order: Order = {
      id: `PED-0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
      evento_nome: 'Calourada - ROCK DA RURAL!',
      evento_data: '12 de Abril, 2026',
      tipo_ingresso: payload.tipo_ingresso_id.includes('001') ? 'Calouro' : 'Veterano',
      valor: 25.0,
      status: 'RASCUNHO',
      created_at: new Date().toISOString(),
    };
    ordersList.push(order);
    return order;
  },

  async listOrders(): Promise<Order[]> {
    await delay(500);
    return [...ordersList];
  },

  async getOrder(id: string): Promise<Order> {
    await delay(300);
    const found = ordersList.find((o) => o.id === id);
    if (!found) throw { response: { status: 404 } };
    return found;
  },

  // DOCUMENTS
  async uploadDocument(
    pedidoId: string,
    _file: File
  ): Promise<{ id: string; url: string }> {
    await delay(1500);
    // Update order status
    ordersList = ordersList.map((o) =>
      o.id === pedidoId ? { ...o, status: 'PENDENTE_VALIDACAO' as OrderStatus } : o
    );
    return { id: `DOC-${Date.now()}`, url: '/mock/uploaded-doc.pdf' };
  },

  // PAYMENTS
  async createPayment(pedidoId: string): Promise<PaymentResponse> {
    await delay(1200);
    ordersList = ordersList.map((o) =>
      o.id === pedidoId ? { ...o, status: 'PAGO' as OrderStatus } : o
    );
    return {
      payment_id: `PAY-${Date.now()}`,
      qr_code_text:
        '00020126580014BR.GOV.BCB.PIX0136casipass-pix-demo@mail.com5204000053039865404{VALOR}5802BR5913CASI UFRA6008BELEM-PA62070503***63041234',
      payment_url: 'https://casipass.demo/pagamento',
      status: 'pending',
    };
  },

  // TICKETS
  async listTickets(): Promise<TicketEntry[]> {
    await delay(500);
    return [...MOCK_TICKETS];
  },

  async verifyTicket(uuid: string): Promise<ScanResult> {
    await delay(600);
    const ticket = MOCK_TICKETS.find((t) => t.uuid === uuid);
    if (!ticket) {
      return { valido: false, mensagem: 'Ingresso não encontrado no sistema.' };
    }
    if (ticket.status === 'UTILIZADO') {
      return { valido: false, mensagem: 'Ingresso já foi utilizado!', ingresso: ticket };
    }
    return { valido: true, mensagem: 'Ingresso válido. Liberado para entrada.', ingresso: ticket };
  },

  async validateScan(uuid: string): Promise<ScanResult> {
    await delay(800);
    const ticket = MOCK_TICKETS.find((t) => t.uuid === uuid);
    if (!ticket) {
      return { valido: false, mensagem: 'Ingresso não encontrado.' };
    }
    if (ticket.status === 'UTILIZADO') {
      return { valido: false, mensagem: 'INGRESSO JÁ UTILIZADO! Entrada bloqueada.', ingresso: ticket };
    }
    // Mark as used
    ticket.status = 'UTILIZADO';
    return { valido: true, mensagem: 'ENTRADA LIBERADA! Ingresso validado.', ingresso: ticket };
  },

  // ADMIN
  async listPendingVerifications(): Promise<PendingVerification[]> {
    await delay(600);
    return [...pendingList];
  },

  async updateVerification(id: string, action: 'APROVADO' | 'REJEITADO'): Promise<void> {
    await delay(800);
    pendingList = pendingList.filter((p) => p.id !== id);
    // Also update the order
    const pending = MOCK_PENDING.find((p) => p.id === id);
    if (pending) {
      ordersList = ordersList.map((o) =>
        o.id === pending.pedido_id
          ? { ...o, status: action as OrderStatus }
          : o
      );
    }
  },
};
