import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Note, NoteTag } from '../types';

interface SupabaseNote {
  id: string;
  title: string;
  content: string;
  tag: NoteTag;
  created_at: string;
}

function toNote(row: SupabaseNote): Note {
  return { id: row.id, title: row.title, content: row.content, tag: row.tag, createdAt: row.created_at };
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    setNotes((data ?? []).map(toNote));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (payload: Omit<Note, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notes')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();
    if (!error && data) setNotes((prev) => [toNote(data), ...prev]);
  };

  const updateNote = async (id: string, payload: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const { data, error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setNotes((prev) => prev.map((n) => n.id === id ? toNote(data) : n));
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, loading, addNote, updateNote, deleteNote };
}
