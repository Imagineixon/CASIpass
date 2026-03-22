/**
 * CASIPass — DigitalTicket (Ingresso Digital)
 * Visual de "cartão perfurado" / ticket físico de máquina analógica.
 * Fira Code para ID/token, recortes circulares simulando perfurações,
 * separador tracejado, QR Code em destaque. US-18
 */
import { QRCodeSVG } from 'qrcode.react';
import { Check, Clock } from 'lucide-react';

export interface DigitalTicketData {
  id: string;
  token: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  holderName: string;
  ticketType: string;
  status: 'Válido' | 'Utilizado';
}

interface DigitalTicketProps {
  ticket: DigitalTicketData;
}

export function DigitalTicket({ ticket }: DigitalTicketProps) {
  const isValid = ticket.status === 'Válido';

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <div className="relative">
        {/* ── Top Section (Event Info) ───────────────── */}
        <div
          className="bg-[#760000] rounded-t-lg px-5 pt-5 pb-6 text-white relative overflow-hidden"
        >
          {/* Decorative circuit lines */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <svg viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="0.5" />
              <circle cx="48" cy="48" r="28" stroke="white" strokeWidth="0.5" />
              <circle cx="48" cy="48" r="16" stroke="white" strokeWidth="0.5" />
              <line x1="48" y1="0" x2="48" y2="96" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1="48" x2="96" y2="48" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Brand header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#b87824] flex items-center justify-center">
                <span className="text-white text-xs font-[var(--font-mono)]" style={{ fontWeight: 700 }}>
                  CP
                </span>
              </div>
              <span className="text-sm text-white/80 font-[var(--font-mono)] tracking-wider uppercase">
                CASIPass
              </span>
            </div>

            {/* Status badge */}
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs
                font-[var(--font-mono)] tracking-wide uppercase
                ${isValid
                  ? 'bg-[#6b705c] text-white'
                  : 'bg-[#a85832] text-white'
                }
              `}
            >
              {isValid ? (
                <Check className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {ticket.status}
            </span>
          </div>

          {/* Event title — Bree Serif */}
          <h3
            className="font-[var(--font-heading)] text-white mb-1 relative z-10"
            style={{ fontSize: 'clamp(1.1rem, 4vw, 1.375rem)', lineHeight: 1.3, fontWeight: 400 }}
          >
            {ticket.eventName}
          </h3>

          {/* Event meta */}
          <div className="flex items-center gap-3 text-white/60 text-xs font-[var(--font-mono)] relative z-10">
            <span>{ticket.eventDate}</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>{ticket.eventTime}</span>
          </div>
          <p className="text-xs text-white/50 mt-0.5 font-[var(--font-body)] relative z-10">
            {ticket.location}
          </p>
        </div>

        {/* ── Punch-hole separator ───────────────── */}
        <div className="relative h-0 z-20">
          {/* Left notch */}
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#f8f7f5]" />
          {/* Right notch */}
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#f8f7f5]" />
          {/* Dashed line */}
          <div className="mx-6 border-t-2 border-dashed border-[#e0ddd8]" />
        </div>

        {/* ── Bottom Section (QR Code + Details) ──── */}
        <div className="bg-white rounded-b-lg px-5 pt-6 pb-5 border border-t-0 border-[#e0ddd8]">
          {/* Holder info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)]">
                Titular
              </p>
              <p className="text-sm text-[#1a1a1a]" style={{ fontWeight: 500 }}>
                {ticket.holderName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#A8A8A8] uppercase tracking-wider font-[var(--font-mono)]">
                Tipo
              </p>
              <p className="text-sm text-[#1a1a1a]" style={{ fontWeight: 500 }}>
                {ticket.ticketType}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center my-4">
            <div className="p-3 bg-white rounded-lg border border-[#e0ddd8]">
              <QRCodeSVG
                value={`casipass://${ticket.token}`}
                size={160}
                level="H"
                fgColor="#1a1a1a"
                bgColor="#ffffff"
              />
            </div>
          </div>

          {/* Token ID — Fira Code monospace, prominence */}
          <div className="text-center mt-3">
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

          {/* Decorative bottom perforations */}
          <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-dashed border-[#ece9e3]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#ece9e3]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
