import { useState, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, Upload,
  Trash2, ImagePlus, Loader2, AlertCircle, Images, Play, Film,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGallery } from '../../hooks/useGallery';
import type { GalleryImage } from '../../hooks/useGallery';

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/avi';
const MAX_IMAGE_MB = 8;
const MAX_VIDEO_MB = 200;

export default function Gallery() {
  const { user } = useAuth();
  const { images, loading, uploading, error, uploadImage, deleteImage } = useGallery();

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Lightbox ── */
  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : 0));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : 0));
  const handleLightboxKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  /* ── Upload ── */
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) return;
    const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`O arquivo deve ter no máximo ${maxMB}MB.`);
      return;
    }
    setSelectedFile(file);
    setPreviewType(isVideo ? 'video' : 'image');
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    await uploadImage(selectedFile, caption.trim());
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setShowUpload(false);
  };

  const cancelUpload = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);
    setPreviewType('image');
    setCaption('');
    setShowUpload(false);
  };

  const handleDelete = async (image: GalleryImage) => {
    setConfirmDelete(null);
    await deleteImage(image);
    if (lightboxIdx !== null) closeLightbox();
  };

  return (
    <section id="gallery" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#f5ead0]/40">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-divider" />
          <span className="text-[#4a7c59] text-sm font-semibold uppercase tracking-widest">Inspirações</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5c3d1e] mt-2 mb-4">
            Nossa galeria de sonhos
          </h2>
          <p className="text-[#8a7a66] text-lg max-w-xl mx-auto leading-relaxed">
            Guarde aqui as imagens que inspiram vocês — referências, fotos de terrenos, casas, animais, tudo que compõe o sonho.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Upload Panel */}
        {user && showUpload && (
          <form
            onSubmit={handleUploadSubmit}
            className="card-paper p-5 mb-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-[#5c3d1e] text-base flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-[#4a7c59]" /> Adicionar mídia
              </h3>
              <button type="button" onClick={cancelUpload} className="p-1 text-[#8a7a66] hover:text-[#5c3d1e]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden ${
                dragOver
                  ? 'border-[#4a7c59] bg-[#e8f4ed]'
                  : 'border-[#e8d5b0] hover:border-[#4a7c59]/50 bg-[#fdf9f0]'
              }`}
            >
              {preview ? (
                <div className="relative">
                  {previewType === 'video' ? (
                    <video
                      src={preview}
                      className="w-full max-h-64 object-cover rounded-2xl"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-2xl" />
                  )}
                  <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Clique para trocar</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3 text-[#c9b48a]">
                  <Upload className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#8a7a66]">Arraste o arquivo ou clique para escolher</p>
                    <p className="text-xs mt-1">Imagem: JPG, PNG, WEBP — máx. {MAX_IMAGE_MB}MB</p>
                    <p className="text-xs">Vídeo: MP4, WEBM, MOV — máx. {MAX_VIDEO_MB}MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Caption */}
            <div>
              <label className="text-xs font-medium text-[#8a7a66] block mb-1.5">Legenda (opcional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Vista do terreno que visitamos em março"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={cancelUpload} className="flex items-center gap-1 text-xs text-[#8a7a66] hover:text-[#5c3d1e] px-3 py-1.5 rounded-full border border-[#e8d5b0] transition-colors">
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  : <><Upload className="w-4 h-4" /> Enviar {previewType === 'video' ? 'vídeo' : 'imagem'}</>
                }
              </button>
            </div>
          </form>
        )}

        {/* Toolbar */}
        {user && !showUpload && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary flex items-center gap-2"
            >
              <ImagePlus className="w-4 h-4" /> Adicionar mídia
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#c9b48a]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-[#c9b48a]">
            <Images className="w-14 h-14 mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium text-[#8a7a66]">Nenhuma imagem ainda</p>
            <p className="text-sm mt-1">
              {user
                ? 'Clique em "Adicionar imagem" para começar sua galeria.'
                : 'Entre na sua conta para adicionar fotos à galeria.'}
            </p>
          </div>
        ) : (
          <div style={{ columns: 'var(--cols, 2)', columnGap: '0.875rem' }}
            className="[--cols:2] sm:[--cols:3]">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] break-inside-avoid mb-3 sm:mb-4"
              >
                {img.media_type === 'video' ? (
                  <video
                    src={img.url}
                    className="w-full h-auto block"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={img.url}
                    alt={img.caption || 'Inspiração do sítio'}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge de vídeo */}
                {img.media_type === 'video' && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <Film className="w-3 h-3" /> Vídeo
                  </div>
                )}

                {/* Caption */}
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-medium leading-tight line-clamp-2">{img.caption}</p>
                  </div>
                )}

                {/* Actions — sempre visível no mobile, só no hover no desktop */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                  {user && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(img.id); }}
                      className="p-2 md:p-1.5 bg-black/60 hover:bg-red-500 active:bg-red-500 text-white rounded-lg transition-colors backdrop-blur-sm"
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => openLightbox(idx)}
                    className="p-2 md:p-1.5 bg-black/60 hover:bg-white/30 active:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
                    aria-label={img.media_type === 'video' ? 'Reproduzir vídeo' : 'Ampliar imagem'}
                  >
                    {img.media_type === 'video'
                      ? <Play className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      : <ZoomIn className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    }
                  </button>
                </div>

                {/* Confirm delete overlay */}
                {confirmDelete === img.id && (
                  <div
                    className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-white text-sm font-semibold text-center">
                      Excluir {img.media_type === 'video' ? 'este vídeo' : 'esta imagem'}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDelete(img)}
                        className="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (() => {
          const imgCount = images.filter((i) => i.media_type === 'image').length;
          const vidCount = images.filter((i) => i.media_type === 'video').length;
          const parts = [];
          if (imgCount > 0) parts.push(`${imgCount} imagem${imgCount !== 1 ? 'ns' : ''}`);
          if (vidCount > 0) parts.push(`${vidCount} vídeo${vidCount !== 1 ? 's' : ''}`);
          return <p className="text-center text-xs text-[#c9b48a] mt-6">{parts.join(' · ')} na galeria</p>;
        })()}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleLightboxKey}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de imagens"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 sm:left-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 sm:right-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                aria-label="Próxima"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {images[lightboxIdx].media_type === 'video' ? (
              <video
                key={images[lightboxIdx].url}
                src={images[lightboxIdx].url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-xl shadow-2xl bg-black"
              />
            ) : (
              <img
                src={images[lightboxIdx].url}
                alt={images[lightboxIdx].caption || 'Inspiração'}
                className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            )}
            {images[lightboxIdx].caption && (
              <p className="text-white/80 text-center text-sm mt-3 font-medium">
                {images[lightboxIdx].caption}
              </p>
            )}
            <p className="text-white/40 text-center text-xs mt-1">
              {lightboxIdx + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
