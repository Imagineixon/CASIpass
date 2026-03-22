/**
 * CASIPass — Tela de Login Staff / Admin (US-05)
 *
 * CREDENCIAIS DE TESTE:
 *   E-mail: admin@casi.ufra.br
 *   Senha:  Staff@2026
 */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Cog, Shield, ArrowLeft, Terminal, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/auth-store';
import { toast } from 'sonner';

export function StaffLoginScreen() {
  const navigate = useNavigate();
  const { loginStaff, isAuthenticated, user } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'staff') navigate('/vitrine');
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const result = loginStaff(email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Acesso autorizado.', {
        description: 'Bem-vindo ao painel operacional CASIPass.',
        style: { background: '#2a2a2a', color: '#e0e0e0', border: '1px solid #3a3a3a' },
      });
      navigate('/vitrine');
    } else {
      setError(result.error || 'Erro desconhecido.');
    }
  };

  if (isAuthenticated && user?.role === 'staff') return null;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background circuit lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-0 right-0 h-px bg-[#760000]/10" />
        <div className="absolute top-[40%] left-0 right-0 h-px bg-[#760000]/10" />
        <div className="absolute top-[60%] left-0 right-0 h-px bg-[#760000]/10" />
        <div className="absolute top-[80%] left-0 right-0 h-px bg-[#760000]/10" />
        <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[#760000]/10" />
        <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#760000]/10" />
        <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[#760000]/10" />

        <svg className="absolute -top-12 -right-12 w-56 h-56 text-[#b87824] opacity-[0.04]" viewBox="0 0 48 48" fill="none">
          <path d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z" stroke="currentColor" strokeWidth="1"/>
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <svg className="absolute -bottom-20 -left-20 w-64 h-64 text-[#760000] opacity-[0.04]" viewBox="0 0 48 48" fill="none">
          <path d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z" stroke="currentColor" strokeWidth="1"/>
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>

        <div className="absolute top-[20%] left-[25%] w-2 h-2 rounded-full bg-[#b87824]/20" />
        <div className="absolute top-[40%] left-[50%] w-2 h-2 rounded-full bg-[#760000]/30" />
        <div className="absolute top-[60%] left-[75%] w-2 h-2 rounded-full bg-[#b87824]/20" />
        <div className="absolute top-[80%] left-[25%] w-2 h-2 rounded-full bg-[#760000]/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#A8A8A8] transition-colors mb-4 focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login padrão
        </Link>

        <div
          className="bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] p-6 sm:p-8"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#760000]/20 rounded-lg mb-4 border border-[#760000]/30">
              <Shield className="w-7 h-7 text-[#b87824]" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Cog className="w-4 h-4 text-[#b87824] animate-[spin_8s_linear_infinite]" />
              <h1 className="text-[#b87824] font-[var(--font-mono)]" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                CASIPass Operação
              </h1>
              <Cog className="w-4 h-4 text-[#b87824] animate-[spin_8s_linear_infinite_reverse]" />
            </div>
            <p className="text-sm text-[#737373] font-[var(--font-mono)]">Acesso restrito à equipe</p>
            <div className="flex items-center gap-2 mt-4 text-[#6b705c] font-[var(--font-mono)] text-xs">
              <Terminal className="w-3.5 h-3.5" />
              <span className="opacity-60">sys.auth.staff &gt; awaiting_credentials</span>
              <span className="w-1.5 h-4 bg-[#6b705c] animate-pulse" />
            </div>
          </div>

          {/* Test credentials hint */}
          <div className="bg-[#1e1e1e] border border-[#6b705c]/30 rounded-md p-3 mb-5">
            <p className="text-xs text-[#6b705c] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>&gt; credenciais_teste:</p>
            <p className="text-xs text-[#6b705c] font-[var(--font-mono)] mt-1">email: admin@casi.ufra.br</p>
            <p className="text-xs text-[#6b705c] font-[var(--font-mono)]">senha: Staff@2026</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-[#920000]/15 border border-[#920000]/30 rounded-md p-3 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-[#ff6b6b] shrink-0" />
              <span className="text-xs text-[#ff6b6b] font-[var(--font-mono)]" style={{ fontWeight: 500 }}>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="staff-email" className="block text-xs text-[#737373] mb-1.5 font-[var(--font-mono)] uppercase tracking-wider">E-mail</label>
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="operador@casi.ufra.br"
                className="w-full h-12 px-4 rounded-md border border-[#3a3a3a] bg-[#1e1e1e] text-[#e0e0e0] placeholder:text-[#555] transition-colors focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824] font-[var(--font-mono)]"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="staff-password" className="block text-xs text-[#737373] mb-1.5 font-[var(--font-mono)] uppercase tracking-wider">Senha</label>
              <div className="relative">
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-md border border-[#3a3a3a] bg-[#1e1e1e] text-[#e0e0e0] placeholder:text-[#555] transition-colors focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824] font-[var(--font-mono)]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-[#555] hover:text-[#A8A8A8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-md"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#760000] hover:bg-[#920000] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_8px_-2px_rgba(118,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-[#b87824] focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ fontWeight: 600 }}
            >
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Autenticando...</>) : 'Acessar Painel'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#6b705c] shrink-0 mt-0.5" />
              <p className="text-xs text-[#555] leading-relaxed font-[var(--font-mono)]">
                Ambiente protegido. Todas as ações são registradas e auditadas pelo sistema CASIPass.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-[#555] font-[var(--font-mono)]">CASIPass v2.0 — Módulo Operacional</p>
        </div>
      </motion.div>
    </div>
  );
}
