/**
 * CASIPass - Zustand Cart Store
 * Gerencia o carrinho de compras com a regra crítica US-24:
 * Limite máximo de 2 ingressos por conta (já comprados + no carrinho).
 */
import { create } from 'zustand';

export interface TicketType {
  id: string;
  eventId: string;
  eventName: string;
  name: string; // e.g. "Calouro", "Veterano", "Externo"
  price: number;
  availableQty: number;
  lotName: string;
}

export interface CartItem {
  ticket: TicketType;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  /** Simula ingressos já comprados anteriormente pelo usuário */
  alreadyPurchasedCount: number;

  // Actions
  addToCart: (ticket: TicketType) => boolean;
  removeFromCart: (ticketId: string) => void;
  incrementItem: (ticketId: string) => boolean;
  decrementItem: (ticketId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Computed helpers
  getTotalItems: () => number;
  getTotalPrice: () => number;
  canAddMore: () => boolean;
}

const MAX_TICKETS_PER_ACCOUNT = 2;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  alreadyPurchasedCount: 0,

  addToCart: (ticket) => {
    const state = get();
    const totalInCart = state.getTotalItems();
    if (totalInCart + state.alreadyPurchasedCount >= MAX_TICKETS_PER_ACCOUNT) {
      return false; // blocked by US-24
    }
    const existing = state.items.find((i) => i.ticket.id === ticket.id);
    if (existing) {
      return get().incrementItem(ticket.id);
    }
    set({ items: [...state.items, { ticket, quantity: 1 }] });
    return true;
  },

  removeFromCart: (ticketId) => {
    set({ items: get().items.filter((i) => i.ticket.id !== ticketId) });
  },

  incrementItem: (ticketId) => {
    const state = get();
    const totalInCart = state.getTotalItems();
    if (totalInCart + state.alreadyPurchasedCount >= MAX_TICKETS_PER_ACCOUNT) {
      return false;
    }
    set({
      items: state.items.map((i) =>
        i.ticket.id === ticketId ? { ...i, quantity: i.quantity + 1 } : i
      ),
    });
    return true;
  },

  decrementItem: (ticketId) => {
    const state = get();
    const item = state.items.find((i) => i.ticket.id === ticketId);
    if (item && item.quantity <= 1) {
      get().removeFromCart(ticketId);
    } else {
      set({
        items: state.items.map((i) =>
          i.ticket.id === ticketId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      });
    }
  },

  clearCart: () => set({ items: [] }),
  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  setCartOpen: (open) => set({ isCartOpen: open }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getTotalPrice: () =>
    get().items.reduce((sum, i) => sum + i.ticket.price * i.quantity, 0),
  canAddMore: () => {
    const state = get();
    return state.getTotalItems() + state.alreadyPurchasedCount < MAX_TICKETS_PER_ACCOUNT;
  },
}));
