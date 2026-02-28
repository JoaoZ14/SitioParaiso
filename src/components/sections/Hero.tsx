import { ChevronDown, BookOpen, PawPrint, TrendingUp, Leaf, Heart } from 'lucide-react';

const highlights = [
  {
    icon: BookOpen,
    title: 'Anotações rápidas',
    desc: 'Ideias, listas e lembretes num só lugar.',
  },
  {
    icon: PawPrint,
    title: 'Cadastro de animais',
    desc: 'Registre e acompanhe seus bichos com carinho.',
  },
  {
    icon: TrendingUp,
    title: 'Custos + Meta',
    desc: 'Saiba quanto falta para o sonho se tornar real.',
  },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1800&q=80')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2d5a3d]/30 via-transparent to-[#2d5a3d]/20" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20">
        <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/30 animate-fade-in-up">
          <Leaf className="w-3.5 h-3.5 text-[#a8d5b5]" /> Para nós dois
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up animate-delay-100">
          Planejando nosso futuro<br />
          <span className="text-[#a8d5b5] italic">no Sítio Paraíso</span>
        </h1>

        <p className="text-white/85 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
          Um cantinho para anotar ideias, organizar animais, custos e transformar o sonho em plano.
        </p>

        <span className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-sm text-white/90 px-5 py-2 rounded-full border border-white/15 mt-5 mb-8 animate-fade-in-up animate-delay-200">
          <span className="font-hand text-lg tracking-wide">João Guilherme</span>
          <Heart className="w-3.5 h-3.5 fill-white text-white flex-shrink-0" />
          <span className="font-hand text-lg tracking-wide">Clara</span>
        </span>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-300 mb-0">
          <a href="#planner" className="btn-primary w-full sm:w-auto text-center">
            Abrir painel
          </a>
          <a href="#gallery" className="btn-secondary w-full sm:w-auto text-center">
            Ver galeria
          </a>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16 animate-fade-in-up animate-delay-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-white text-center hover:bg-white/25 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 bg-white/20 rounded-full mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-base mb-1">{title}</h3>
              <p className="text-white/75 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#vision"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white transition-colors animate-bounce"
        aria-label="Rolar para baixo"
      >
        <ChevronDown className="w-6 h-6" />
      </a>
    </section>
  );
}
