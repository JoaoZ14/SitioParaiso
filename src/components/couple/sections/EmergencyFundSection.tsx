import { useState } from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { EmergencyFund } from '../../../types/couple';
import { formatBRL } from '../../../utils/finance';

interface Props {

  fund: EmergencyFund;
  onUpdate: (f: EmergencyFund) => void;
}

const MONTHS_OPTIONS = [3, 6, 9, 12] as const;

const getStatus = (pct: number) =>
  pct >= 100 ? 'OK' : pct >= 70 ? 'Atenção' : 'Risco';

const statusConfig = {
  OK:      { color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', Icon: CheckCircle2, label: 'Fundo completo!' },
  Atenção: { color: '#d97706', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   Icon: AlertTriangle, label: 'Progresso bom — continue aportando.' },
  Risco:   { color: '#dc2626', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     Icon: AlertTriangle, label: 'Fundo baixo — priorize aportes.' },
};

export default function EmergencyFundSection({ fund, onUpdate }: Props) {
  const [expenses, setExpenses] = useState(String(fund.monthlyExpenses));
  const [months, setMonths] = useState<typeof MONTHS_OPTIONS[number]>(fund.safetyMonths);
  const [saved, setSaved] = useState(String(fund.savedAmount));
  const [aport, setAport] = useState('');
  const [dirty, setDirty] = useState(false);

  const parsedExpenses = parseFloat(expenses) || 0;
  const parsedSaved    = parseFloat(saved.replace(/\./g, '').replace(',', '.')) || 0;

  const target   = parsedExpenses * months;
  const pct      = target > 0 ? Math.min(100, Math.round((parsedSaved / target) * 100)) : 0;
  const missing  = Math.max(0, target - parsedSaved);
  const status   = getStatus(pct);
  const cfg      = statusConfig[status];
  const Icon     = cfg.Icon;

  const handleApply = () => {
    onUpdate({ monthlyExpenses: parsedExpenses, safetyMonths: months, savedAmount: parsedSaved });
    setDirty(false);
  };

  const handleAport = () => {
    const n = parseFloat(aport);
    if (isNaN(n) || n <= 0) return;
    const newSaved = parsedSaved + n;
    setSaved(String(newSaved));
    onUpdate({ monthlyExpenses: parsedExpenses, safetyMonths: months, savedAmount: newSaved });
    setAport('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#4a7c59]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#4a7c59]" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Fundo de Emergência</h2>
            <p className="text-xs text-slate-400">Calculadora e controle de progresso</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Despesas mensais do casal (R$)
            </label>
            <input
              type="number" min="0" step="500"
              value={expenses}
              onChange={e => { setExpenses(e.target.value); setDirty(true); }}
              placeholder="Ex: 8000"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Meses de segurança
            </label>
            <div className="flex gap-2">
              {MONTHS_OPTIONS.map(m => (
                <button key={m} onClick={() => { setMonths(m); setDirty(true); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all
                    ${months === m ? 'bg-[#4a7c59] text-white border-[#4a7c59]' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50'}`}>
                  {m}x
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Recomendado: 6 meses para a maioria dos perfis
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Valor já guardado (R$)
            </label>
            <input
              type="number" min="0" step="500"
              value={saved}
              onChange={e => { setSaved(e.target.value); setDirty(true); }}
              placeholder="Ex: 22000"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
            />
          </div>

          {dirty && (
            <button onClick={handleApply}
              className="w-full py-3 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3a6448] transition-colors shadow-sm">
              Recalcular e salvar
            </button>
          )}
        </div>
      </div>

      {/* Progress card */}
      <div className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold ${cfg.text}`}>Meta: {formatBRL(target)}</p>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            <Icon className="w-3.5 h-3.5" />
            {status}
          </span>
        </div>

        {/* Big progress number */}
        <div className="flex items-end gap-2 mb-3">
          <span className={`text-5xl font-bold tracking-tight ${cfg.text}`}>{pct}%</span>
          <span className={`text-sm pb-1 ${cfg.text} opacity-70`}>completo</span>
        </div>

        {/* Bar */}
        <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: cfg.color }} />
        </div>

        <div className="flex justify-between text-sm">
          <span className={cfg.text}>{formatBRL(parsedSaved)} guardado</span>
          <span className={`font-semibold ${cfg.text}`}>
            {missing > 0 ? `Faltam ${formatBRL(missing)}` : 'Meta atingida!'}
          </span>
        </div>

        {/* Status message */}
        <div className={`mt-3 flex items-center gap-2 text-xs ${cfg.text}`}>
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          {cfg.label}
        </div>
      </div>

      {/* Aport card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Adicionar aporte</h3>
        <p className="text-xs text-slate-400 mb-4">O valor será somado ao guardado e salvo automaticamente.</p>
        <div className="flex gap-3">
          <input
            type="number" min="0" step="100"
            value={aport}
            onChange={e => setAport(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAport()}
            placeholder="Valor (R$)"
            className="flex-1 px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
          />
          <button onClick={handleAport}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3a6448] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Aportar
          </button>
        </div>

        {/* Quick aport buttons */}
        <div className="flex gap-2 mt-3">
          {[500, 1000, 2000, 5000].map(n => (
            <button key={n}
              onClick={() => {
                const newSaved = parsedSaved + n;
                setSaved(String(newSaved));
                onUpdate({ monthlyExpenses: parsedExpenses, safetyMonths: months, savedAmount: newSaved });
              }}
              className="flex-1 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-[#4a7c59]/10 hover:text-[#4a7c59] hover:border-[#4a7c59]/30 transition-colors">
              +{formatBRL(n)}
            </button>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          Recomendações
        </h3>
        <div className="space-y-2 text-sm text-slate-500">
          {[
            { range: '3 meses', who: 'CLT com renda estável e sem dependentes' },
            { range: '6 meses', who: 'Maioria dos casais — padrão recomendado' },
            { range: '9 meses', who: 'Autônomos, MEIs ou casais com dependentes' },
            { range: '12 meses', who: 'Empresários, alta variação de renda ou filhos' },
          ].map(r => (
            <div key={r.range} className="flex gap-3">
              <span className="font-semibold text-[#4a7c59] w-20 flex-shrink-0">{r.range}</span>
              <span>{r.who}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-3">
          Guarde o fundo em aplicações de alta liquidez: CDB com liquidez diária, Tesouro Selic ou fundo DI.
        </p>
      </div>
    </div>
  );
}
