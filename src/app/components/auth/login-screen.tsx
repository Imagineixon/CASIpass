/**
 * CASIPass — Tela de Login do Comprador (US-02)
 *
 * CREDENCIAIS DE TESTE:
 *   E-mail: maria.silva@universidade.br
 *   Senha:  CASIPass2026
 */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Cog, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/auth-store';
import { toast } from 'sonner';

export function LoginScreen() {
  const navigate = useNavigate();
  const { loginClient, isAuthenticated } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/vitrine');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = loginClient(email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Login realizado com sucesso!', { description: 'Bem-vindo(a) de volta ao CASIPass.' });
      navigate('/vitrine');
    } else {
      setError(result.error || 'Erro desconhecido.');
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4 sm:p-6">
      {/* Decorative gears */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-12 -left-12 w-48 h-48 text-[#760000] opacity-[0.03]" viewBox="0 0 48 48" fill="none">
          <path d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z" stroke="currentColor" strokeWidth="1"/>
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <svg className="absolute -bottom-16 -right-16 w-64 h-64 text-[#b87824] opacity-[0.03]" viewBox="0 0 48 48" fill="none">
          <path d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z" stroke="currentColor" strokeWidth="1"/>
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div
          className="bg-white rounded-lg border border-[#e0ddd8] p-6 sm:p-8"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Cog className="w-6 h-6 text-[#760000] animate-[spin_8s_linear_infinite]" />
              <span className="text-[#760000] font-[var(--font-heading)]" style={{ fontSize: '1.5rem', fontWeight: 400 }}>
                CASIPass
              </span>
            </div>
            <h1 className="text-[#1a1a1a] font-[var(--font-heading)]" style={{ fontSize: '1.25rem', fontWeight: 400 }}>
              Acesse sua conta
            </h1>
            <p className="text-sm text-[#737373] mt-1">Entre para gerenciar seus ingressos</p>
          </div>

          {/* Test credentials hint */}
          <div className="bg-[#eef4f8] border border-[#4a6d88]/20 rounded-md p-3 mb-5">
            <p className="text-xs text-[#4a6d88] font-[var(--font-mono)]" style={{ fontWeight: 600 }}>
              Credenciais de teste:
            </p>
            <p className="text-xs text-[#4a6d88] font-[var(--font-mono)] mt-1">maria.silva@universidade.br</p>
            <p className="text-xs text-[#4a6d88] font-[var(--font-mono)]">Senha: CASIPass2026</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-[#fce8e8] border border-[#920000]/20 rounded-md p-3"
              >
                <AlertCircle className="w-4 h-4 text-[#920000] shrink-0" />
                <span className="text-xs text-[#920000]" style={{ fontWeight: 500 }}>{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="seu.email@universidade.br"
                className="w-full h-12 px-4 rounded-md border border-[#e0ddd8] bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824]"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>Senha</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Digite sua senha"
                  className={`w-full h-12 px-4 pr-12 rounded-md border bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${
                    error ? 'border-[#920000] focus:border-[#920000]' : 'border-[#e0ddd8] focus:border-[#b87824]'
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-[#737373] hover:text-[#4a4a4a] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-md"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#b87824] hover:bg-[#a06820] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_4px_-1px_rgba(184,120,36,0.3)] focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
            >
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Entrando...</>) : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#e0ddd8]" />
            <span className="text-xs text-[#A8A8A8] font-[var(--font-mono)] uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-[#e0ddd8]" />
          </div>

          <div className="text-center space-y-3">
            <Link to="/forgot-password" className="block text-sm text-[#b87824] hover:text-[#a06820] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm" style={{ fontWeight: 500 }}>
              Esqueci minha senha
            </Link>
            <p className="text-sm text-[#737373]">
              Não tem conta?{' '}
              <Link to="/register" className="text-[#760000] hover:text-[#920000] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm" style={{ fontWeight: 600 }}>
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/staff-login" className="text-xs text-[#A8A8A8] hover:text-[#737373] transition-colors font-[var(--font-mono)] tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm">
            Acesso Staff / Admin
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
