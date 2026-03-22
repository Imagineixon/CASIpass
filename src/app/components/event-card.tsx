/**
 * CASIPass — EventCard (Vitrine / Grid)
 * Card de evento para a Home com estética Retrô-Futurista.
 * Bree Serif no título, Fira Code no preço, Inter no body.
 * Flexbox com botão ancorado na base. rounded-lg, sombras curtas.
 */
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  priceFrom: number;
  capacity: number;
  enrolled: number;
  status: 'Publicado' | 'Esgotado';
  onSelect?: (id: string) => void;
}

export function EventCard({
  id,
  title,
  date,
  location,
  imageUrl,
  priceFrom,
  capacity,
  enrolled,
  status,
  onSelect,
}: EventCardProps) {
  const fillPercent = Math.round((enrolled / capacity) * 100);
  const isSoldOut = status === 'Esgotado';

  return (
    <article
      className="
        group flex flex-col bg-white rounded-lg border border-[#e0ddd8]
        overflow-hidden transition-shadow
        hover:shadow-[0_4px_8px_-2px_rgba(26,26,26,0.1),0_2px_4px_-2px_rgba(26,26,26,0.06)]
        focus-within:outline-2 focus-within:outline-[#b87824] focus-within:outline-offset-2
      "
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status badge */}
        {isSoldOut ? (
          <span className="absolute top-3 right-3 bg-[#920000] text-white text-xs px-3 py-1 rounded-md font-[var(--font-mono)] tracking-wider uppercase">
            Esgotado
          </span>
        ) : (
          <span className="absolute top-3 right-3 bg-[#6b705c] text-white text-xs px-3 py-1 rounded-md font-[var(--font-mono)] tracking-wider uppercase">
            Disponível
          </span>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-md px-2.5 py-1.5">
          <p className="text-xs text-[#737373]">a partir de</p>
          <p className="text-[#1a1a1a] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
            R$ {priceFrom.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Content — flex-1 so button anchors to bottom */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title — Bree Serif */}
        <h3
          className="text-[#1a1a1a] font-[var(--font-heading)] mb-2 line-clamp-2"
          style={{ fontWeight: 400, fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', lineHeight: 1.3 }}
        >
          {title}
        </h3>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-[#737373]">
            <CalendarDays className="w-3.5 h-3.5 shrink-0 text-[#b87824]" />
            <span className="text-xs truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-[#737373]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#b87824]" />
            <span className="text-xs truncate">{location}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-auto mb-3">
          <div className="flex items-center justify-between text-xs text-[#A8A8A8] mb-1">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="font-[var(--font-mono)]">{enrolled}/{capacity}</span>
            </div>
            <span className="font-[var(--font-mono)]">{fillPercent}%</span>
          </div>
          <div className="h-1.5 bg-[#ece9e3] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fillPercent}%`,
                backgroundColor: fillPercent >= 90 ? '#a85832' : '#b87824',
              }}
            />
          </div>
        </div>

        {/* CTA Button — anchored to bottom */}
        <button
          onClick={() => onSelect?.(id)}
          disabled={isSoldOut}
          className="
            w-full py-3 rounded-md
            bg-[#b87824] hover:bg-[#dda457] active:scale-[0.98]
            text-white text-sm transition-all
            min-h-[48px]
            disabled:bg-[#e0ddd8] disabled:text-[#A8A8A8] disabled:cursor-not-allowed
            focus-visible:outline-2 focus-visible:outline-[#b87824] focus-visible:outline-offset-2
          "
          style={{ fontWeight: 500 }}
        >
          {isSoldOut ? 'Indisponível' : 'Ver Ingressos'}
        </button>
      </div>
    </article>
  );
}
