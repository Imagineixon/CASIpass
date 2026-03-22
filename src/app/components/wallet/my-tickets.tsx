/**
 * CASIPass — Carteira Digital (Meus Ingressos)
 * Exibe ingressos gerados com QR Code oficial do backend
 */
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Ticket,
  Loader2,
  Check,
  Clock,
  QrCode,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { ticketsService, type TicketEntry } from '../../services/endpoints';
import { useAuthStore } from '../../store/auth-store';

export function MyTickets() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [tickets, setTickets] = useState<TicketEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTickets();
  }, [isAuthenticated, navigate]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketsService.list();
      setTickets(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header */}
      <div className="bg-[#760000] relative overflow-hidden">
        <svg
          className="absolute -right-8 -top-8 w-36 h-36 text-white opacity-[0.05]"
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/vitrine"
              className="w-10 h-10 rounded-md bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1
                className="text-white font-[var(--font-heading)]"
                style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 400 }}
              >
                Meus Ingressos
              </h1>
              <p className="text-[#dda457] text-xs font-[var(--font-mono)]">
                Carteira Digital CASIPass
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#b87824] animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 text-[#e0ddd8] mx-auto mb-4" />
            <p className="text-sm text-[#737373]">
              Você ainda não tem ingressos.
            </p>
            <Link
              to="/vitrine"
              className="inline-flex items-center gap-2 mt-4 text-sm text-[#b87824] hover:text-[#a06820]"
              style={{ fontWeight: 500 }}
            >
              Explorar eventos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, idx) => {
              const isValid = ticket.status === 'VALIDO';
              const isExpanded = expanded === ticket.uuid;

              return (
                <motion.div
                  key={ticket.uuid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {/* Card */}
                  <div
                    className="bg-white rounded-lg border border-[#e0ddd8] overflow-hidden cursor-pointer"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onClick={() => setExpanded(isExpanded ? null : ticket.uuid)}
                  >
                    {/* Top bar */}
                    <div className="bg-[#760000] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#dda457]" />
                        <span className="text-white text-sm" style={{ fontWeight: 500 }}>
                          {ticket.evento_nome}
                        </span>
                      </div>
                      <span
                        className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]
                          font-[var(--font-mono)] uppercase tracking-wider
                          ${isValid ? 'bg-[#6b705c] text-white' : 'bg-[#a85832] text-white'}
                        `}
                      >
                        {isValid ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {ticket.status}
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#737373] font-[var(--font-mono)]">
                          <span>{ticket.evento_data}</span>
                          <span className="w-1 h-1 bg-[#e0ddd8] rounded-full" />
                          <span>{ticket.evento_hora}</span>
                        </div>
                        <p className="text-xs text-[#A8A8A8] mt-0.5">{ticket.local}</p>
                      </div>
                      <span className="text-xs text-[#b87824] bg-[#f5e6cc] px-2 py-1 rounded font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
                        {ticket.tipo}
                      </span>
                    </div>

                    {/* Expanded: QR Code */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-[#ece9e3] px-4 py-5 overflow-hidden"
                      >
                        {/* Punch holes */}
                        <div className="relative h-0 -mt-5 mb-5">
                          <div className="absolute -left-4 -top-3 w-6 h-6 rounded-full bg-[#f8f7f5]" />
                          <div className="absolute -right-4 -top-3 w-6 h-6 rounded-full bg-[#f8f7f5]" />
                        </div>

                        <div className="flex flex-col items-center">
                          {/* Titular */}
                          <p className="text-[10px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)] mb-0.5">
                            Titular
                          </p>
                          <p className="text-sm text-[#1a1a1a] mb-4" style={{ fontWeight: 500 }}>
                            {ticket.titular}
                          </p>

                          {/* QR Code */}
                          <div className="p-3 bg-white rounded-lg border border-[#e0ddd8]">
                            <QRCodeSVG
                              value={`casipass://${ticket.token}`}
                              size={180}
                              level="H"
                              fgColor="#1a1a1a"
                              bgColor="#ffffff"
                            />
                          </div>

                          {/* Token */}
                          <div className="mt-4 text-center">
                            <p className="text-[10px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)] mb-0.5">
                              Token ID
                            </p>
                            <p
                              className="text-sm text-[#1a1a1a] font-[var(--font-mono)] tracking-[0.12em] select-all"
                              style={{ fontWeight: 600 }}
                            >
                              {ticket.token}
                            </p>
                          </div>

                          {/* UUID */}
                          <p className="text-[10px] text-[#A8A8A8] font-[var(--font-mono)] mt-3">
                            UUID: {ticket.uuid}
                          </p>

                          {/* Decorative perforations */}
                          <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-dashed border-[#ece9e3]">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-[#ece9e3]" />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
