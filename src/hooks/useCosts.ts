import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Cost } from '../types';

export function useCosts() {
  const { user } = useAuth();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('costs')
      .select('*')
      .order('created_at', { ascending: true });
    setCosts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const addCost = async (payload: Omit<Cost, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('costs')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();
    if (!error && data) setCosts((prev) => [...prev, data]);
  };

  const updateCost = async (id: string, payload: Partial<Omit<Cost, 'id'>>) => {
    const { data, error } = await supabase
      .from('costs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setCosts((prev) => prev.map((c) => c.id === id ? data : c));
  };

  const deleteCost = async (id: string) => {
    const { error } = await supabase.from('costs').delete().eq('id', id);
    if (!error) setCosts((prev) => prev.filter((c) => c.id !== id));
  };

  return { costs, loading, addCost, updateCost, deleteCost };
}
