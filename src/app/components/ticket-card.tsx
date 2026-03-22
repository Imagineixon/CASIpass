/**
 * CASIPass — TicketCard (Retro-Futurista / Turing)
 * Card de ingresso com estética industrial: cantos levemente arredondados,
 * sombras curtas, Fira Code nos preços, Inter no body, bronze nos CTAs.
 * US-07, US-11, US-24
 */
import { Minus, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useCartStore, type TicketType } from '../store/cart-store';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface TicketCardProps {
  ticket: TicketType;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { items, addToCart, incrementItem, decrementItem, canAddMore } = useCartStore();
  const cartItem = items.find((i) => i.ticket.id === ticket.id);
  const quantity = cartItem?.quantity ?? 0;
  const isSoldOut = ticket.availableQty === 0;

  const handleAdd = () => {
    if (isSoldOut) return;
    const success = addToCart(ticket);
    if (!success) {
      toast.error('Limite atingido! Máximo de 2 ingressos por conta.', {
        icon: <AlertTriangle className="w-5 h-5 text-[#a85832]" />,
      });
    }
  };

  const handleIncrement = () => {
    if (isSoldOut) return;
    const success = incrementItem(ticket.id);
    if (!success) {
      toast.error('Limite atingido! Máximo de 2 ingressos por conta.', {
        icon: <AlertTriangle className="w-5 h-5 text-[#a85832]" />,
      });
    }
  };

  const badgeMap: Record<string, { bg: string; text: string; dot: string }> = {
    Calouro: { bg: 'bg-[#f0f2ec]', text: 'text-[#6b705c]', dot: 'bg-[#6b705c]' },
    Veterano: { bg: 'bg-[#eef4f8]', text: 'text-[#4a6d88]', dot: 'bg-[#4a6d88]' },
    Externo: { bg: 'bg-[#f8f7f5]', text: 'text-[#737373]', dot: 'bg-[#737373]' },
  };
  const badge = badgeMap[ticket.name] ?? badgeMap.Externo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative bg-white rounded-lg border border-[#e0ddd8]
        p-4 sm:p-5 transition-shadow
        hover:shadow-[0_2px_4px_-1px_rgba(26,26,26,0.08),0_1px_2px_-1px_rgba(26,26,26,0.06)]
        ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Sold-out stamp */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center z-10 pointer-events-none">
          <span
            className="bg-[#920000] text-white px-6 py-1.5 rounded-md text-sm font-[var(--font-mono)] tracking-[0.15em] uppercase"
            style={{ transform: 'rotate(-6deg)', fontWeight: 600 }}
          >
            Esgotado
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: badge, lot, price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${badge.bg} ${badge.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {ticket.name}
            </span>
            <span className="text-xs text-[#A8A8A8] font-[var(--font-mono)] tracking-wide uppercase">
              {ticket.lotName}
            </span>
          </div>

          {/* Price — Fira Code */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[#A8A8A8]">R$</span>
            <span
              className="text-2xl text-[#1a1a1a] font-[var(--font-mono)]"
              style={{ fontWeight: 600 }}
            >
              {ticket.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Availability */}
          <p className="text-xs text-[#A8A8A8] mt-1.5 font-[var(--font-mono)] tracking-wide">
            {ticket.availableQty} restantes
          </p>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={isSoldOut || !canAddMore()}
              className="
                flex items-center gap-2
                bg-[#b87824] hover:bg-[#dda457] active:scale-[0.97]
                text-white px-4 py-3 rounded-md
                transition-all min-h-[48px]
                disabled:opacity-40 disabled:cursor-not-allowed
                focus-visible:outline-2 focus-visible:outline-[#b87824] focus-visible:outline-offset-2
              "
              style={{ fontWeight: 500 }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Adicionar</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#f5e6cc] rounded-md p-1">
              <button
                onClick={() => decrementItem(ticket.id)}
                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-md bg-white border border-[#e0ddd8]
                  text-[#b87824] hover:bg-[#f8f7f5] active:scale-[0.95]
                  transition-all min-h-[40px] min-w-[40px]
                  focus-visible:outline-2 focus-visible:outline-[#b87824]
                "
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="w-8 text-center text-[#b87824] font-[var(--font-mono)]"
                style={{ fontWeight: 600 }}
              >
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={!canAddMore()}
                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-md bg-[#b87824] text-white
                  hover:bg-[#dda457] active:scale-[0.95]
                  transition-all disabled:opacity-40 disabled:cursor-not-allowed
                  min-h-[40px] min-w-[40px]
                  focus-visible:outline-2 focus-visible:outline-[#b87824]
                "
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
