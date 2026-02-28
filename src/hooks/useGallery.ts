import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface GalleryImage {
  id: string;
  storage_path: string;
  caption: string;
  created_at: string;
  url: string;
}

export function useGallery() {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('gallery')
      .createSignedUrl(path, 60 * 60); // 1 hora de validade
    return data?.signedUrl ?? '';
  };

  const fetchImages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      setError('Erro ao carregar imagens.');
      setLoading(false);
      return;
    }

    // Busca signed URLs para todas as imagens em paralelo
    const withUrls = await Promise.all(
      (data ?? []).map(async (row) => ({
        ...row,
        url: await getSignedUrl(row.storage_path),
      }))
    );

    setImages(withUrls);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadImage = async (file: File, caption: string) => {
    if (!user) return;
    setUploading(true);
    setError(null);

    // Nome único: userId/timestamp-originalname
    const ext = file.name.split('.').pop();
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from('gallery')
      .upload(filename, file, { cacheControl: '3600', upsert: false });

    if (storageError) {
      setError('Erro ao enviar imagem. Tente novamente.');
      setUploading(false);
      return;
    }

    const { data: dbData, error: dbError } = await supabase
      .from('gallery_images')
      .insert({ user_id: user.id, storage_path: filename, caption })
      .select()
      .single();

    if (dbError) {
      setError('Imagem enviada, mas falha ao salvar metadados.');
      setUploading(false);
      return;
    }

    const url = await getSignedUrl(filename);
    setImages((prev) => [{ ...dbData, url }, ...prev]);
    setUploading(false);
  };

  const deleteImage = async (image: GalleryImage) => {
    // Remove do Storage
    await supabase.storage.from('gallery').remove([image.storage_path]);
    // Remove da tabela
    await supabase.from('gallery_images').delete().eq('id', image.id);
    setImages((prev) => prev.filter((img) => img.id !== image.id));
  };

  return { images, loading, uploading, error, uploadImage, deleteImage, refetch: fetchImages };
}
