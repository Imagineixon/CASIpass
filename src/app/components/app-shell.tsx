/**
 * CASIPass — App Shell (extracted from original App.tsx)
 * Contains the main demo views: detail, grid, ticket
 * Now auth-aware with user state display
 */
import { useState } from 'react';
import { Toaster } from 'sonner';
import { EventDetail } from './event-detail';
import { CartDrawer } from './cart-drawer';
import { EventCard } from './event-card';
import { DigitalTicket, type DigitalTicketData } from './digital-ticket';
import { Ticket, LayoutGrid, Eye, ArrowLeft, User, LogIn, LogOut, Shield, ShoppingBag, Scan, ClipboardCheck, QrCode } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../store/auth-store';
import { toast } from 'sonner';

type View = 'detail' | 'grid' | 'ticket';

const DEMO_EVENTS = [
  {
    id: 'evt-001',
    title: 'Calourada - ROCK DA RURAL!',
    date: '12 de Abril, 2026',
    location: 'Centro de Convenções UFRA',
    imageUrl: 'https://images.unsplash.com/photo-1765224747184-05d35f23859a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBkYXJrJTIwYXRtb3NwaGVyZXxlbnwxfHx8fDE3NzM5NzAxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    priceFrom: 25.0,
    capacity: 500,
    enrolled: 347,
    status: 'Publicado' as const,
  },
  {
    id: 'evt-002',
    title: 'Hackathon CASI: 48h de Código',
    date: '25 de Maio, 2026',
    location: 'Lab. de Informática UFRA',
    imageUrl: 'https://images.unsplash.com/photo-1762329406809-e46415e6974e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2lyY3VpdCUyMGJvYXJkJTIwdGVjaG5vbG9neSUyMHJldHJvfGVufDF8fHx8MTc3Mzk3MDE1OXww&ixlib=rb-4.1.0&q=80&w=1080',
    priceFrom: 15.0,
    capacity: 120,
    enrolled: 120,
    status: 'Esgotado' as const,
  },
  {
    id: 'evt-003',
    title: 'Workshop: IA Generativa para Universitários',
    date: '08 de Junho, 2026',
    location: 'Auditório Principal UFRA',
    imageUrl: 'https://images.unsplash.com/photo-1766466031388-55d6157dbe77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwZXZlbnQlMjBuaWdodCUyMGxpZ2h0c3xlbnwxfHx8fDE3NzM5NzAxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    priceFrom: 10.0,
    capacity: 200,
    enrolled: 85,
    status: 'Publicado' as const,
  },
];

const DEMO_TICKET: DigitalTicketData = {
  id: 'ing-a7f3c2',
  token: '0xA7F3C2D9E1',
  eventName: 'Calourada - ROCK DA RURAL!',
  eventDate: '12 Abr 2026',
  eventTime: '21h — 04h',
  location: 'Centro de Convenções UFRA',
  holderName: 'Maria Eduarda Silva',
  ticketType: 'Calouro',
  status: 'Válido',
};

