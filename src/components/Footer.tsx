import { Leaf, Heart } from 'lucide-react';

export default function Footer() {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <footer className="bg-[#2d5a3d] text-white py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/20">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <Leaf className="w-5 h-5 text-[#a8d5b5]" />
              <span className="font-serif font-bold text-xl">Sítio Paraíso</span>
            </div>
            <p className="text-white/60 text-sm max-w-xs leading-relaxed">
              Nosso plano, nosso futuro. Um passo de cada vez, juntos.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Início', href: '#home' },
              { label: 'Visão', href: '#vision' },
              { label: 'Painel', href: '#planner' },
              { label: 'Galeria', href: '#gallery' },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs flex items-center gap-1.5">
            Feito com <Heart className="w-3 h-3 text-red-400 fill-red-400" /> para o nosso futuro no campo
          </p>
          <div className="flex items-center gap-3 text-white/40 text-xs">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-[#a8d5b5]" /> Sítio Paraíso © {new Date().getFullYear()}
            </span>
            <span>·</span>
            <span>{today}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
