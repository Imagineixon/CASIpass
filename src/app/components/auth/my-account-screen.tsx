/**
 * CASIPass — Tela Minha Conta (US-04)
 * Protegida: redireciona para login se não autenticado
 */
import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Save, User, Phone, Mail, IdCard, CheckCircle2, LogOut, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/auth-store';
import { toast } from 'sonner';

export function MyAccountScreen() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) navigate('/login');
  }, [isAuthenticated, user, navigate]);

  // Sync from store if user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  if (!isAuthenticated || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    updateProfile({ name: name.trim(), phone: phone.trim() });
    setSaved(true);
    toast.success('Dados atualizados com sucesso!');
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* ── Header Vinho ──────────────────────────────── */}
      <div className="bg-[#760000] relative overflow-hidden">
        <svg className="absolute -right-8 -top-8 w-36 h-36 text-white opacity-[0.05]" viewBox="0 0 48 48" fill="none">
          <path d="M20.7 4.6l-.9 3.3a2 2 0 01-2.4 1.4l-3.2-1.1-2.4 2.4 1.1 3.2a2 2 0 01-1.4 2.4l-3.3.9v3.4l3.3.9a2 2 0 011.4 2.4l-1.1 3.2 2.4 2.4 3.2-1.1a2 2 0 012.4 1.4l.9 3.3h3.4l.9-3.3a2 2 0 012.4-1.4l3.2 1.1 2.4-2.4-1.1-3.2a2 2 0 011.4-2.4l3.3-.9v-3.4l-3.3-.9a2 2 0 01-1.4-2.4l1.1-3.2-2.4-2.4-3.2 1.1a2 2 0 01-2.4-1.4l-.9-3.3h-3.4z" stroke="currentColor" strokeWidth="1"/>
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                to="/vitrine"
                className="w-10 h-10 rounded-md bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-white font-[var(--font-heading)]" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 400 }}>
                Meus Dados
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 px-4 rounded-md bg-white/15 text-white text-sm flex items-center gap-2 hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824]"
              style={{ fontWeight: 500 }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#b87824] rounded-lg flex items-center justify-center text-white shrink-0">
              {user.role === 'staff' ? <Shield className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 600 }}>{name}</p>
              <p className="text-[#dda457] text-sm font-[var(--font-mono)]">ID: {user.id}</p>
              {user.role === 'staff' && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#6b705c]/30 text-[#dda457] px-2 py-0.5 rounded-md mt-1 font-[var(--font-mono)]">
                  <Shield className="w-3 h-3" />STAFF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Container ────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 -mt-4 relative z-10">
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-lg border border-[#e0ddd8] p-5 sm:p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 className="text-[#1a1a1a] font-[var(--font-heading)] mb-1" style={{ fontSize: '1.1rem', fontWeight: 400 }}>
              Informações pessoais
            </h2>
            <p className="text-sm text-[#737373] mb-6">Campos com cadeado não podem ser alterados por aqui.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="acc-name" className="flex items-center gap-1.5 text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                  <User className="w-3.5 h-3.5 text-[#b87824]" />Nome Completo
                </label>
                <input
                  id="acc-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-[#e0ddd8] bg-white text-[#1a1a1a] transition-colors focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824]"
                />
              </div>

              <div>
                <label htmlFor="acc-phone" className="flex items-center gap-1.5 text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                  <Phone className="w-3.5 h-3.5 text-[#b87824]" />Telefone
                </label>
                <input
                  id="acc-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-[#e0ddd8] bg-white text-[#1a1a1a] transition-colors focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824]"
                />
              </div>

              <div>
                <label htmlFor="acc-cpf" className="flex items-center gap-1.5 text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                  <IdCard className="w-3.5 h-3.5 text-[#b87824]" />CPF
                  <Lock className="w-3 h-3 text-[#A8A8A8] ml-auto" />
                </label>
                <div className="relative">
                  <input id="acc-cpf" type="text" value={user.cpf} disabled className="w-full h-12 px-4 pr-10 rounded-md border border-[#ece9e3] bg-[#faf9f7] text-[#737373] cursor-not-allowed font-[var(--font-mono)]" />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="acc-email" className="flex items-center gap-1.5 text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                  <Mail className="w-3.5 h-3.5 text-[#b87824]" />E-mail
                  <Lock className="w-3 h-3 text-[#A8A8A8] ml-auto" />
                </label>
                <div className="relative">
                  <input id="acc-email" type="email" value={user.email} disabled className="w-full h-12 px-4 pr-10 rounded-md border border-[#ece9e3] bg-[#faf9f7] text-[#737373] cursor-not-allowed" />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#e0ddd8] my-6" />

            <div className="flex items-center justify-between gap-4">
              <AnimatePresence>
                {saved && (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6b705c]" />
                    <span className="text-sm text-[#6b705c]" style={{ fontWeight: 500 }}>Alterações salvas</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="submit"
                className="ml-auto inline-flex items-center gap-2 h-12 px-6 border-2 border-[#b87824] text-[#b87824] hover:bg-[#b87824] hover:text-white rounded-md transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2"
                style={{ fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />Salvar Alterações
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 bg-white rounded-lg border border-[#e0ddd8] p-5 sm:p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="text-sm text-[#920000] mb-1" style={{ fontWeight: 600 }}>Zona de risco</h3>
          <p className="text-sm text-[#737373] mb-4">Para alterar e-mail ou CPF, entre em contato com o suporte.</p>
          <button
            type="button"
            className="h-10 px-4 text-sm border border-[#e0ddd8] text-[#920000] hover:bg-[#fce8e8] rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-[#920000]"
            style={{ fontWeight: 500 }}
          >
            Solicitar alteração de dados protegidos
          </button>
        </div>
      </div>
    </div>
  );
}
