/**
 * CASIPass — Staff: Scanner de Portaria (html5-qrcode)
 * ═══════════════════════════════════════════════════════════════
 * Integração robusta da biblioteca vanilla html5-qrcode dentro do
 * ciclo de vida do React, com proteção contra:
 *
 *   1. React Strict Mode (double mount/unmount)
 *   2. DOM não renderizado antes de injetar <video>
 *   3. Vazamento de câmera no unmount (iOS/Android)
 *   4. Flood de leituras duplicadas (debounce 5s)
 *   5. Erros de permissão / HTTPS (UX amigável)
 *
 * Padrão: useRef<boolean> como guard de instância única.
 * ═══════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Shield,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  CameraOff,
  Keyboard,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertTriangle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { scannerService, type ScanResult } from '../../services/endpoints';
import { useAuthStore } from '../../store/auth-store';
import { Html5Qrcode } from 'html5-qrcode';

// ── Constants ──────────────────────────────────────────────────
type ScanState = 'idle' | 'scanning' | 'result';
type InputMode = 'camera' | 'manual';

const READER_ELEMENT_ID = 'reader';
const DEBOUNCE_COOLDOWN_MS = 5000;
const RESULT_DISPLAY_MS = 3000;
const DOM_READY_DELAY_MS = 100;

export function StaffScanner() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // ── UI state ─────────────────────────────────────────────────
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [inputUuid, setInputUuid] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [scanCount, setScanCount] = useState(0);

  // Camera permission / error UX states
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ── Refs ─────────────────────────────────────────────────────
  /**
   * REGRA 1: Guard de instância única.
   * Previne que o React Strict Mode (dev) instancie o scanner
   * duas vezes ao montar → desmontar → remontar o componente.
   */
  const isScannerInitialized = useRef<boolean>(false);
  const html5QrRef = useRef<Html5Qrcode | null>(null);

  /** Bloqueia leitura duplicada do mesmo UUID dentro da janela de cooldown */
  const lastScannedRef = useRef<string>('');
  const isProcessingScanRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const domDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'client') {
      navigate('/staff-login');
    }
  }, [isAuthenticated, user, navigate]);

  // ── Cleanup helper: stop + clear (safe, idempotent) ──────────
  const destroyScanner = useCallback(async () => {
    try {
      const scanner = html5QrRef.current;
      if (scanner) {
        // .stop() releases the camera stream
        try {
          await scanner.stop();
        } catch {
          // May already be stopped — safe to ignore
        }
        // .clear() removes injected DOM elements (<video>, <canvas>)
        try {
          scanner.clear();
        } catch {
          // Element may already be gone — safe to ignore
        }
      }
    } catch {
      // Final safety net
    } finally {
      html5QrRef.current = null;
      isScannerInitialized.current = false;
    }
  }, []);

  // ── Core scan handler ────────────────────────────────────────
  const handleScanResult = useCallback(
    async (uuid: string) => {
      if (!uuid.trim()) return;

      const cleanUuid = uuid.trim();

      // REGRA 5 — Debounce: block same UUID within cooldown
      if (cleanUuid === lastScannedRef.current) return;
      if (isProcessingScanRef.current) return;

      isProcessingScanRef.current = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      lastScannedRef.current = cleanUuid;

      setScanState('scanning');

      // Pause the scanner while we process (prevents flood)
      try {
        const scanner = html5QrRef.current;
        if (scanner) {
          try {
            scanner.pause(true);
          } catch {
            // pause may not be available in all states
          }
        }
      } catch {
        // non-critical
      }

      try {
        const scanResult = await scannerService.validate(cleanUuid);

        setResult(scanResult);
        setScanState('result');
        setScanCount((c) => c + 1);

        // Auto-reset after result display
        resultTimerRef.current = setTimeout(() => {
          setScanState('idle');
          setResult(null);
          setInputUuid('');
          isProcessingScanRef.current = false;

          // Resume scanning after result dismissal
          try {
            const scanner = html5QrRef.current;
            if (scanner) {
              try {
                scanner.resume();
              } catch {
                // resume may fail if scanner was stopped
              }
            }
          } catch {
            // non-critical
          }
        }, RESULT_DISPLAY_MS);

        // Release debounce lock after cooldown
        debounceTimerRef.current = setTimeout(() => {
          lastScannedRef.current = '';
        }, DEBOUNCE_COOLDOWN_MS);
      } catch {
        setResult({
          valido: false,
          mensagem: 'Erro de conexão com o servidor. Verifique sua rede.',
        });
        setScanState('result');

        resultTimerRef.current = setTimeout(() => {
          setScanState('idle');
          setResult(null);
          isProcessingScanRef.current = false;

          try {
            html5QrRef.current?.resume();
          } catch {
            // non-critical
          }
        }, RESULT_DISPLAY_MS);

        debounceTimerRef.current = setTimeout(() => {
          lastScannedRef.current = '';
        }, DEBOUNCE_COOLDOWN_MS);
      }
    },
    []
  );

  // ── Start camera (with DOM-ready guard) ──────────────────────
  const startCamera = useCallback(async () => {
    // REGRA 1: Prevent double initialization (React Strict Mode)
    if (isScannerInitialized.current) return;
    isScannerInitialized.current = true;

    setIsRequestingCamera(true);
    setCameraError(null);
    setIsCameraActive(false);

    /**
     * REGRA 2: Aguarda 100ms para garantir que o React já
     * renderizou a <div id="reader"> no DOM antes da
     * html5-qrcode tentar injetar o <video> dentro dela.
     */
    await new Promise<void>((resolve) => {
      domDelayTimerRef.current = setTimeout(resolve, DOM_READY_DELAY_MS);
    });

    // Verify the DOM element actually exists
    const readerEl = document.getElementById(READER_ELEMENT_ID);
    if (!readerEl) {
      setIsRequestingCamera(false);
      setCameraError('Elemento do scanner não encontrado no DOM.');
      isScannerInitialized.current = false;
      return;
    }

    try {
      const scanner = new Html5Qrcode(READER_ELEMENT_ID);
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // onScanSuccess
          handleScanResult(decodedText);
        },
        () => {
          // onScanFailure — intentionally empty (continuous scanning)
        }
      );

      setIsRequestingCamera(false);
      setIsCameraActive(true);
    } catch (err) {
      setIsRequestingCamera(false);
      isScannerInitialized.current = false;
      html5QrRef.current = null;

      // REGRA 3: Error messages amigáveis para cada cenário
      const msg = err instanceof Error ? err.message : String(err);

      if (
        msg.includes('NotAllowed') ||
        msg.includes('Permission') ||
        msg.includes('denied')
      ) {
        setCameraError(
          'Acesso à câmera negado. Verifique as permissões do seu navegador e certifique-se de estar usando HTTPS ou localhost.'
        );
      } else if (msg.includes('NotFound') || msg.includes('Requested device not found')) {
        setCameraError(
          'Nenhuma câmera encontrada neste dispositivo. Tente usar o modo manual.'
        );
      } else if (msg.includes('NotReadable') || msg.includes('Could not start')) {
        setCameraError(
          'A câmera está sendo usada por outro aplicativo. Feche outros apps e tente novamente.'
        );
      } else if (msg.includes('insecure') || msg.includes('secure context')) {
        setCameraError(
          'Acesso à câmera negado ou conexão não segura (requer HTTPS/localhost). Verifique as permissões do seu navegador.'
        );
      } else {
        setCameraError(
          `Acesso à câmera negado ou conexão não segura (requer HTTPS/localhost). Verifique as permissões do seu navegador. [${msg}]`
        );
      }
    }
  }, [handleScanResult]);

  // ── Main lifecycle effect: camera mode ───────────────────────
  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    }

    /**
     * REGRA 4: Cleanup perfeito no unmount.
     * Chamado quando:
     *   a) O componente desmonta (navegação)
     *   b) O usuário troca para modo manual
     *   c) React Strict Mode desmonta na primeira vez (dev)
     */
    return () => {
      // Clear all pending timers
      if (domDelayTimerRef.current) clearTimeout(domDelayTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

      // Destroy scanner instance (stop + clear)
      destroyScanner();
      setIsCameraActive(false);
      setIsRequestingCamera(false);
    };
  }, [inputMode, startCamera, destroyScanner]);

  // ── Retry camera ─────────────────────────────────────────────
  const retryCamera = useCallback(async () => {
    await destroyScanner();
    setCameraError(null);
    // Small delay to let cleanup finish
    setTimeout(() => {
      startCamera();
    }, 200);
  }, [destroyScanner, startCamera]);

  // ── Auth guard render ────────────────────────────────────────
  if (!isAuthenticated || user?.role === 'client') return null;

  // ═════════════════════════════════════════════════════════════
  // FULL-SCREEN RESULT FLASH
  // ═════════════════════════════════════════════════════════════
  if (scanState === 'result' && result) {
    const isSuccess = result.valido;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 ${
          isSuccess ? 'bg-[#2d5016]' : 'bg-[#760000]'
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-32 h-32 text-white mb-6" strokeWidth={1.5} />
          ) : (
            <XCircle className="w-32 h-32 text-white mb-6" strokeWidth={1.5} />
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white font-[var(--font-heading)] text-center mb-2"
          style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)', fontWeight: 400 }}
        >
          {isSuccess ? 'ENTRADA LIBERADA' : 'ACESSO NEGADO'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 text-center font-[var(--font-mono)] text-sm max-w-md"
        >
          {result.mensagem}
        </motion.p>

        {result.ingresso && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-5 text-center border border-white/20 max-w-sm w-full"
          >
            <p className="text-white text-sm" style={{ fontWeight: 600 }}>
              {result.ingresso.titular}
            </p>
            <p className="text-white/60 text-xs font-[var(--font-mono)] mt-1">
              {result.ingresso.tipo} · {result.ingresso.evento_nome}
            </p>
            <p className="text-white/40 text-[10px] font-[var(--font-mono)] mt-2 tracking-wider">
              TOKEN: {result.ingresso.token}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 text-white/40 text-xs font-[var(--font-mono)]"
        >
          Retornando automaticamente em 3s...
        </motion.div>
      </motion.div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // SCANNER INTERFACE
  // ═════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <div className="bg-[#2a2a2a] border-b border-[#3a3a3a]">
        <div className="max-w-lg mx-auto px-4 py-4">
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
                  <Scan className="w-4 h-4 text-[#b87824]" />
                  <h1
                    className="text-[#b87824] font-[var(--font-mono)]"
                    style={{ fontSize: '1rem', fontWeight: 600 }}
                  >
                    Scanner de Portaria
                  </h1>
                </div>
                <p className="text-xs text-[#6b705c] font-[var(--font-mono)]">
                  staff.scanner &gt;{' '}
                  {isCameraActive ? (
                    <span className="text-[#6b705c]">câmera ativa</span>
                  ) : isRequestingCamera ? (
                    'solicitando câmera...'
                  ) : inputMode === 'manual' ? (
                    'modo manual'
                  ) : (
                    'pronto'
                  )}
                </p>
              </div>
            </div>

            {/* Scan counter badge */}
            {scanCount > 0 && (
              <div className="flex items-center gap-1.5 bg-[#6b705c]/20 border border-[#6b705c]/30 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-[#6b705c]" />
                <span
                  className="text-[10px] text-[#6b705c] font-[var(--font-mono)]"
                  style={{ fontWeight: 600 }}
                >
                  {scanCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Toggle Tabs */}
      <div className="bg-[#222] border-b border-[#3a3a3a]">
        <div className="max-w-lg mx-auto px-4 flex">
          <button
            onClick={() => setInputMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-[var(--font-mono)] uppercase tracking-wider transition-colors border-b-2 ${
              inputMode === 'camera'
                ? 'text-[#b87824] border-[#b87824]'
                : 'text-[#555] border-transparent hover:text-[#888]'
            }`}
          >
            <Camera className="w-4 h-4" />
            Câmera
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-[var(--font-mono)] uppercase tracking-wider transition-colors border-b-2 ${
              inputMode === 'manual'
                ? 'text-[#b87824] border-[#b87824]'
                : 'text-[#555] border-transparent hover:text-[#888]'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>
      </div>

      {/* Scanner body */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {inputMode === 'camera' ? (
            <motion.div
              key="camera-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center gap-4"
            >
              {/* ── Camera viewfinder container ─────────────────── */}
              <div className="w-full aspect-square max-w-[320px] bg-[#111] rounded-lg relative overflow-hidden border border-[#3a3a3a]">
                {/*
                 * REGRA 2: A div#reader DEVE estar sempre renderizada
                 * no DOM para que o useEffect consiga encontrá-la.
                 * O html5-qrcode injeta <video> e <canvas> dentro dela.
                 */}
                <div
                  id={READER_ELEMENT_ID}
                  className="w-full h-full overflow-hidden rounded-lg [&>video]:object-cover [&>video]:w-full [&>video]:h-full [&_img]:hidden"
                  style={{ minHeight: '280px' }}
                />

                {/* Scanning laser animation */}
                {isCameraActive && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-0.5 bg-[#b87824] shadow-[0_0_8px_rgba(184,120,36,0.6)] z-10 pointer-events-none"
                    animate={{ y: [0, 300, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                {/* Corner guides overlay */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#b87824] rounded-tl-md" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#b87824] rounded-tr-md" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#b87824] rounded-bl-md" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#b87824] rounded-br-md" />
                </div>

                {/* State overlay: requesting camera permission */}
                {isRequestingCamera && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]/95 z-20">
                    <Loader2 className="w-10 h-10 text-[#b87824] animate-spin mb-3" />
                    <p className="text-xs text-[#888] font-[var(--font-mono)] text-center px-4">
                      Solicitando acesso à câmera...
                    </p>
                    <p className="text-[10px] text-[#555] font-[var(--font-mono)] text-center px-6 mt-2">
                      Permita o acesso no popup do navegador
                    </p>
                  </div>
                )}

                {/* State overlay: camera not active and not requesting */}
                {!isCameraActive && !isRequestingCamera && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-20">
                    <CameraOff className="w-12 h-12 text-[#3a3a3a] mb-3" />
                    <p className="text-xs text-[#555] font-[var(--font-mono)] text-center px-6">
                      Câmera desligada
                    </p>
                  </div>
                )}

                {/* REGRA 3: State overlay — camera error (permission denied, etc.) */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-20 px-5">
                    <div className="w-14 h-14 rounded-full bg-[#a85832]/20 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-7 h-7 text-[#a85832]" />
                    </div>
                    <p className="text-xs text-[#a85832] font-[var(--font-mono)] text-center leading-relaxed max-w-[260px]">
                      {cameraError}
                    </p>
                    <button
                      onClick={retryCamera}
                      className="mt-5 h-10 px-5 bg-[#b87824] hover:bg-[#a06820] text-white text-xs rounded-md transition-colors flex items-center gap-2 font-[var(--font-mono)] active:scale-[0.98]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Tentar novamente
                    </button>
                    <button
                      onClick={() => setInputMode('manual')}
                      className="mt-2 h-10 px-5 bg-transparent border border-[#3a3a3a] hover:border-[#555] text-[#888] text-xs rounded-md transition-colors flex items-center gap-2 font-[var(--font-mono)]"
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      Usar modo manual
                    </button>
                  </div>
                )}

                {/* Scanning indicator */}
                {scanState === 'scanning' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
                    <div className="bg-[#2a2a2a] rounded-lg px-6 py-4 flex items-center gap-3 border border-[#3a3a3a]">
                      <Loader2 className="w-5 h-5 text-[#b87824] animate-spin" />
                      <span className="text-sm text-[#e0e0e0] font-[var(--font-mono)]">
                        Validando...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status hint */}
              <div className="flex items-center gap-1.5 text-[#555]">
                {isCameraActive ? (
                  <>
                    <Wifi className="w-3 h-3 text-[#6b705c]" />
                    <span className="text-[10px] font-[var(--font-mono)] text-[#6b705c]">
                      Aponte a câmera para o QR Code do ingresso
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span className="text-[10px] font-[var(--font-mono)]">
                      Câmera inativa
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── Manual input mode ──────────────────────────────── */
            <motion.div
              key="manual-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#555]">
                  <Keyboard className="w-4 h-4" />
                  <span className="text-xs font-[var(--font-mono)] uppercase tracking-wider">
                    Entrada Manual de UUID
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUuid}
                    onChange={(e) => setInputUuid(e.target.value)}
                    placeholder="Cole ou digite o UUID do ingresso"
                    className="flex-1 h-12 px-4 rounded-md border border-[#3a3a3a] bg-[#1e1e1e] text-[#e0e0e0] placeholder:text-[#555] font-[var(--font-mono)] text-sm focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleScanResult(inputUuid);
                    }}
                  />
                  <button
                    onClick={() => handleScanResult(inputUuid)}
                    disabled={scanState === 'scanning' || !inputUuid.trim()}
                    className="h-12 px-5 bg-[#b87824] hover:bg-[#a06820] text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#760000]"
                    style={{ fontWeight: 600 }}
                  >
                    {scanState === 'scanning' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Scan className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick-test buttons (demo) */}
              <div className="space-y-2 bg-[#222] rounded-lg p-4 border border-[#3a3a3a]">
                <p className="text-[10px] text-[#555] font-[var(--font-mono)] uppercase tracking-wider">
                  Testes rápidos (modo demo):
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setInputUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479');
                      handleScanResult('f47ac10b-58cc-4372-a567-0e02b2c3d479');
                    }}
                    className="text-xs px-3 py-2 bg-[#6b705c]/20 text-[#6b705c] rounded-md font-[var(--font-mono)] hover:bg-[#6b705c]/30 transition-colors min-h-[40px] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Ingresso Válido
                  </button>
                  <button
                    onClick={() => {
                      setInputUuid('00000000-0000-0000-0000-000000000000');
                      handleScanResult('00000000-0000-0000-0000-000000000000');
                    }}
                    className="text-xs px-3 py-2 bg-[#920000]/20 text-[#920000] rounded-md font-[var(--font-mono)] hover:bg-[#920000]/30 transition-colors min-h-[40px] flex items-center gap-1.5"
                  >
                    <XCircle className="w-3 h-3" />
                    Ingresso Inválido
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-[#2a2a2a] border-t border-[#3a3a3a] p-3 text-center">
        <div className="flex items-center justify-center gap-2 text-[#555]">
          <Shield className="w-3 h-3" />
          <span className="text-[10px] font-[var(--font-mono)]">
            CASIPass v2.0 — Scanner Operacional · html5-qrcode
          </span>
        </div>
      </div>
    </div>
  );
}
