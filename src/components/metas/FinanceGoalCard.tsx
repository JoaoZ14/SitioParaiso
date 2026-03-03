import { useState } from 'react';
import { DollarSign, Edit3, Check, X, TrendingUp } from 'lucide-react';
import type { FinanceMeta, Meta } from '../../types';

interface Props {
  financeGoal: FinanceMeta;
  onChange: (v: FinanceMeta) => void;
  metas: Meta[];
  onCreateMeta: (title: string, goal: number) => void;
}

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinanceGoalCard({ financeGoal, onChange, metas, onCreateMeta }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ saved: financeGoal.saved, goal: financeGoal.goal });

  const { saved, goal } = financeGoal;
  const pct = goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0;
  const falta = Math.max(0, goal - saved);

  const hasFinanceMeta = metas.some(
    m => m.category === 'Finanças' && m.status === 'active'
  );

  const barColor = pct >= 80 ? '#4a7c59' : pct >= 50 ? '#d97706' : '#6aab7e';

  const startEdit = () => {
    setDraft({ saved: financeGoal.saved, goal: financeGoal.goal });
    setEditing(true);
  };

  const confirmEdit = () => {
    onChange({ saved: Math.max(0, draft.saved), goal: Math.max(0, draft.goal) });
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  return (
    <div className="card-paper p-5 mb-6 animate-fade-in-up animate-delay-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef3c7] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#d97706]" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#2d5a3d]">Meta Financeira do Casal</h3>
            <p className="text-xs text-[#8a7a66]">Acompanhe o quanto já guardaram</p>
          </div>
        </div>

        <button
          onClick={editing ? cancelEdit : startEdit}
          className="w-8 h-8 rounded-full hover:bg-[#f5ead0] flex items-center justify-center text-[#8a7a66] transition-colors flex-shrink-0"
        >
          {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5c3d1e] mb-1">Guardado (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={draft.saved || ''}
                onChange={e => setDraft(d => ({ ...d, saved: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5c3d1e] mb-1">Meta (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={draft.goal || ''}
                onChange={e => setDraft(d => ({ ...d, goal: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                className="input-field"
              />
            </div>
          </div>
          <button
            onClick={confirmEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#4a7c59] text-white rounded-xl text-sm font-semibold hover:bg-[#2d5a3d] transition-colors"
          >
            <Check className="w-4 h-4" /> Salvar valores
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Amounts */}
          <div className="flex items-end gap-2 flex-wrap">
            <span className="font-serif text-2xl font-bold text-[#4a7c59]">{formatBRL(saved)}</span>
            {goal > 0 && (
              <>
                <span className="text-[#c9b48a] text-sm mb-0.5">de</span>
                <span className="font-serif text-lg font-bold text-[#8a7a66]">{formatBRL(goal)}</span>
              </>
            )}
          </div>

          {/* Progress bar */}
          {goal > 0 && (
            <div>
              <div className="h-3 bg-[#f5ead0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full progress-bar-inner"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-bold text-[#4a7c59]">{pct}% alcançado</span>
                {falta > 0 && (
                  <span className="flex items-center gap-1 text-xs text-[#8a7a66]">
                    <TrendingUp className="w-3 h-3" />
                    Falta {formatBRL(falta)}
                  </span>
                )}
              </div>
            </div>
          )}

          {goal === 0 && saved === 0 && (
            <p className="text-sm text-[#c9b48a]">
              Clique no lápis para definir seus valores financeiros.
            </p>
          )}

          {/* CTA: create meta */}
          {goal > 0 && !hasFinanceMeta && (
            <button
              onClick={() => onCreateMeta(`Juntar ${formatBRL(goal)} juntos`, goal)}
              className="flex items-center gap-2 text-xs font-semibold text-[#d97706] hover:text-[#b45309] transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Usar como meta principal
            </button>
          )}
          {goal > 0 && hasFinanceMeta && (
            <p className="text-xs text-[#6aab7e] font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Já existe uma meta financeira na lista
            </p>
          )}
        </div>
      )}
    </div>
  );
}
