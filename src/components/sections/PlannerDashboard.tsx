import NotesCard from '../planner/NotesCard';
import AnimalsCard from '../planner/AnimalsCard';
import CostsCard from '../planner/CostsCard';
import FinanceCard from '../planner/FinanceCard';

export default function PlannerDashboard() {
  return (
    <section id="planner" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#fffdf5]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-divider" />
          <span className="text-[#4a7c59] text-sm font-semibold uppercase tracking-widest">Painel do sítio</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5c3d1e] mt-2 mb-4">
            Organize tudo em um lugar
          </h2>
          <p className="text-[#8a7a66] text-lg max-w-xl mx-auto leading-relaxed">
            Anotações, animais, custos e meta — salvos com segurança no Supabase, acessíveis de qualquer dispositivo.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesCard />
          <AnimalsCard />
          <CostsCard />
          <FinanceCard />
        </div>
      </div>
    </section>
  );
}
