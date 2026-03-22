/**
 * CASIPass — Orders Store (Zustand)
 * Gerencia estado dos pedidos do usuário e fluxo de checkout
 */
import { create } from 'zustand';
import {
  ordersService,
  documentsService,
  paymentService,
  type Order,
  type PaymentResponse,
} from '../services/endpoints';

export type CheckoutStep = 'idle' | 'upload' | 'uploading' | 'submitted' | 'payment' | 'paid';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;

  // Checkout flow
  currentOrderId: string | null;
  checkoutStep: CheckoutStep;
  paymentData: PaymentResponse | null;

  // Actions
  fetchOrders: () => Promise<void>;
  createOrder: (eventoId: string, tipoIngressoId: string, qty: number) => Promise<Order>;
  uploadDocument: (file: File) => Promise<void>;
  initiatePayment: (orderId: string) => Promise<void>;
  setCheckoutStep: (step: CheckoutStep) => void;
  resetCheckout: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  currentOrderId: null,
  checkoutStep: 'idle',
  paymentData: null,

  fetchOrders: async () => {
    // TODO (V2): Migrar de Polling (15s) para WebSockets (Django Channels)
    // para atualizacoes em tempo real do status de pedidos.
    // Ref: https://channels.readthedocs.io/en/stable/
    set({ loading: true, error: null });
    try {
      const orders = await ordersService.list();
      set({ orders, loading: false });
    } catch {
      set({ error: 'Erro ao carregar pedidos.', loading: false });
    }
  },

  createOrder: async (eventoId, tipoIngressoId, qty) => {
    set({ loading: true, error: null });
    try {
      const order = await ordersService.create({
        evento_id: eventoId,
        tipo_ingresso_id: tipoIngressoId,
        quantidade: qty,
      });
      set({ currentOrderId: order.id, loading: false });
      return order;
    } catch {
      set({ error: 'Erro ao criar pedido.', loading: false });
      throw new Error('Erro ao criar pedido');
    }
  },

  uploadDocument: async (file) => {
    const { currentOrderId } = get();
    if (!currentOrderId) return;

    set({ checkoutStep: 'uploading', error: null });
    try {
      await documentsService.upload(currentOrderId, file);
      set({ checkoutStep: 'submitted' });
    } catch {
      set({ checkoutStep: 'upload', error: 'Erro ao enviar documento.' });
    }
  },

  initiatePayment: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const paymentData = await paymentService.create(orderId);
      set({ paymentData, checkoutStep: 'payment', loading: false });
    } catch {
      set({ error: 'Erro ao iniciar pagamento.', loading: false });
    }
  },

  setCheckoutStep: (step) => set({ checkoutStep: step }),

  resetCheckout: () =>
    set({
      currentOrderId: null,
      checkoutStep: 'idle',
      paymentData: null,
      error: null,
    }),
}));