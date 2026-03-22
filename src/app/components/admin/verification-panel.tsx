/**
 * CASIPass — Admin: Central de Verificação de Atestados
 * Dashboard para aprovar/rejeitar documentos de matrícula
 */
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Loader2,
  Terminal,
  Users,
  X,
  Cog,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { adminService, type PendingVerification } from '../../services/endpoints';
import { useAuthStore } from '../../store/auth-store';
import { toast } from 'sonner';

export function VerificationPanel() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<PendingVerification | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'client') {
      navigate('/staff-login');
      return;
    }
    loadPending();
  }, [isAuthenticated, user, navigate]);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await adminService.listPending();
      setItems(data);
    } catch {
      toast.error('Erro ao carregar pendências.');
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'APROVADO' | 'REJEITADO') => {
    setActionLoading(id);
    try {
      await adminService.updateVerification(id, action);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success(
        action === 'APROVADO' ? 'Documento aprovado! Pagamento liberado.' : 'Documento rejeitado.'
      );
    } catch {
      toast.error('Erro ao processar ação.');
    }
    setActionLoading(null);
  };

  if (!isAuthenticated || user?.role === 'client') return null;

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-[#2a2a2a] border-b border-[#3a3a3a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/vitrine"
                className="w-10 h-10 rounded-md bg-[#760000]/20 border border-[#760000]/30 text-[#b87824] flex items-center justify-center hover:bg-[#760000]/30 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#b87824]" />
                  <h1
                    className="text-[#b87824] font-[var(--font-mono)]"
                    style={{ fontSize: '1.1rem', fontWeight: 600 }}
                  >
                    Central de Verificação
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Terminal className="w-3 h-3 text-[#6b705c]" />
                  <span className="text-xs text-[#737373] font-[var(--font-mono)]">
                    admin.verificacao &gt; pendentes: {items.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#737373]">
              <Users className="w-4 h-4" />
              <span className="text-xs font-[var(--font-mono)]">
                {items.length} pendente{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Cog className="w-8 h-8 text-[#b87824] animate-[spin_3s_linear_infinite]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className="w-16 h-16 text-[#6b705c]/30 mx-auto mb-4" />
            <p className="text-sm text-[#737373] font-[var(--font-mono)]">
              Nenhum documento pendente de verificação.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-[#e0e0e0]" style={{ fontWeight: 500 }}>
                        {item.usuario_nome}
                      </span>
                      <span className="text-xs bg-[#760000]/20 text-[#b87824] px-2 py-0.5 rounded font-[var(--font-mono)]">
                        {item.tipo_ingresso}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] font-[var(--font-mono)]">
                      {item.usuario_email}
                    </p>
                    <p className="text-xs text-[#555] font-[var(--font-mono)] mt-0.5">
                      CPF: {item.usuario_cpf} · Evento: {item.evento_nome}
                    </p>
                    <p className="text-[10px] text-[#555] font-[var(--font-mono)] mt-1">
                      Pedido: {item.pedido_id} · {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setViewingDoc(item)}
                      className="h-10 px-3 bg-[#4a6d88]/20 border border-[#4a6d88]/30 text-[#4a6d88] text-xs rounded-md hover:bg-[#4a6d88]/30 transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#b87824]"
                      style={{ fontWeight: 500 }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Doc
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'APROVADO')}
                      disabled={actionLoading === item.id}
                      className="h-10 px-4 bg-[#6b705c] hover:bg-[#5a5f4e] text-white text-xs rounded-md transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#b87824]"
                      style={{ fontWeight: 600 }}
                    >
                      {actionLoading === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'REJEITADO')}
                      disabled={actionLoading === item.id}
                      className="h-10 px-4 bg-[#920000] hover:bg-[#760000] text-white text-xs rounded-md transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#b87824]"
                      style={{ fontWeight: 600 }}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Document Viewer Modal ────────────────────────── */}
      <AnimatePresence>
        {viewingDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setViewingDoc(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 sm:inset-12 lg:inset-24 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] z-50 flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#3a3a3a]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#b87824]" />
                  <span className="text-sm text-[#e0e0e0] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
                    {viewingDoc.usuario_nome} — Atestado
                  </span>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-[#737373] hover:text-white hover:bg-[#3a3a3a] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Modal body (demo placeholder) */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="w-20 h-20 text-[#3a3a3a] mx-auto mb-4" />
                  <p className="text-sm text-[#737373] font-[var(--font-mono)]">
                    Documento: {viewingDoc.documento_url}
                  </p>
                  <p className="text-xs text-[#555] font-[var(--font-mono)] mt-1">
                    (Em produção, o PDF/imagem do atestado será exibido aqui)
                  </p>
                </div>
              </div>
              {/* Modal actions */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#3a3a3a]">
                <button
                  onClick={() => {
                    handleAction(viewingDoc.id, 'APROVADO');
                    setViewingDoc(null);
                  }}
                  className="h-10 px-6 bg-[#6b705c] hover:bg-[#5a5f4e] text-white text-sm rounded-md transition-all flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#b87824]"
                  style={{ fontWeight: 600 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprovar
                </button>
                <button
                  onClick={() => {
                    handleAction(viewingDoc.id, 'REJEITADO');
                    setViewingDoc(null);
                  }}
                  className="h-10 px-6 bg-[#920000] hover:bg-[#760000] text-white text-sm rounded-md transition-all flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#b87824]"
                  style={{ fontWeight: 600 }}
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
