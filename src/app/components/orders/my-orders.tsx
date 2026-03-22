/**
 * CASIPass — Minhas Compras (My Orders)
 * Lista de pedidos do usuário com status visual e ações condicionais
 */
import { useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  FileText,
  AlertTriangle,
  Loader2,
  Cog,
  Package,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useOrdersStore } from '../../store/orders-store';
import { useAuthStore } from '../../store/auth-store';
import { toast } from 'sonner';
import type { OrderStatus } from '../../services/endpoints';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  RASCUNHO: {
    label: 'Rascunho',
    color: '#A8A8A8',
    bg: '#f5f5f5',
    border: '#e0ddd8',
    icon: FileText,
  },
  PENDENTE_VALIDACAO: {
    label: 'Aguardando Validação',
    color: '#b87824',
    bg: '#f5e6cc',
    border: '#b87824',
    icon: Clock,
  },
  APROVADO: {
    label: 'Aprovado — Pagar',
    color: '#6b705c',
    bg: '#eef2ea',
    border: '#6b705c',
    icon: CheckCircle2,
  },
  REJEITADO: {
    label: 'Rejeitado',
    color: '#920000',
    bg: '#fce8e8',
    border: '#920000',
    icon: XCircle,
  },
  PAGO: {
    label: 'Pago',
    color: '#6b705c',
    bg: '#eef2ea',
    border: '#6b705c',
    icon: CheckCircle2,
  },
  CANCELADO: {
    label: 'Cancelado',
    color: '#A8A8A8',
    bg: '#f5f5f5',
    border: '#e0ddd8',
    icon: XCircle,
  },
};

export function MyOrders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { orders, loading, fetchOrders, initiatePayment } = useOrdersStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, fetchOrders]);

  // Polling: check for status updates every 15s
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasPending = orders.some((o) => o.status === 'PENDENTE_VALIDACAO');
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, orders, fetchOrders]);

  if (!isAuthenticated) return null;

  const handlePay = async (orderId: string) => {
    try {
      await initiatePayment(orderId);
      navigate('/checkout');
    } catch {
      toast.error('Erro ao iniciar pagamento.');
    }
  };

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
                Minhas Compras
              </h1>
              <p className="text-[#dda457] text-xs font-[var(--font-mono)]">
                Acompanhe seus pedidos
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
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[#e0ddd8] mx-auto mb-4" />
            <p className="text-sm text-[#737373]">
              Você ainda não tem pedidos.
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
            {orders.map((order, idx) => {
              const config = STATUS_CONFIG[order.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white rounded-lg border border-[#e0ddd8] p-4 sm:p-5"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-sm text-[#1a1a1a] truncate" style={{ fontWeight: 500 }}>
                        {order.evento_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#737373] font-[var(--font-mono)]">
                          {order.tipo_ingresso}
                        </span>
                        <span className="w-1 h-1 bg-[#e0ddd8] rounded-full" />
                        <span className="text-xs text-[#A8A8A8] font-[var(--font-mono)]">
                          {order.evento_data}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-sm font-[var(--font-mono)] shrink-0"
                      style={{ fontWeight: 600 }}
                    >
                      R$ {order.valor.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {/* Status badge */}
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-[var(--font-mono)]"
                      style={{
                        backgroundColor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}20`,
                        fontWeight: 600,
                      }}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>

                    {/* Action */}
                    {order.status === 'APROVADO' && (
                      <button
                        onClick={() => handlePay(order.id)}
                        className="h-10 px-4 bg-[#b87824] hover:bg-[#a06820] text-white text-xs rounded-md transition-all flex items-center gap-1.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#760000]"
                        style={{ fontWeight: 600 }}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pagar Agora
                      </button>
                    )}

                    {order.status === 'PAGO' && (
                      <Link
                        to="/my-tickets"
                        className="h-10 px-4 border-2 border-[#6b705c] text-[#6b705c] text-xs rounded-md transition-all flex items-center gap-1.5 hover:bg-[#6b705c] hover:text-white focus-visible:outline-2 focus-visible:outline-[#b87824]"
                        style={{ fontWeight: 600 }}
                      >
                        Ver Ingresso
                      </Link>
                    )}

                    {order.status === 'REJEITADO' && (
                      <span className="text-xs text-[#920000] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {order.motivo_rejeicao || 'Documento inválido'}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[#A8A8A8] font-[var(--font-mono)] mt-3">
                    Pedido {order.id} · {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}