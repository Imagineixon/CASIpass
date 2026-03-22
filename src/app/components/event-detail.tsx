/**
 * CASIPass — EventDetail Page (Retro-Futurista / Alan Turing)
 * ═══════════════════════════════════════════════════════════
 * Paleta: Vinho #760000, Bronze #b87824, Off-white #f8f7f5
 * Tipografia: Bree Serif (títulos), Inter (body), Fira Code (preços/IDs)
 * Layout: max-w-7xl container, CSS Grid info cards, Flexbox interno
 * a11y: WCAG AA contraste, 48px touch targets, focus rings #b87824
 * ═══════════════════════════════════════════════════════════
 */
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ShoppingCart,
  ArrowLeft,
  Share2,
  Bookmark,
  Cog,
} from 'lucide-react';
import { TicketCard } from './ticket-card';
import { useCartStore, type TicketType } from '../store/cart-store';
import { motion } from 'motion/react';

// ── Mock Data ───────────────────────────────────────────────
const EVENT = {
  id: 'evt-001',
  title: 'Calourada - ROCK DA RURAL!',
  subtitle: 'O maior evento acadêmico de Sistemas de Informação da UFRA',
  date: '12 de Abril, 2026',
  time: '21h às 04h',
  location: 'Centro de Convenções UFRA',
  address: 'Av. Tancredo Neves, 2501 — Belém, PA',
  description:
    'ROCK DOIDO DA RURAL, prepare-se para uma noite inesquecível! Não é só festa. É o começo de tudo!',
  heroUrl:
    'https://images.unsplash.com/photo-1765224747184-05d35f23859a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBkYXJrJTIwYXRtb3NwaGVyZXxlbnwxfHx8fDE3NzM5NzAxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  capacity: 500,
  enrolled: 347,
  organizers: [
    { icon: 'CA', name: 'CASI — Centro Acadêmico de Sistemas de Informação' },
    { icon: 'CL', name: 'CL — Centro Acadêmico de Licenciatura em Computação' },
  ],
};

const TICKETS: TicketType[] = [
  { id: 'tkt-001', eventId: 'evt-001', eventName: EVENT.title, name: 'Calouro', price: 25.0, availableQty: 80, lotName: '1º Lote' },
  { id: 'tkt-002', eventId: 'evt-001', eventName: EVENT.title, name: 'Veterano', price: 35.0, availableQty: 42, lotName: '1º Lote' },
  { id: 'tkt-003', eventId: 'evt-001', eventName: EVENT.title, name: 'Externo', price: 50.0, availableQty: 0, lotName: '1º Lote' },
  { id: 'tkt-004', eventId: 'evt-001', eventName: EVENT.title, name: 'Calouro', price: 35.0, availableQty: 120, lotName: '2º Lote' },
  { id: 'tkt-005', eventId: 'evt-001', eventName: EVENT.title, name: 'Veterano', price: 45.0, availableQty: 100, lotName: '2º Lote' },
];

