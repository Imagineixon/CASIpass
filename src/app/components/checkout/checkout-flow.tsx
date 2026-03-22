/**
 * CASIPass — Checkout Condicional (US-30)
 * ═══════════════════════════════════════════════════════════════
 * Fluxo de compra com lógica condicional:
 * - Ingresso "Calouro" ou "Veterano" → Upload de Atestado obrigatório
 * - Ingresso "Externo" → Direto para pagamento
 *
 * O fluxo guia o usuário pelas etapas:
 * 1. Resumo do pedido
 * 2. Upload de Atestado de Matrícula (se necessário)
 * 3. Tela de Sucesso de Submissão / Pagamento
 * ═══════════════════════════════════════════════════════════════
 */
import { useState, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cart-store';
import { useOrdersStore, type CheckoutStep } from '../../store/orders-store';
import { useAuthStore } from '../../store/auth-store';

/** Determina se o tipo de ingresso requer atestado de matrícula */
function requiresAtestado(tipoIngresso: string): boolean {
  const tipo = tipoIngresso.toLowerCase();
  return tipo === 'calouro' || tipo === 'veterano';
}

export function CheckoutFlow() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const {
    checkoutStep,
    setCheckoutStep,
    createOrder,
    uploadDocument,
    initiatePayment,
    currentOrderId,
    paymentData,
    loading,
    error,
    resetCheckout,
  } = useOrdersStore();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Check if any item requires atestado
  const needsAtestado = items.some((item) => requiresAtestado(item.ticket.name));

  // Start checkout
  useEffect(() => {
    if (items.length === 0 && checkoutStep === 'idle') {
      navigate('/vitrine');
    }
  }, [items, checkoutStep, navigate]);

  const handleStartCheckout = async () => {
    if (items.length === 0) return;
    const firstItem = items[0];
    try {
      await createOrder(firstItem.ticket.eventId, firstItem.ticket.id, firstItem.quantity);
      if (needsAtestado) {
        setCheckoutStep('upload');
      } else {
        // Go straight to payment
        setCheckoutStep('payment');
      }
    } catch {
      toast.error('Erro ao iniciar o pedido.');
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Envie PDF, JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 10MB.');
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleSubmitDocument = async () => {
    if (!selectedFile) {
      toast.error('Selecione o atestado de matrícula.');
      return;
    }
    await uploadDocument(selectedFile);
  };

  const handlePayNow = async () => {
    if (!currentOrderId) return;
    await initiatePayment(currentOrderId);
  };

  const handleFinish = () => {
    clearCart();
    resetCheckout();
    navigate('/my-orders');
  };

  if (!isAuthenticated || (items.length === 0 && checkoutStep === 'idle')) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header Vinho */}
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
            <button
              onClick={() => {
                resetCheckout();
                navigate(-1);
              }}
              className="w-10 h-10 rounded-md bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-white font-[var(--font-heading)]"
                style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 400 }}
              >
                Finalizar Compra
              </h1>
              <p className="text-[#dda457] text-xs font-[var(--font-mono)]">
                {checkoutStep === 'idle' && 'Resumo do pedido'}
                {checkoutStep === 'upload' && 'Envio de documentação'}
                {checkoutStep === 'uploading' && 'Enviando documento...'}
                {checkoutStep === 'submitted' && 'Aguardando validação'}
                {checkoutStep === 'payment' && 'Pagamento'}
                {checkoutStep === 'paid' && 'Pagamento confirmado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-3 relative z-10 mb-6">
        <ProgressBar step={checkoutStep} needsAtestado={needsAtestado} />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AnimatePresence mode="wait">
          {/* ── STEP: IDLE — Order Summary ──────────────────── */}
          {checkoutStep === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div
                className="bg-white rounded-lg border border-[#e0ddd8] p-5 sm:p-6"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <h2
                  className="text-[#1a1a1a] font-[var(--font-heading)] mb-4"
                  style={{ fontSize: '1.1rem', fontWeight: 400 }}
                >
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.ticket.id}
                      className="flex items-center justify-between py-3 border-b border-[#ece9e3] last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#1a1a1a]" style={{ fontWeight: 500 }}>
                          {item.ticket.eventName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#737373] font-[var(--font-mono)]">
                            {item.ticket.name} · {item.ticket.lotName}
                          </span>
                          {requiresAtestado(item.ticket.name) && (
                            <span className="text-[10px] bg-[#f5e6cc] text-[#b87824] px-1.5 py-0.5 rounded font-[var(--font-mono)]">
                              Requer atestado
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm text-[#1a1a1a] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
                          R$ {(item.ticket.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-[#A8A8A8] font-[var(--font-mono)]">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-3 border-t-2 border-[#e0ddd8]">
                  <span className="text-sm text-[#737373]">Total</span>
                  <span className="text-xl text-[#1a1a1a] font-[var(--font-mono)]" style={{ fontWeight: 700 }}>
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Atestado notice */}
                {needsAtestado && (
                  <div className="mt-4 p-3 bg-[#f5e6cc] border border-[#b87824]/20 rounded-md flex items-start gap-2.5">
                    <FileText className="w-5 h-5 text-[#b87824] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-[#1a1a1a]" style={{ fontWeight: 600 }}>
                        Atestado de Matrícula necessário
                      </p>
                      <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
                        Para ingressos do tipo <strong>Calouro</strong> ou <strong>Veterano</strong>,
                        é obrigatório o envio do Atestado de Matrícula para validação pelo Centro
                        Acadêmico antes de liberar o pagamento.
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleStartCheckout}
                  disabled={loading}
                  className="w-full h-12 bg-[#b87824] hover:bg-[#a06820] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_4px_-1px_rgba(184,120,36,0.3)] focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2 disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando pedido...
                    </>
                  ) : needsAtestado ? (
                    <>
                      <Upload className="w-5 h-5" />
                      Continuar — Enviar Atestado
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Continuar — Pagamento
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: UPLOAD — Document Upload ─────────────── */}
          {(checkoutStep === 'upload' || checkoutStep === 'uploading') && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div
                className="bg-white rounded-lg border border-[#e0ddd8] p-5 sm:p-6"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#760000]/10 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#760000]" />
                  </div>
                  <div>
                    <h2
                      className="text-[#1a1a1a] font-[var(--font-heading)]"
                      style={{ fontSize: '1.1rem', fontWeight: 400 }}
                    >
                      Atestado de Matrícula
                    </h2>
                    <p className="text-xs text-[#737373]">
                      Pedido {currentOrderId}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#4a4a4a] mb-5 leading-relaxed">
                  Envie seu comprovante de matrícula atualizado. O Centro Acadêmico
                  validará o documento antes de liberar o pagamento. Aceitamos{' '}
                  <strong>PDF, JPG, PNG ou WebP</strong> de até 10MB.
                </p>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                    ${dragActive
                      ? 'border-[#b87824] bg-[#f5e6cc]/30'
                      : selectedFile
                        ? 'border-[#6b705c] bg-[#6b705c]/5'
                        : 'border-[#e0ddd8] hover:border-[#b87824] bg-[#faf9f7]'
                    }
                  `}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />

                  {selectedFile ? (
                    <div className="space-y-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-md mx-auto border border-[#e0ddd8]"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#6b705c]/10 rounded-lg mx-auto flex items-center justify-center">
                          <FileText className="w-8 h-8 text-[#6b705c]" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-[#1a1a1a]" style={{ fontWeight: 500 }}>
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[#737373] font-[var(--font-mono)]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#920000] hover:text-[#760000]"
                      >
                        <X className="w-3 h-3" />
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-[#f5e6cc] rounded-lg mx-auto flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[#b87824]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#1a1a1a]" style={{ fontWeight: 500 }}>
                          Arraste o arquivo aqui ou clique para selecionar
                        </p>
                        <p className="text-xs text-[#A8A8A8] mt-1">
                          PDF, JPG, PNG ou WebP (máx. 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-3 text-[#920000]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs" style={{ fontWeight: 500 }}>
                      {error}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleSubmitDocument}
                  disabled={!selectedFile || checkoutStep === 'uploading'}
                  className="w-full h-12 bg-[#b87824] hover:bg-[#a06820] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_4px_-1px_rgba(184,120,36,0.3)] focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  style={{ fontWeight: 600 }}
                >
                  {checkoutStep === 'uploading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando documento...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Enviar Atestado
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP: SUBMITTED — Awaiting Validation ──────── */}
          {checkoutStep === 'submitted' && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="bg-white rounded-lg border border-[#e0ddd8] p-6 sm:p-8 text-center"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="w-20 h-20 bg-[#6b705c]/10 rounded-lg mx-auto flex items-center justify-center mb-5"
                >
                  <ShieldCheck className="w-10 h-10 text-[#6b705c]" />
                </motion.div>

                <h2
                  className="text-[#1a1a1a] font-[var(--font-heading)] mb-2"
                  style={{ fontSize: '1.25rem', fontWeight: 400 }}
                >
                  Comprovante enviado com sucesso!
                </h2>

                <p className="text-sm text-[#737373] leading-relaxed max-w-md mx-auto mb-6">
                  Seu Atestado de Matrícula foi recebido e está{' '}
                  <strong className="text-[#b87824]">aguardando validação</strong> do Centro
                  Acadêmico. Você será notificado quando o pagamento for liberado.
                </p>

                {/* Status card */}
                <div className="bg-[#faf9f7] rounded-lg border border-[#ece9e3] p-4 mb-6 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-[#b87824]/10 rounded-md flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-[#b87824]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#A8A8A8] font-[var(--font-mono)] uppercase tracking-wider">
                        Status
                      </p>
                      <p className="text-sm text-[#b87824]" style={{ fontWeight: 600 }}>
                        PENDENTE_VALIDACAO
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#A8A8A8] font-[var(--font-mono)] mt-3">
                    Pedido: {currentOrderId}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/my-orders"
                    onClick={() => {
                      clearCart();
                      resetCheckout();
                    }}
                    className="flex-1 h-12 bg-[#b87824] hover:bg-[#a06820] text-white rounded-md transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2"
                    style={{ fontWeight: 600 }}
                  >
                    Ver Minhas Compras
                  </Link>
                  <Link
                    to="/vitrine"
                    onClick={() => {
                      clearCart();
                      resetCheckout();
                    }}
                    className="flex-1 h-12 border-2 border-[#e0ddd8] text-[#737373] hover:bg-[#faf9f7] rounded-md transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#b87824]"
                    style={{ fontWeight: 500 }}
                  >
                    Voltar ao Início
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP: PAYMENT — Pix / Card ─────────────────── */}
          {checkoutStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div
                className="bg-white rounded-lg border border-[#e0ddd8] p-5 sm:p-6"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <h2
                  className="text-[#1a1a1a] font-[var(--font-heading)] mb-1"
                  style={{ fontSize: '1.1rem', fontWeight: 400 }}
                >
                  Pagamento via Pix
                </h2>
                <p className="text-sm text-[#737373] mb-5">
                  Escaneie o QR Code ou copie o código Pix para pagar.
                </p>

                {paymentData ? (
                  <div className="space-y-5">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg border border-[#e0ddd8]">
                        <QRCodeSVG
                          value={paymentData.qr_code_text || 'casipass://payment-demo'}
                          size={180}
                          level="H"
                          fgColor="#1a1a1a"
                          bgColor="#ffffff"
                        />
                      </div>
                    </div>

                    {/* Pix Code */}
                    {paymentData.qr_code_text && (
                      <div>
                        <label className="block text-xs text-[#A8A8A8] font-[var(--font-mono)] uppercase tracking-wider mb-1.5">
                          Código Pix (Copia e Cola)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={paymentData.qr_code_text}
                            className="w-full h-12 px-4 pr-20 rounded-md border border-[#e0ddd8] bg-[#faf9f7] text-[#1a1a1a] font-[var(--font-mono)] text-xs"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(paymentData.qr_code_text || '');
                              toast.success('Código Pix copiado!');
                            }}
                            className="absolute right-1 top-1 bottom-1 px-3 bg-[#b87824] text-white text-xs rounded-md hover:bg-[#a06820] transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between py-3 border-t border-[#ece9e3]">
                      <span className="text-sm text-[#737373]">Valor</span>
                      <span
                        className="text-2xl text-[#1a1a1a] font-[var(--font-mono)]"
                        style={{ fontWeight: 700 }}
                      >
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Simulate payment (demo) */}
                    <button
                      onClick={() => {
                        setCheckoutStep('paid');
                        toast.success('Pagamento confirmado!');
                      }}
                      className="w-full h-12 bg-[#6b705c] hover:bg-[#5a5f4e] active:scale-[0.98] text-white rounded-md transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#b87824] focus-visible:outline-offset-2"
                      style={{ fontWeight: 600 }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Simular Pagamento Confirmado (Demo)
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={handlePayNow}
                      disabled={loading}
                      className="h-12 px-8 bg-[#b87824] hover:bg-[#a06820] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_4px_-1px_rgba(184,120,36,0.3)] disabled:opacity-70 flex items-center justify-center gap-2 mx-auto focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2"
                      style={{ fontWeight: 600 }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Gerando pagamento...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pagar Agora — R$ {totalPrice.toFixed(2).replace('.', ',')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP: PAID — Success ───────────────────────── */}
          {checkoutStep === 'paid' && (
            <motion.div
              key="paid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div
                className="bg-white rounded-lg border border-[#e0ddd8] p-6 sm:p-8 text-center"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="w-20 h-20 bg-[#6b705c]/10 rounded-lg mx-auto flex items-center justify-center mb-5"
                >
                  <CheckCircle2 className="w-10 h-10 text-[#6b705c]" />
                </motion.div>

                <h2
                  className="text-[#1a1a1a] font-[var(--font-heading)] mb-2"
                  style={{ fontSize: '1.25rem', fontWeight: 400 }}
                >
                  Pagamento Confirmado!
                </h2>
                <p className="text-sm text-[#737373] max-w-md mx-auto mb-6">
                  Seu ingresso foi gerado e está disponível na sua Carteira Digital.
                  Apresente o QR Code na portaria do evento.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/my-tickets"
                    onClick={handleFinish}
                    className="flex-1 h-12 bg-[#b87824] hover:bg-[#a06820] text-white rounded-md transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2"
                    style={{ fontWeight: 600 }}
                  >
                    Ver Meus Ingressos
                  </Link>
                  <Link
                    to="/vitrine"
                    onClick={handleFinish}
                    className="flex-1 h-12 border-2 border-[#e0ddd8] text-[#737373] hover:bg-[#faf9f7] rounded-md transition-all flex items-center justify-center"
                    style={{ fontWeight: 500 }}
                  >
                    Voltar ao Início
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Progress Bar Component ──────────────────────────────────
function ProgressBar({
  step,
  needsAtestado,
}: {
  step: CheckoutStep;
  needsAtestado: boolean;
}) {
  const steps = needsAtestado
    ? [
        { key: 'idle', label: 'Resumo' },
        { key: 'upload', label: 'Atestado' },
        { key: 'submitted', label: 'Validação' },
        { key: 'payment', label: 'Pagamento' },
      ]
    : [
        { key: 'idle', label: 'Resumo' },
        { key: 'payment', label: 'Pagamento' },
      ];

  const stepOrder = steps.map((s) => s.key);
  const currentIdx = stepOrder.indexOf(
    step === 'uploading' ? 'upload' : step === 'paid' ? 'payment' : step
  );

  return (
    <div className="bg-white rounded-lg border border-[#e0ddd8] p-3 flex items-center gap-1">
      {steps.map((s, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx || step === 'paid';
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors shrink-0 ${
                  isDone
                    ? 'bg-[#6b705c] text-white'
                    : isActive
                      ? 'bg-[#b87824] text-white'
                      : 'bg-[#ece9e3] text-[#A8A8A8]'
                }`}
                style={{ fontWeight: 700 }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  isActive ? 'text-[#1a1a1a]' : 'text-[#A8A8A8]'
                }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  i < currentIdx ? 'bg-[#6b705c]' : 'bg-[#ece9e3]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}