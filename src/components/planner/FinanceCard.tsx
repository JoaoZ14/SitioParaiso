import { useState, useEffect } from 'react';
import { TrendingUp, Lightbulb, PiggyBank, CheckCircle2, Loader2 } from 'lucide-react';
import { GiCoins } from 'react-icons/gi';
import { LuTarget } from 'react-icons/lu';
import { useFinance } from '../../hooks/useFinance';
import { useCosts } from '../../hooks/useCosts';
import { useFinanceCalc } from '../../hooks/useFinanceCalc';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinanceCard() {
  const { finance, loading, updateFinance } = useFinance();
  const { costs } = useCosts();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const { totalCosts, progress, remaining, suggestedGoal, saved, goal } = useFinanceCalc(costs, finance);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const progressColor =
    progress >= 80 ? '#4a7c59' :
    progress >= 40 ? '#b8902a' :
    '#c9b48a';

  return (
    <div className="card-paper flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-[#e8d5b0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#5c3d1e] text-base">Meta Financeira</h3>
            <p className="text-xs text-[#8a7a66]">Dinheiro guardado vs. meta</p>
          </div>
        </div>
        <span className="text-sm font-bold" style={{ color: progressColor }}>
          {progress.toFixed(0)}%
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-[#c9b48a]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-[#8a7a66] mb-2">
                <span>Progresso</span>
                <span>{formatBRL(saved)} de {formatBRL(goal > 0 ? goal : suggestedGoal)}</span>
              </div>
              <div className="w-full bg-[#e8d5b0] rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full progress-bar-inner relative overflow-hidden"
                  style={{ width: `${animatedProgress}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)` }}
                >
                  {animatedProgress > 15 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  )}
                </div>
              </div>
              {remaining > 0 ? (
                <p className="text-xs text-[#8a7a66] mt-1.5">
                  Faltam <span className="font-semibold text-[#5c3d1e]">{formatBRL(remaining)}</span> para a meta
                </p>
              ) : (
                <p className="text-xs text-[#4a7c59] font-semibold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Meta atingida!
                </p>
              )}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#8a7a66] flex items-center gap-1.5 mb-1" htmlFor="finance-saved">
                  <GiCoins className="text-[#b8902a]" /> Dinheiro guardado (R$)
                </label>
                <input
                  id="finance-saved"
                  type="number"
                  min={0}
                  step={0.01}
                  className="input-field"
                  placeholder="0,00"
                  value={finance.saved || ''}
                  onChange={(e) => updateFinance({ saved: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#8a7a66] flex items-center gap-1.5 mb-1" htmlFor="finance-goal">
                  <LuTarget className="text-[#4a7c59]" /> Meta total (R$)
                </label>
                <input
                  id="finance-goal"
                  type="number"
                  min={0}
                  step={0.01}
                  className="input-field"
                  placeholder="0,00"
                  value={finance.goal || ''}
                  onChange={(e) => updateFinance({ goal: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Totals Info */}
            <div className="bg-[#fdf9f0] rounded-xl p-4 border border-[#e8d5b0] space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#4a7c59]" />
                <span className="text-xs font-semibold text-[#5c3d1e] uppercase tracking-wide">Análise</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8a7a66]">Total planejado em custos</span>
                <span className="font-semibold text-[#5c3d1e]">{formatBRL(totalCosts)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8a7a66]">Sugestão de meta (+10% reserva)</span>
                <span className="font-semibold text-[#b8902a]">{formatBRL(suggestedGoal)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-[#e8d5b0] pt-2">
                <span className="text-[#8a7a66]">Falta guardar</span>
                <span className="font-bold text-[#4a7c59]">{formatBRL(remaining)}</span>
              </div>
            </div>

            {/* Suggestion Button */}
            {totalCosts > 0 && suggestedGoal !== goal && (
              <button
                onClick={() => updateFinance({ goal: suggestedGoal })}
                className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-[#b8902a] border border-[#c9b48a] rounded-xl py-2.5 hover:bg-[#f5ead0] transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Aplicar meta sugerida ({formatBRL(suggestedGoal)})
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
