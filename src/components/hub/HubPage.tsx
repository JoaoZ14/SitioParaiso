import { useNavigate } from 'react-router-dom';
import { Leaf, Target, Home, LogOut, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HubPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const userInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#fdf6e3] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5b0]">
        <div className="flex items-center gap-2 font-serif font-bold text-xl text-[#4a7c59]">
          <Leaf className="w-5 h-5" />
          Sítio Paraíso
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {userInitial}
            </div>
            <span className="text-xs text-[#8a7a66] hidden sm:block truncate max-w-[160px]">{user?.email}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[#e8d5b0] text-[#8a7a66] hover:border-red-300 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-[#4a7c59]/10 text-[#4a7c59] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sprout className="w-4 h-4" />
            Bem-vindo de volta
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2d5a3d] mb-3 leading-tight">
            Para onde vamos hoje?
          </h1>
          <p className="text-[#8a7a66] text-base max-w-sm mx-auto leading-relaxed">
            Seu cantinho digital para cuidar do sítio e planejar a vida juntos, um passo de cada vez.
          </p>
        </div>

        {/* Hub cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl animate-fade-in-up animate-delay-200">
          {/* Card: Entrar no Sítio */}
          <button
            onClick={() => navigate('/app')}
            className="group text-left p-8 rounded-2xl bg-[#fffdf5] border border-[#e8d5b0] shadow-[0_4px_20px_rgba(74,124,89,0.08)] hover:shadow-[0_12px_40px_rgba(74,124,89,0.18)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#4a7c59]/10 flex items-center justify-center mb-5 group-hover:bg-[#4a7c59]/20 transition-colors duration-300">
              <Home className="w-7 h-7 text-[#4a7c59]" />
            </div>
            <h2 className="font-serif text-2xl text-[#2d5a3d] mb-2">Entrar no Sítio</h2>
            <p className="text-[#8a7a66] text-sm leading-relaxed mb-6">
              Notas, animais, custos, finanças e o painel completo do nosso sítio.
            </p>
            <div className="flex items-center gap-2 text-[#4a7c59] text-sm font-semibold">
              Acessar painel
              <span className="group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
            </div>
          </button>

          {/* Card: Metas Gerais */}
          <button
            onClick={() => navigate('/app/metas')}
            className="group text-left p-8 rounded-2xl bg-gradient-to-br from-[#fffdf5] to-[#eef7f1] border border-[#c9e0d2] shadow-[0_4px_20px_rgba(74,124,89,0.1)] hover:shadow-[0_12px_40px_rgba(74,124,89,0.22)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* Decorative dot */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a7c59]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#4a7c59]/15 flex items-center justify-center mb-5 group-hover:bg-[#4a7c59]/25 transition-colors duration-300">
                <Target className="w-7 h-7 text-[#4a7c59]" />
              </div>
              <h2 className="font-serif text-2xl text-[#2d5a3d] mb-2">Metas Gerais</h2>
              <p className="text-[#8a7a66] text-sm leading-relaxed mb-6">
                Planos, sonhos e conquistas do casal. Organize e acompanhe tudo aqui.
              </p>
              <div className="flex items-center gap-2 text-[#4a7c59] text-sm font-semibold">
                Ver metas
                <span className="group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Inspirational footer quote */}
        <p className="mt-12 font-hand text-[#c9b48a] text-lg text-center animate-fade-in-up animate-delay-400">
          "Sonhos viram realidade quando a gente os escreve."
        </p>
      </main>

      <footer className="text-center py-5 text-[#c9b48a] text-xs border-t border-[#e8d5b0]">
        Feito com amor &mdash; Sítio Paraíso {new Date().getFullYear()}
      </footer>
    </div>
  );
}
