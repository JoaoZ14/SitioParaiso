import { useState } from 'react';
import { Leaf, LogIn, UserPlus, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(translateError(error));
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(translateError(error));
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro e então entre.');
      }
    }

    setLoading(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d28]/80 via-[#2d5a3d]/60 to-[#1a3d28]/70" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-xl text-white">Sítio Paraíso</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
            Planejando nosso futuro<br />
            <span className="text-[#a8d5b5] italic">no campo</span>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-md">
            Um lugar só nosso para guardar ideias, organizar animais, controlar custos e acompanhar a meta do sítio dos sonhos.
          </p>

          {/* Mini features */}
          <div className="mt-8 space-y-3">
            {[
              'Anotações, animais e custos em um só lugar',
              'Galeria de inspirações no Supabase Storage',
              'Meta financeira com barra de progresso',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-white/80">
                <div className="w-5 h-5 rounded-full bg-[#4a7c59] flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-white/40 text-xs">
          Sítio Paraíso — nosso plano, nosso futuro.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#fffdf5]">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-[#4a7c59] rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-xl text-[#4a7c59]">Sítio Paraíso</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#5c3d1e] mb-1">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </h2>
            <p className="text-[#8a7a66] text-sm">
              {mode === 'login'
                ? 'Entre para acessar o painel do sítio.'
                : 'Preencha abaixo para começar a planejar.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#f5ead0]/60 rounded-xl p-1 mb-6 border border-[#e8d5b0]">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#4a7c59] shadow-sm border border-[#e8d5b0]'
                  : 'text-[#8a7a66] hover:text-[#5c3d1e]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Entrar
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#4a7c59] shadow-sm border border-[#e8d5b0]'
                  : 'text-[#8a7a66] hover:text-[#5c3d1e]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Criar conta
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3.5 py-3 text-sm mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-[#e8f4ed] border border-[#c6e2cc] text-[#2d5a3d] rounded-xl px-3.5 py-3 text-sm mb-5 leading-relaxed">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-xs font-medium text-[#8a7a66] block mb-1.5">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs font-medium text-[#8a7a66] block mb-1.5">
                Senha{' '}
                {mode === 'register' && (
                  <span className="text-[#c9b48a] font-normal">(mínimo 6 caracteres)</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9b48a] hover:text-[#8a7a66] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
              ) : mode === 'login' ? (
                <><LogIn className="w-4 h-4" /> Entrar no sítio</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Criar minha conta</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#8a7a66] mt-6">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#4a7c59] font-semibold hover:underline"
            >
              {mode === 'login' ? 'Criar agora' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
  if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (msg.includes('Unable to validate email')) return 'E-mail inválido.';
  return msg;
}