/** Decorative gear SVG for retro vibe */
function GearDecoration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" opacity="0.06">
      <path
        d="M24 30a6 6 0 100-12 6 6 0 000 12z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export function EventDetail() {
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();
  const fillPercent = Math.round((EVENT.enrolled / EVENT.capacity) * 100);

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* ══════════════════════════════════════════════════════
       *  HERO — Imersive header com overlay vinho
       * ══════════════════════════════════════════════════════ */}
      <div className="relative w-full">
        <div className="h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px] w-full overflow-hidden">
          <img
            src={EVENT.heroUrl}
            alt={EVENT.title}
            className="w-full h-full object-cover"
          />
          {/* Vinho-tinted gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#760000]/95 via-[#760000]/40 to-black/20" />
        </div>

        {/* Top nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-md flex items-center justify-center text-white hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-md flex items-center justify-center text-white hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-md flex items-center justify-center text-white hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
              aria-label="Salvar"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero text — WCAG AA: white on vinho */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:px-8">
          <div className="w-full max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-1.5 bg-[#b87824] text-white text-xs px-3 py-1.5 rounded-md mb-3 font-[var(--font-mono)] tracking-wider uppercase">
                <Cog className="w-3 h-3" />
                Ingressos disponíveis
              </span>
              <h1
                className="text-white font-[var(--font-heading)]"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', lineHeight: 1.2, fontWeight: 400 }}
              >
                {EVENT.title}
              </h1>
              <p className="text-[#dda457] text-sm sm:text-base mt-1.5 max-w-xl">
                {EVENT.subtitle}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
       *  CONTENT — max-w-7xl container, responsive grid
       * ══════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* ── Info Cards Grid ──────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 -mt-6 relative z-10">
          {/* Data */}
          <div className="bg-white rounded-lg p-4 border border-[#e0ddd8] shadow-[var(--shadow-sm)] flex items-center gap-3">
            <div className="w-11 h-11 bg-[#f5e6cc] rounded-md flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-[#b87824]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)]">Data</p>
              <p className="text-sm text-[#1a1a1a] truncate" style={{ fontWeight: 500 }}>{EVENT.date}</p>
            </div>
          </div>

          {/* Horário */}
          <div className="bg-white rounded-lg p-4 border border-[#e0ddd8] shadow-[var(--shadow-sm)] flex items-center gap-3">
            <div className="w-11 h-11 bg-[#f5e6cc] rounded-md flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#b87824]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)]">Horário</p>
              <p className="text-sm text-[#1a1a1a] truncate" style={{ fontWeight: 500 }}>{EVENT.time}</p>
            </div>
          </div>

          {/* Local */}
          <div className="bg-white rounded-lg p-4 border border-[#e0ddd8] shadow-[var(--shadow-sm)] flex items-center gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-11 h-11 bg-[#f5e6cc] rounded-md flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#b87824]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)]">Local</p>
              <p className="text-sm text-[#1a1a1a] truncate" style={{ fontWeight: 500 }}>{EVENT.location}</p>
              <p className="text-xs text-[#A8A8A8] truncate">{EVENT.address}</p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout on desktop ─────────────── */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* LEFT — Details */}
          <div className="space-y-6">
            {/* Capacity Bar */}
            <div className="bg-white rounded-lg p-4 border border-[#e0ddd8] relative overflow-hidden">
              <GearDecoration className="absolute -right-4 -top-4 w-20 h-20 text-[#1a1a1a]" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#b87824]" />
                  <span className="text-sm text-[#4a4a4a]">Lotação</span>
                </div>
                <span className="text-sm text-[#1a1a1a] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
                  {EVENT.enrolled}/{EVENT.capacity}
                </span>
              </div>
              <div className="h-2.5 bg-[#ece9e3] rounded-full overflow-hidden relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: fillPercent >= 90 ? '#a85832' : '#b87824',
                  }}
                />
              </div>
              {fillPercent >= 70 && (
                <p className="text-xs text-[#a85832] mt-2 font-[var(--font-mono)] relative z-10" style={{ fontWeight: 500 }}>
                  ⚡ Restam poucas vagas — garanta seu ingresso agora.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3
                className="text-[#1a1a1a] font-[var(--font-heading)] mb-3"
                style={{ fontWeight: 400, fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}
              >
                Sobre o evento
              </h3>
              <p className="text-sm sm:text-base text-[#4a4a4a] leading-relaxed">
                {EVENT.description}
              </p>
            </div>

            {/* Organizers — dynamic list with individual icons */}
            <div className="bg-white rounded-lg p-4 border border-[#e0ddd8]">
              <p className="text-[11px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)] mb-3">
                Organizado por
              </p>
              <div className="space-y-3">
                {EVENT.organizers.map((org) => (
                  <div key={org.icon} className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 bg-[#760000] rounded-md flex items-center justify-center text-[#dda457] shrink-0 font-[var(--font-mono)]"
                      style={{ fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      {org.icon}
                    </div>
                    <p className="text-sm text-[#1a1a1a] min-w-0 truncate" style={{ fontWeight: 500 }}>
                      {org.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Tickets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-[#1a1a1a] font-[var(--font-heading)]"
                style={{ fontWeight: 400, fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}
              >
                Ingressos
              </h2>
              <span className="text-xs text-[#A8A8A8] bg-[#ece9e3] px-3 py-1.5 rounded-md font-[var(--font-mono)] tracking-wide uppercase">
                Máx. 2/conta
              </span>
            </div>
            <div className="space-y-3">
              {TICKETS.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
       *  FLOATING CART BUTTON
       * ══════════════════════════════════════════════════════ */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#f8f7f5] via-[#f8f7f5] to-[#f8f7f5]/0 z-30"
        >
          <button
            onClick={toggleCart}
            className="
              w-full max-w-7xl mx-auto flex items-center justify-between
              bg-[#760000] hover:bg-[#920000] active:scale-[0.98]
              text-white py-4 px-6 rounded-lg
              shadow-[0_4px_12px_-2px_rgba(118,0,0,0.4)]
              transition-all min-h-[56px]
              focus-visible:outline-2 focus-visible:outline-[#b87824] focus-visible:outline-offset-2
            "
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-[#dda457]" />
              <span style={{ fontWeight: 600 }}>Ver Carrinho</span>
            </div>
            <span className="bg-[#b87824] text-sm px-3 py-1 rounded-md font-[var(--font-mono)]">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}