import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Finance } from '../types';

export function useFinance() {
  const { user } = useAuth();
  const [finance, setFinanceState] = useState<Finance>({ saved: 0, goal: 0 });
  const [loading, setLoading] = useState(false);

  const fetchFinance = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('finance')
      .select('saved, goal')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setFinanceState({ saved: Number(data.saved), goal: Number(data.goal) });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const updateFinance = async (values: Partial<Finance>) => {
    if (!user) return;
    const next = { ...finance, ...values };
    setFinanceState(next);
    await supabase
      .from('finance')
      .upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  };

  return { finance, loading, updateFinance };
}
