/**
 * CASIPass — CartDrawer (Retro-Futurista / Turing)
 * Drawer lateral com a paleta Vinho + Bronze.
 * US-12 (resumo), US-24 (limite 2 ingressos).
 * Touch targets >= 48px, focus rings bronze, Fira Code nos preços.
 */
import { X, Minus, Plus, ShoppingBag, Trash2, AlertTriangle } from 'lucide-react';
import { useCartStore } from '../store/cart-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/auth-store';

export function CartDrawer() {
  const {
    items, isCartOpen, setCartOpen, incrementItem, decrementItem,
    removeFromCart, clearCart, getTotalItems, getTotalPrice,
    canAddMore, alreadyPurchasedCount,
  } = useCartStore();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const remaining = 2 - totalItems - alreadyPurchasedCount;

  const handleIncrement = (ticketId: string) => {
    const success = incrementItem(ticketId);
    if (!success) {
      toast.error('Limite atingido! Máximo de 2 ingressos por conta.', {
        icon: <AlertTriangle className="w-5 h-5 text-[#a85832]" />,
      });
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#f8f7f5] z-50 flex flex-col shadow-xl"
          >
            {/* Header — Vinho */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#760000]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#dda457]" />
                <h2 className="text-white font-[var(--font-heading)]" style={{ fontWeight: 400 }}>
                  Carrinho
                </h2>
                {totalItems > 0 && (
                  <span className="bg-[#b87824] text-white text-xs px-2.5 py-0.5 rounded-md font-[var(--font-mono)]">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-[#b87824]"
                aria-label="Fechar carrinho"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Limit Banner */}
            <div
              className={`
                mx-4 mt-3 px-3 py-2.5 rounded-md text-xs flex items-center gap-2
                font-[var(--font-body)]
                ${remaining <= 0
                  ? 'bg-[#fdf0e9] text-[#a85832] border border-[#a85832]/20'
                  : 'bg-[#f5e6cc] text-[#b87824] border border-[#b87824]/20'
                }
              `}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {remaining <= 0
                  ? 'Você atingiu o limite de 2 ingressos por conta.'
                  : `Você pode adicionar mais ${remaining} ingresso${remaining > 1 ? 's' : ''}.`}
              </span>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#A8A8A8] gap-4">
                  <ShoppingBag className="w-14 h-14 stroke-[0.8]" />
                  <p className="text-sm">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.ticket.id}
                    className="bg-white rounded-lg p-4 border border-[#e0ddd8] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-[#1a1a1a] truncate" style={{ fontWeight: 500 }}>
                          {item.ticket.eventName}
                        </p>
                        <p className="text-xs text-[#737373] font-[var(--font-mono)] tracking-wide">
                          {item.ticket.name} · {item.ticket.lotName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.ticket.id)}
                        className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-md text-[#A8A8A8] hover:text-[#920000] hover:bg-[#fce8e8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-[#f8f7f5] rounded-md p-0.5 border border-[#e0ddd8]">
                        <button
                          onClick={() => decrementItem(item.ticket.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5 text-[#4a4a4a]" />
                        </button>
                        <span className="w-7 text-center text-sm font-[var(--font-mono)] text-[#1a1a1a]" style={{ fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.ticket.id)}
                          disabled={!canAddMore()}
                          className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#b87824]"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#4a4a4a]" />
                        </button>
                      </div>

                      {/* Item total — Fira Code */}
                      <span className="text-[#1a1a1a] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
                        R$ {(item.ticket.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#e0ddd8] bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#737373]">Total</span>
                  <span
                    className="text-xl text-[#1a1a1a] font-[var(--font-mono)]"
                    style={{ fontWeight: 700 }}
                  >
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    if (!isAuthenticated) {
                      toast.error('Faça login para finalizar a compra.');
                      navigate('/login');
                    } else {
                      navigate('/checkout');
                    }
                  }}
                  className="
                    w-full bg-[#b87824] hover:bg-[#dda457] active:scale-[0.98]
                    text-white py-4 rounded-md transition-all min-h-[48px] text-sm
                    focus-visible:outline-2 focus-visible:outline-[#b87824] focus-visible:outline-offset-2
                  "
                  style={{ fontWeight: 600 }}
                >
                  Finalizar Compra
                </button>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-[#A8A8A8] hover:text-[#920000] transition-colors py-2"
                >
                  Limpar carrinho
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}