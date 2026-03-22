/**
 * CASIPass — Tela de Cadastro (US-01)
 * Card branco centralizado, validação completa inline
 */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Cog, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuthStore, type RegisterErrors } from '../../store/auth-store';
import { toast } from 'sonner';
import { isValidCpfAlgorithm } from '../../services/api';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/vitrine');
  }, [isAuthenticated, navigate]);

  const cpfValid = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf) && isValidCpfAlgorithm(form.cpf);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { level: 1, label: 'Fraca', color: '#920000' };
    if (score === 2) return { level: 2, label: 'Média', color: '#a85832' };
    if (score === 3) return { level: 3, label: 'Boa', color: '#b87824' };
    return { level: 4, label: 'Forte', color: '#6b705c' };
  };

  const pwStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    await new Promise((r) => setTimeout(r, 1000));

    const result = register(form);
    setLoading(false);

    if (result.success) {
      toast.success('Conta criada com sucesso!', {
        description: 'Seja bem-vindo(a) ao CASIPass.',
      });
      navigate('/vitrine');
    } else if (result.errors) {
      setErrors(result.errors);
      toast.error('Corrija os erros no formulário.');
    }
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 mt-1.5"
      >
        <AlertCircle className="w-3.5 h-3.5 text-[#920000] shrink-0" />
        <span className="text-xs text-[#920000]" style={{ fontWeight: 500 }}>{msg}</span>
      </motion.div>
    ) : null;

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4 sm:p-6">
      {/* Decorative gears */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-1/4 -right-20 w-56 h-56 text-[#760000] opacity-[0.03]" viewBox="0 0 48 48" fill="none">
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
              <span
                className="text-[#760000] font-[var(--font-heading)]"
                style={{ fontSize: '1.5rem', fontWeight: 400 }}
              >
                CASIPass
              </span>
            </div>
            <h1
              className="text-[#1a1a1a] font-[var(--font-heading)]"
              style={{ fontSize: '1.25rem', fontWeight: 400 }}
            >
              Crie sua conta no CASIPass
            </h1>
            <p className="text-sm text-[#737373] mt-1">
              Preencha seus dados para começar
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nome Completo */}
            <div>
              <label htmlFor="reg-name" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                Nome Completo <span className="text-[#920000]">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Maria Eduarda Silva"
                className={`w-full h-12 px-4 rounded-md border bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${
                  errors.name ? 'border-[#920000]' : 'border-[#e0ddd8] focus:border-[#b87824]'
                }`}
                autoComplete="name"
              />
              <FieldError msg={errors.name} />
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="reg-email" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                E-mail <span className="text-[#920000]">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="seu.email@universidade.br"
                className={`w-full h-12 px-4 rounded-md border bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${
                  errors.email ? 'border-[#920000]' : 'border-[#e0ddd8] focus:border-[#b87824]'
                }`}
                autoComplete="email"
              />
              <FieldError msg={errors.email} />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                Telefone <span className="text-[#920000]">*</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                placeholder="(91) 99999-0000"
                className={`w-full h-12 px-4 rounded-md border bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${
                  errors.phone ? 'border-[#920000]' : 'border-[#e0ddd8] focus:border-[#b87824]'
                }`}
                autoComplete="tel"
              />
              <FieldError msg={errors.phone} />
            </div>

            {/* CPF with validation */}
            <div>
              <label htmlFor="reg-cpf" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                CPF <span className="text-[#920000]">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-cpf"
                  type="text"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={(e) => updateField('cpf', formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className={`w-full h-12 px-4 pr-12 rounded-md border bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors font-[var(--font-mono)] focus-visible:outline-2 focus-visible:outline-[#b87824] ${
                    errors.cpf
                      ? 'border-[#920000]'
                      : cpfValid
                        ? 'border-[#6b705c] focus:border-[#6b705c]'
                        : 'border-[#e0ddd8] focus:border-[#b87824]'
                  }`}
                />
                {cpfValid && !errors.cpf && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#6b705c]" />
                  </motion.div>
                )}
              </div>
              {cpfValid && !errors.cpf ? (
                <p className="text-xs text-[#6b705c] mt-1" style={{ fontWeight: 500 }}>
                  CPF válido
                </p>
              ) : (
                <FieldError msg={errors.cpf} />
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="reg-password" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                Senha <span className="text-[#920000]">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full h-12 px-4 pr-12 rounded-md border bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] ${
                    errors.password ? 'border-[#920000]' : 'border-[#e0ddd8] focus:border-[#b87824]'
                  }`}
                  autoComplete="new-password"
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
              <FieldError msg={errors.password} />

              {/* Password strength bar */}
              {form.password && !errors.password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{
                          backgroundColor: i <= pwStrength.level ? pwStrength.color : '#e0ddd8',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-[var(--font-mono)]" style={{ color: pwStrength.color, fontWeight: 500 }}>
                    {pwStrength.label}
                  </p>
                </motion.div>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#b87824] hover:bg-[#a06820] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_4px_-1px_rgba(184,120,36,0.3)] focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-[#737373]">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-[#760000] hover:text-[#920000] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm"
                style={{ fontWeight: 600 }}
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}