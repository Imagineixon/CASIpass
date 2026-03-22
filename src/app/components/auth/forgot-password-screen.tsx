/**
 * CASIPass — Tela de Recuperação de Senha (US-03)
 * Card branco centralizado, simples e limpo
 */
import { useState } from 'react';
import { Cog, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4 sm:p-6">
      {/* Decorative gear */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-1/4 -left-16 w-48 h-48 text-[#b87824] opacity-[0.03]" viewBox="0 0 48 48" fill="none">
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
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-[#f5e6cc] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-[#b87824]" />
                  </div>
                  <h1
                    className="text-[#1a1a1a] font-[var(--font-heading)]"
                    style={{ fontSize: '1.25rem', fontWeight: 400 }}
                  >
                    Esqueceu sua senha?
                  </h1>
                  <p className="text-sm text-[#737373] mt-2 max-w-xs mx-auto leading-relaxed">
                    Informe seu e-mail cadastrado e enviaremos um link para redefinição.
                  </p>
                </div>

                {/* Form */}
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <div>
                    <label htmlFor="fp-email" className="block text-sm text-[#4a4a4a] mb-1.5" style={{ fontWeight: 500 }}>
                      E-mail
                    </label>
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@universidade.br"
                      className="w-full h-12 px-4 rounded-md border border-[#e0ddd8] bg-white text-[#1a1a1a] placeholder:text-[#A8A8A8] transition-colors focus:border-[#b87824] focus-visible:outline-2 focus-visible:outline-[#b87824]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-[#b87824] hover:bg-[#a06820] active:scale-[0.98] text-white rounded-md transition-all shadow-[0_2px_4px_-1px_rgba(184,120,36,0.3)] focus-visible:outline-2 focus-visible:outline-[#760000] focus-visible:outline-offset-2"
                    style={{ fontWeight: 600 }}
                  >
                    Enviar link de recuperação
                  </button>
                </form>

                {/* Back link */}
                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#4a4a4a] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                  className="w-16 h-16 bg-[#f0f2ec] rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 className="w-8 h-8 text-[#6b705c]" />
                </motion.div>
                <h2
                  className="text-[#1a1a1a] font-[var(--font-heading)] mb-2"
                  style={{ fontSize: '1.25rem', fontWeight: 400 }}
                >
                  Link enviado!
                </h2>
                <p className="text-sm text-[#737373] max-w-xs mx-auto leading-relaxed mb-6">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[#b87824] hover:text-[#a06820] transition-colors focus-visible:outline-2 focus-visible:outline-[#b87824] rounded-sm"
                  style={{ fontWeight: 600 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
