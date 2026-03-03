import type { CoupleGoal } from '../types/couple';

export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const calcGoalProgress = (goal: CoupleGoal): number => {
  if (goal.type === 'financial') {
    const target = goal.targetValue ?? 0;
    const saved  = goal.savedValue ?? 0;
    if (target <= 0) return 0;
    return Math.min(100, Math.round((saved / target) * 100));
  }
  if (goal.checklist && goal.checklist.length > 0) {
    const done = goal.checklist.filter(i => i.done).length;
    return Math.round((done / goal.checklist.length) * 100);
  }
  return goal.progress ?? 0;
};

export const calcForecastDate = (
  targetValue: number,
  savedValue: number,
  monthly: number,
): string | null => {
  if (monthly <= 0) return null;
  const remaining = Math.max(0, targetValue - savedValue);
  if (remaining === 0) return 'Concluída';
  const months = Math.ceil(remaining / monthly);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
};

export const calcScenarios = (
  targetValue: number,
  savedValue: number,
  monthlyContribution: number,
) =>
  [
    { label: 'Conservador', factor: 0.8 },
    { label: 'Base',        factor: 1.0 },
    { label: 'Acelerado',   factor: 1.2 },
  ].map(s => ({
    label:   s.label,
    monthly: monthlyContribution * s.factor,
    date:    calcForecastDate(targetValue, savedValue, monthlyContribution * s.factor),
  }));

export const calcOverallProgress = (
  goals: CoupleGoal[],
  emergencyProgress: number,
): number => {
  const active = goals.filter(g => g.status !== 'paused');
  if (active.length === 0) return Math.round(emergencyProgress);

  let totalW = 0, weightedSum = 0;
  active.forEach(g => {
    const w = g.type === 'financial' ? (g.targetValue ?? 10000) : 10000;
    weightedSum += calcGoalProgress(g) * w;
    totalW += w;
  });
  const ew = totalW * 0.15;
  weightedSum += emergencyProgress * ew;
  totalW += ew;
  return totalW > 0 ? Math.round(weightedSum / totalW) : 0;
};

export const formatDatePT = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export const genId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
