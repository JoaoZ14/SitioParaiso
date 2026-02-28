import { Sprout, Home, Rabbit, Apple, Egg, Sun, Map, BookHeart, PiggyBank, KeyRound, Gem, Hammer, MoveRight } from 'lucide-react';

const dreams = [
  { icon: Sprout, label: 'Horta orgânica', desc: 'Alface, tomate, temperos e ervas frescas todo dia.' },
  { icon: Egg, label: 'Galinheiro', desc: 'Ovos caipiras direto do quintal pela manhã.' },
  { icon: Rabbit, label: 'Cavalos', desc: 'Um par de cavalos para passeios e trabalho leve.' },
  { icon: Apple, label: 'Pomar', desc: 'Manga, laranja, limão, banana e jabuticaba.' },
  { icon: Home, label: 'Casa aconchegante', desc: 'Varanda com rede, fogão a lenha e muito verde.' },
  { icon: Sun, label: 'Energia solar', desc: 'Painéis solares para independência energética.' },
];

const timeline = [
  {
    icon: BookHeart,
    step: 'Agora',
    label: 'Namorando e sonhando',
    desc: 'Planejando o futuro juntos, guardando dinheiro e alimentando o sonho a cada conversa.',
    status: 'active',
  },
  {
    icon: Gem,
    step: '2027',
    label: 'Noivado',
    desc: 'O pedido, a promessa e o início oficial da nossa vida a dois — com tudo planejado.',
    status: 'pending',
  },
  {
    icon: KeyRound,
    step: '2027+',
    label: 'Nossa primeira casa',
    desc: 'Entrada dada, chave na mão. Ajustando cada cantinho com cuidado e sem pressa.',
    status: 'pending',
  },
  {
    icon: PiggyBank,
    step: 'Em breve',
    label: 'Casamento',
    desc: 'Com a casa pronta, chegou a hora. Celebrar e começar de verdade a nossa história.',
    status: 'pending',
  },
  {
    icon: Hammer,
    step: 'Depois',
    label: 'Planejando o sítio Paraíso',
    desc: 'Casados e estabilizados, aí sim: buscar a terra, os animais, a horta e o Sítio Paraíso.',
    status: 'pending',
  },
];

export default function VisionSection() {
  return (
    <section id="vision" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#f5ead0]/50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-divider" />
          <span className="text-[#4a7c59] text-sm font-semibold uppercase tracking-widest">Nosso sonho</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5c3d1e] mt-2 mb-4">
            A visão do Sítio Paraíso
          </h2>
          <p className="text-[#8a7a66] text-lg max-w-2xl mx-auto leading-relaxed">
            Um lugar tranquilo onde acordar com o canto dos pássaros não é sonho — é rotina. Onde a horta alimenta a mesa e os animais animam o dia. É isso que estamos construindo juntos.
          </p>
        </div>

        {/* Dream Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {dreams.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="card-paper p-5 flex items-start gap-4 transition-all duration-300 cursor-default"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#e8f4ed] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#4a7c59]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#5c3d1e] text-sm mb-1">{label}</h4>
                <p className="text-[#8a7a66] text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="card-paper p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-xl font-bold text-[#5c3d1e] flex items-center gap-2">
              <Map className="w-5 h-5 text-[#4a7c59]" /> Nossa linha do tempo
            </h3>
            <span className="text-xs font-semibold text-[#4a7c59] bg-[#e8f4ed] px-3 py-1 rounded-full border border-[#c6e2cc]">
              Noivado em 2027
            </span>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden sm:flex items-start justify-between gap-2">
            {timeline.map(({ icon: Icon, step, label, desc, status }, i) => (
              <div key={step} className="flex items-start gap-1 flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Circle */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md mb-3 flex-shrink-0 ${
                    status === 'active'
                      ? 'bg-gradient-to-br from-[#4a7c59] to-[#2d5a3d] text-white ring-4 ring-[#4a7c59]/20'
                      : 'bg-[#f5ead0] border-2 border-[#e8d5b0] text-[#c9b48a]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {/* Tag */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${
                    status === 'active' ? 'bg-[#4a7c59] text-white' : 'bg-[#e8d5b0] text-[#8a7a66]'
                  }`}>
                    {step}
                  </span>
                  <p className="font-semibold text-[#5c3d1e] text-xs text-center mb-1">{label}</p>
                  <p className="text-[#8a7a66] text-[11px] text-center leading-relaxed max-w-[120px]">{desc}</p>
                </div>
                {i < timeline.length - 1 && (
                  <MoveRight className="w-4 h-4 text-[#c9b48a] flex-shrink-0 mt-3.5" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical */}
          <div className="flex flex-col gap-0 sm:hidden">
            {timeline.map(({ icon: Icon, step, label, desc, status }, i) => (
              <div key={step} className="flex gap-4">
                {/* Left column: circle + line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                    status === 'active'
                      ? 'bg-gradient-to-br from-[#4a7c59] to-[#2d5a3d] text-white ring-4 ring-[#4a7c59]/20'
                      : 'bg-[#f5ead0] border-2 border-[#e8d5b0] text-[#c9b48a]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[#e8d5b0] my-2 min-h-[24px]" />
                  )}
                </div>
                {/* Right: content */}
                <div className="pb-5 pt-1 flex-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    status === 'active' ? 'bg-[#4a7c59] text-white' : 'bg-[#e8d5b0] text-[#8a7a66]'
                  }`}>
                    {step}
                  </span>
                  <p className="font-semibold text-[#5c3d1e] text-sm mt-1.5 mb-0.5">{label}</p>
                  <p className="text-[#8a7a66] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
