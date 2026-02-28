import type { Cost, Finance } from '../types';

export function useFinanceCalc(costs: Cost[], finance: Finance) {
  const totalCosts = costs.reduce((sum, c) => sum + Number(c.value), 0);

  const totalByCategory = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + Number(c.value);
    return acc;
  }, {});

  const goal = finance.goal > 0 ? finance.goal : totalCosts * 1.1;
  const saved = finance.saved || 0;
  const progress = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - saved, 0);
  const suggestedGoal = Math.ceil(totalCosts * 1.1);

  return { totalCosts, totalByCategory, goal, saved, progress, remaining, suggestedGoal };
}
