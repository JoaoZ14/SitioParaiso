import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Meta, FinanceMeta, ChecklistItem } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMeta(row: Record<string, any>): Meta {
  return {
    id:          row.id,
    title:       row.title,
    category:    row.category,
    description: row.description ?? '',
    priority:    row.priority,
    deadline:    row.deadline ?? '',
    progress:    row.progress ?? 0,
    checklist:   (row.checklist as ChecklistItem[]) ?? [],
    status:      row.status,
    createdAt:   row.created_at,
    pinned:      row.pinned ?? false,
    notes:       row.notes ?? undefined,
  };
}

function metaToRow(meta: Meta, userId: string) {
  return {
    id:          meta.id,
    user_id:     userId,
    title:       meta.title,
    category:    meta.category,
    description: meta.description,
    priority:    meta.priority,
    deadline:    meta.deadline || null,
    progress:    meta.progress,
    checklist:   meta.checklist,
    status:      meta.status,
    created_at:  meta.createdAt,
    pinned:      meta.pinned ?? false,
    notes:       meta.notes ?? null,
  };
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useMetas() {
  const { user } = useAuth();

  const [metas,        setMetas]        = useState<Meta[]>([]);
  const [financeGoal,  setFinanceLocal] = useState<FinanceMeta>({ saved: 0, goal: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchMetas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('metas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setMetas((data ?? []).map(rowToMeta));
    }
    setLoading(false);
  }, [user]);

  const fetchFinanceGoal = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('finance_meta')
      .select('saved, goal')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setFinanceLocal({ saved: Number(data.saved), goal: Number(data.goal) });
  }, [user]);

  useEffect(() => {
    fetchMetas();
    fetchFinanceGoal();
  }, [fetchMetas, fetchFinanceGoal]);

  // ── metas CRUD ────────────────────────────────────────────────────────────

  /** Create or update a meta (optimistic). */
  const saveMeta = useCallback(async (meta: Meta) => {
    if (!user) return;
    const exists = metas.some(m => m.id === meta.id);

    // Optimistic update
    setMetas(prev =>
      exists
        ? prev.map(m => (m.id === meta.id ? meta : m))
        : [meta, ...prev],
    );

    const { error: err } = await supabase
      .from('metas')
      .upsert(metaToRow(meta, user.id), { onConflict: 'id' });

    if (err) {
      setError(err.message);
      // Rollback
      await fetchMetas();
    }
  }, [user, metas, fetchMetas]);

  /** Partial update — only send changed fields to the DB. */
  const patchMeta = useCallback(async (id: string, updates: Partial<Omit<Meta, 'id' | 'createdAt'>>) => {
    if (!user) return;

    // Optimistic update
    setMetas(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

    // Build DB payload (map camelCase → snake_case)
    const dbRow: Record<string, unknown> = {};
    if ('title'       in updates) dbRow.title       = updates.title;
    if ('category'    in updates) dbRow.category    = updates.category;
    if ('description' in updates) dbRow.description = updates.description;
    if ('priority'    in updates) dbRow.priority    = updates.priority;
    if ('deadline'    in updates) dbRow.deadline    = updates.deadline || null;
    if ('progress'    in updates) dbRow.progress    = updates.progress;
    if ('checklist'   in updates) dbRow.checklist   = updates.checklist;
    if ('status'      in updates) dbRow.status      = updates.status;
    if ('pinned'      in updates) dbRow.pinned      = updates.pinned;
    if ('notes'       in updates) dbRow.notes       = updates.notes ?? null;

    const { error: err } = await supabase.from('metas').update(dbRow).eq('id', id);
    if (err) {
      setError(err.message);
      await fetchMetas(); // rollback
    }
  }, [user, fetchMetas]);

  /** Delete one meta (optimistic). */
  const deleteMeta = useCallback(async (id: string) => {
    setMetas(prev => prev.filter(m => m.id !== id)); // optimistic
    const { error: err } = await supabase.from('metas').delete().eq('id', id);
    if (err) {
      setError(err.message);
      await fetchMetas(); // rollback
    }
  }, [fetchMetas]);

  /** Delete all metas with status = 'done'. */
  const clearDoneMetas = useCallback(async () => {
    if (!user) return;
    setMetas(prev => prev.filter(m => m.status !== 'done')); // optimistic
    const { error: err } = await supabase
      .from('metas')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'done');
    if (err) {
      setError(err.message);
      await fetchMetas();
    }
  }, [user, fetchMetas]);

  // ── finance_meta CRUD ─────────────────────────────────────────────────────

  const saveFinanceGoal = useCallback(async (values: FinanceMeta) => {
    setFinanceLocal(values);
    if (!user) return;
    const { error: err } = await supabase
      .from('finance_meta')
      .upsert(
        { user_id: user.id, ...values, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    if (err) setError(err.message);
  }, [user]);

  return {
    metas,
    financeGoal,
    loading,
    error,
    saveMeta,
    patchMeta,
    deleteMeta,
    clearDoneMetas,
    saveFinanceGoal,
    refetch: fetchMetas,
  };
}