export function AppShell() {
  const [view, setView] = useState<View>('detail');
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada.');
  };

  return (
    <div className="size-full bg-[#f8f7f5]">
      {/* ── View Switcher (Demo nav) ───────────────────── */}
      <div className="fixed top-4 right-4 z-50 flex gap-1.5 bg-white rounded-lg border border-[#e0ddd8] p-1 shadow-[var(--shadow-md)]">
        <button
          onClick={() => setView('detail')}
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${view === 'detail' ? 'bg-[#760000] text-white' : 'text-[#737373] hover:bg-[#f8f7f5]'}`}
          title="Detalhes do Evento"
          aria-label="Ver detalhes do evento"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => setView('grid')}
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${view === 'grid' ? 'bg-[#760000] text-white' : 'text-[#737373] hover:bg-[#f8f7f5]'}`}
          title="Vitrine de Eventos"
          aria-label="Ver vitrine de eventos"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setView('ticket')}
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${view === 'ticket' ? 'bg-[#760000] text-white' : 'text-[#737373] hover:bg-[#f8f7f5]'}`}
          title="Ingresso Digital"
          aria-label="Ver ingresso digital"
        >
          <Ticket className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-[#e0ddd8] mx-0.5" />

        {/* Auth nav */}
        {isAuthenticated && user ? (
          <>
            <Link
              to="/my-account"
              className="h-10 px-2 flex items-center gap-1.5 rounded-md transition-colors text-[#737373] hover:bg-[#f8f7f5] focus-visible:outline-2 focus-visible:outline-[#b87824]"
              title="Minha Conta"
              aria-label="Minha Conta"
            >
              {user.role === 'staff' ? (
                <Shield className="w-4 h-4 text-[#760000]" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="text-xs max-w-[80px] truncate hidden sm:inline" style={{ fontWeight: 500 }}>
                {user.name.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-md transition-colors text-[#737373] hover:bg-[#fce8e8] hover:text-[#920000] focus-visible:outline-2 focus-visible:outline-[#b87824]"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="w-10 h-10 flex items-center justify-center rounded-md transition-colors text-[#737373] hover:bg-[#f8f7f5] focus-visible:outline-2 focus-visible:outline-[#b87824]"
            title="Login"
            aria-label="Login"
          >
            <LogIn className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* ── Logged in banner ───────────────────────────── */}
      {isAuthenticated && user && (
        <div className="fixed top-4 left-4 z-50 bg-white rounded-lg border border-[#e0ddd8] p-2 px-3 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#760000] rounded-md flex items-center justify-center text-white text-xs shrink-0" style={{ fontWeight: 700 }}>
              {user.role === 'staff' ? <Shield className="w-4 h-4" /> : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#1a1a1a] truncate" style={{ fontWeight: 600 }}>{user.name}</p>
              <p className="text-[10px] text-[#A8A8A8] font-[var(--font-mono)] truncate">
                {user.role === 'staff' ? 'Staff/Admin' : 'Cliente'} • {user.id}
              </p>
            </div>
          </div>
          {/* Quick nav links */}
          <div className="flex gap-1 mt-2 pt-2 border-t border-[#ece9e3]">
            {user.role === 'client' && (
              <>
                <Link to="/my-orders" className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] text-[#737373] hover:bg-[#f8f7f5] hover:text-[#b87824] transition-colors" style={{ fontWeight: 500 }}>
                  <ShoppingBag className="w-3 h-3" />Compras
                </Link>
                <Link to="/my-tickets" className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] text-[#737373] hover:bg-[#f8f7f5] hover:text-[#b87824] transition-colors" style={{ fontWeight: 500 }}>
                  <QrCode className="w-3 h-3" />Ingressos
                </Link>
              </>
            )}
            {user.role !== 'client' && (
              <>
                <Link to="/admin/verificacao" className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] text-[#737373] hover:bg-[#f8f7f5] hover:text-[#b87824] transition-colors" style={{ fontWeight: 500 }}>
                  <ClipboardCheck className="w-3 h-3" />Verificar
                </Link>
                <Link to="/staff/scanner" className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] text-[#737373] hover:bg-[#f8f7f5] hover:text-[#b87824] transition-colors" style={{ fontWeight: 500 }}>
                  <Scan className="w-3 h-3" />Scanner
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Views ───────────────────────────────────────── */}
      {view === 'detail' && (
        <>
          <EventDetail />
          <CartDrawer />
        </>
      )}

      {view === 'grid' && (
        <div className="min-h-screen">
          <div className="bg-[#760000] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-white font-[var(--font-heading)]" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400, lineHeight: 1.3 }}>
                Eventos CASIPass
              </h1>
              <p className="text-[#dda457] text-sm sm:text-base mt-2 max-w-lg">
                Garanta seu lugar nos melhores eventos do Centro Acadêmico de Sistemas de Informação.
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_EVENTS.map((ev) => (
                <EventCard key={ev.id} {...ev} onSelect={() => setView('detail')} />
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'ticket' && (
        <div className="min-h-screen flex flex-col">
          <div className="bg-[#760000] py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <button
                onClick={() => setView('detail')}
                className="w-10 h-10 rounded-md bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-white font-[var(--font-heading)]" style={{ fontWeight: 400 }}>
                Meu Ingresso
              </h2>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <DigitalTicket ticket={DEMO_TICKET} />
          </div>
        </div>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            borderRadius: '0.5rem',
            border: '1px solid #e0ddd8',
          },
        }}
      />
    </div>
  );
}