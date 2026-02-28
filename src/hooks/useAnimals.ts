import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Animal } from '../types';

export function useAnimals() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnimals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: true });
    setAnimals(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const addAnimal = async (payload: Omit<Animal, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('animals')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();
    if (!error && data) setAnimals((prev) => [...prev, data]);
  };

  const updateAnimal = async (id: string, payload: Partial<Omit<Animal, 'id'>>) => {
    const { data, error } = await supabase
      .from('animals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setAnimals((prev) => prev.map((a) => a.id === id ? data : a));
  };

  const deleteAnimal = async (id: string) => {
    const { error } = await supabase.from('animals').delete().eq('id', id);
    if (!error) setAnimals((prev) => prev.filter((a) => a.id !== id));
  };

  return { animals, loading, addAnimal, updateAnimal, deleteAnimal };
}
