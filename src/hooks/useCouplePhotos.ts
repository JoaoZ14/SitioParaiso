import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface CouplePhoto {
  id: string;
  storage_path: string;
  caption: string;
  taken_at: string | null;
  created_at: string;
  url: string;
}

export function useCouplePhotos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<CouplePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('couple-photos')
      .createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? '';
  };

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('couple_photos')
      .select('*')
      .order('taken_at', { ascending: false, nullsFirst: false });

    if (dbError) {
      setError('Erro ao carregar fotos.');
      setLoading(false);
      return;
    }

    const withUrls = await Promise.all(
      (data ?? []).map(async (row) => ({
        ...row,
        url: await getSignedUrl(row.storage_path),
      }))
    );

    setPhotos(withUrls);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const uploadPhoto = async (file: File, caption: string, takenAt: string) => {
    if (!user) return;
    setUploading(true);
    setError(null);

    const ext = file.name.split('.').pop();
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from('couple-photos')
      .upload(filename, file, { cacheControl: '3600', upsert: false });

    if (storageError) {
      setError('Erro ao enviar foto. Tente novamente.');
      setUploading(false);
      return;
    }

    const { data: dbData, error: dbError } = await supabase
      .from('couple_photos')
      .insert({
        user_id: user.id,
        storage_path: filename,
        caption,
        taken_at: takenAt || null,
      })
      .select()
      .single();

    if (dbError) {
      setError('Foto enviada, mas falha ao salvar metadados.');
      setUploading(false);
      return;
    }

    const url = await getSignedUrl(filename);
    setPhotos((prev) => [{ ...dbData, url }, ...prev]);
    setUploading(false);
  };

  const deletePhoto = async (photo: CouplePhoto) => {
    await supabase.storage.from('couple-photos').remove([photo.storage_path]);
    await supabase.from('couple_photos').delete().eq('id', photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  };

  return { photos, loading, uploading, error, uploadPhoto, deletePhoto };
}
