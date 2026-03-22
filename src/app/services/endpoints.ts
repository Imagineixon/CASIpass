/**
 * CASIPass — API Endpoints Service
 * ═══════════════════════════════════════════════════════════════
 * Funções tipadas para consumir todos os endpoints do Django REST.
 * Em modo demo, retorna mock data para desenvolvimento do front-end.
 * ═══════════════════════════════════════════════════════════════
 */
import api, { apiMultipart, tokenStorage, IS_DEMO_MODE } from './api';
import { mockService } from './mock-data';

// ── Types ───────────────────────────────────────────────────

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  cpf: string;
  telefone: string;
  role: 'client' | 'staff' | 'admin';
  is_verificado: boolean;
}

export interface RegisterPayload {
  nome_completo: string;
  email: string;
  cpf: string;
  telefone: string;
  password: string;
}

export type OrderStatus =
  | 'RASCUNHO'
  | 'PENDENTE_VALIDACAO'
  | 'APROVADO'
  | 'REJEITADO'
  | 'PAGO'
  | 'CANCELADO';

export interface Order {
  id: string;
  evento_nome: string;
  evento_data: string;
  tipo_ingresso: string;
  valor: number;
  status: OrderStatus;
  created_at: string;
  documento_url?: string;
  motivo_rejeicao?: string;
  pagamento_url?: string;
}

export interface PendingVerification {
  id: string;
  pedido_id: string;
  usuario_nome: string;
  usuario_email: string;
  usuario_cpf: string;
  tipo_ingresso: string;
  evento_nome: string;
  documento_url: string;
  created_at: string;
}

export interface TicketEntry {
  uuid: string;
  evento_nome: string;
  evento_data: string;
  evento_hora: string;
  local: string;
  titular: string;
  tipo: string;
  status: 'VALIDO' | 'UTILIZADO';
  token: string;
  qr_url?: string;
}

export interface ScanResult {
  valido: boolean;
  mensagem: string;
  ingresso?: TicketEntry;
}

export interface PaymentResponse {
  payment_id: string;
  qr_code_base64?: string;
  qr_code_text?: string;
  payment_url?: string;
  status: string;
}

// ── Eventos & Lotes (backend CRUD) ──────────────────────────

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  endereco: string;
  capacidade: number;
  inscritos: number;
  imagem_url: string;
  status: 'RASCUNHO' | 'PUBLICADO' | 'ESGOTADO' | 'ENCERRADO';
}

export interface Lote {
  id: string;
  evento_id: string;
  nome: string;
  tipo: string;
  preco: number;
  quantidade_total: number;
  quantidade_disponivel: number;
  ativo: boolean;
}

// ═══════════════════════════════════════════════════════════════
// EVENTS & LOTS ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const eventosService = {
  /** GET /api/eventos/ */
  async list(): Promise<Evento[]> {
    const { data } = await api.get<Evento[]>('/eventos/');
    return data;
  },

  /** GET /api/eventos/:id/ */
  async getById(id: string): Promise<Evento> {
    const { data } = await api.get<Evento>(`/eventos/${id}/`);
    return data;
  },

  /** GET /api/eventos/:id/lotes/ */
  async getLotes(eventoId: string): Promise<Lote[]> {
    const { data } = await api.get<Lote[]>(`/eventos/${eventoId}/lotes/`);
    return data;
  },
};

export const lotesService = {
  /** GET /api/lotes/por_evento/?evento_id=X */
  async getByEvento(eventoId: string): Promise<Lote[]> {
    const { data } = await api.get<Lote[]>('/lotes/por_evento/', {
      params: { evento_id: eventoId },
    });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const authService = {
  /** POST /api/auth/login/ */
  async login(email: string, password: string): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    if (IS_DEMO_MODE) return mockService.login(email, password);

    const { data } = await api.post<AuthTokens & { user: UserProfile }>('/auth/login/', {
      email,
      password,
    });
    tokenStorage.setTokens(data.access, data.refresh);
    return { tokens: { access: data.access, refresh: data.refresh }, user: data.user };
  },

  /** POST /api/auth/register/ */
  async register(payload: RegisterPayload): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    if (IS_DEMO_MODE) return mockService.register(payload);

    const { data } = await api.post<AuthTokens & { user: UserProfile }>('/auth/register/', payload);
    tokenStorage.setTokens(data.access, data.refresh);
    return { tokens: { access: data.access, refresh: data.refresh }, user: data.user };
  },

  /** GET /api/auth/me/ */
  async getMe(): Promise<UserProfile> {
    if (IS_DEMO_MODE) return mockService.getMe();

    const { data } = await api.get<UserProfile>('/auth/me/');
    return data;
  },

  /** POST /api/auth/refresh/ */
  async refresh(): Promise<AuthTokens> {
    const refreshToken = tokenStorage.getRefresh();
    const { data } = await api.post<AuthTokens>('/auth/refresh/', {
      refresh: refreshToken,
    });
    tokenStorage.setTokens(data.access, data.refresh);
    return data;
  },

  logout() {
    tokenStorage.clear();
  },
};

