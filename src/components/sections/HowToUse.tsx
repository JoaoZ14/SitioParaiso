import { PenLine, Save, Heart } from 'lucide-react';

const steps = [
  {
    icon: PenLine,
    number: '01',
    title: 'Anote e planeje',
    desc: 'Registre suas ideias, custos estimados, animais e sonhos diretamente no painel. Tudo fica guardado no seu navegador.',
  },
  {
    icon: Save,
    number: '02',
    title: 'Seus dados, sempre salvos',
    desc: 'Sem login, sem servidor. Tudo fica no LocalStorage do seu dispositivo. Abra quando quiser, estará tudo lá.',
  },
  {
    icon: Heart,
    number: '03',
    title: 'Acompanhe a jornada juntos',
    desc: 'Compartilhe a tela com a sua pessoa especial, atualize a meta e veja o sonho tomando forma a cada dia.',
  },
];

export default function HowToUse() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#fffdf5] to-[#f5ead0]/50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-divider" />
          <span className="text-[#4a7c59] text-sm font-semibold uppercase tracking-widest">Simples assim</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5c3d1e] mt-2 mb-4">
            Como usamos o Sítio Paraíso
          </h2>
          <p className="text-[#8a7a66] text-lg max-w-xl mx-auto leading-relaxed">
            Sem complicação. É feito para ser usado a dois, com carinho e no ritmo de vocês.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden sm:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#e8d5b0] via-[#4a7c59]/30 to-[#e8d5b0]" />

          {steps.map(({ icon: Icon, number, title, desc }) => (
            <div key={number} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4a7c59] to-[#2d5a3d] flex items-center justify-center shadow-lg shadow-[#4a7c59]/25">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#e8d5b0] text-[#5c3d1e] text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {number}
                </span>
              </div>
              <h3 className="font-serif font-bold text-[#5c3d1e] text-lg mb-2">{title}</h3>
              <p className="text-[#8a7a66] text-sm leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