// ═══════════════════════════════════════════════════════════════
// ORDERS (PEDIDOS) ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const ordersService = {
  /** POST /api/pedidos/ — Cria pedido */
  async create(payload: {
    evento_id: string;
    tipo_ingresso_id: string;
    quantidade: number;
  }): Promise<Order> {
    if (IS_DEMO_MODE) return mockService.createOrder(payload);

    const { data } = await api.post<Order>('/pedidos/', payload);
    return data;
  },

  /** GET /api/pedidos/ — Lista pedidos do usuário */
  async list(): Promise<Order[]> {
    if (IS_DEMO_MODE) return mockService.listOrders();

    const { data } = await api.get<Order[]>('/pedidos/');
    return data;
  },

  /** GET /api/pedidos/:id/ */
  async getById(id: string): Promise<Order> {
    if (IS_DEMO_MODE) return mockService.getOrder(id);

    const { data } = await api.get<Order>(`/pedidos/${id}/`);
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENT UPLOAD ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const documentsService = {
  /** POST /api/documentos/upload/ */
  async upload(pedidoId: string, file: File): Promise<{ id: string; url: string }> {
    if (IS_DEMO_MODE) return mockService.uploadDocument(pedidoId, file);

    const formData = new FormData();
    formData.append('pedido', pedidoId);
    formData.append('arquivo', file);

    const { data } = await apiMultipart.post<{ id: string; url: string }>(
      '/documentos/upload/',
      formData
    );
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════
// PAYMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const paymentService = {
  /** POST /api/payments/criar/ */
  async create(pedidoId: string): Promise<PaymentResponse> {
    if (IS_DEMO_MODE) return mockService.createPayment(pedidoId);

    const { data } = await api.post<PaymentResponse>('/payments/criar/', {
      pedido_id: pedidoId,
    });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════
// TICKETS (INGRESSOS) ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const ticketsService = {
  /** GET /api/ingressos/ */
  async list(): Promise<TicketEntry[]> {
    if (IS_DEMO_MODE) return mockService.listTickets();

    const { data } = await api.get<TicketEntry[]>('/ingressos/');
    return data;
  },

  /** GET /api/ingressos/:uuid/qr/ */
  getQrUrl(uuid: string): string {
    if (IS_DEMO_MODE) return `casipass://demo-${uuid}`;
    return `${api.defaults.baseURL}/ingressos/${uuid}/qr/`;
  },

  /** GET /api/ingressos/:uuid/verificar/ */
  async verify(uuid: string): Promise<ScanResult> {
    if (IS_DEMO_MODE) return mockService.verifyTicket(uuid);

    const { data } = await api.get<ScanResult>(`/ingressos/${uuid}/verificar/`);
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const adminService = {
  /** GET /api/admin/verificacao/pendentes/ */
  async listPending(): Promise<PendingVerification[]> {
    if (IS_DEMO_MODE) return mockService.listPendingVerifications();

    const { data } = await api.get<PendingVerification[]>('/admin/verificacao/pendentes/');
    return data;
  },

  /** PATCH /api/admin/verificacao/:id/ */
  async updateVerification(
    id: string,
    action: 'APROVADO' | 'REJEITADO',
    motivo?: string
  ): Promise<void> {
    if (IS_DEMO_MODE) return mockService.updateVerification(id, action);

    await api.patch(`/admin/verificacao/${id}/`, {
      status: action,
      motivo_rejeicao: motivo,
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// SCANNER ENDPOINTS
// ═══════════════════════════════════════════════════════════════

export const scannerService = {
  /** POST /api/scanner/validar/ */
  async validate(uuid: string): Promise<ScanResult> {
    if (IS_DEMO_MODE) return mockService.validateScan(uuid);

    const { data } = await api.post<ScanResult>('/scanner/validar/', {
      ingresso_uuid: uuid,
    });
    return data;
  },
};