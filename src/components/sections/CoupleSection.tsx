import { useState, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Upload, Trash2,
  ImagePlus, Loader2, AlertCircle, Heart, Camera,
} from 'lucide-react';
import { useCouplePhotos } from '../../hooks/useCouplePhotos';
import type { CouplePhoto } from '../../hooks/useCouplePhotos';

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_MB = 10;

// Rotações fixas para efeito polaroid — cicla pelos índices
const ROTATIONS = [-2.5, 1.8, -1.2, 2.1, -0.8, 1.5, -2.0, 0.9, -1.6, 2.3];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function CoupleSection() {
  const { photos, loading, uploading, error, uploadPhoto, deletePhoto } = useCouplePhotos();

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Lightbox ── */
  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % photos.length : 0));
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxIdx(null);
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  /* ── Upload ── */
  const handleFileChange = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_MB * 1024 * 1024) { alert(`Máximo ${MAX_MB}MB.`); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    await uploadPhoto(selectedFile, caption.trim(), takenAt);
    setSelectedFile(null); setPreview(null); setCaption(''); setTakenAt('');
    setShowUpload(false);
  };

  const cancelUpload = () => {
    setSelectedFile(null); setPreview(null); setCaption(''); setTakenAt('');
    setShowUpload(false);
  };

  const handleDelete = async (photo: CouplePhoto) => {
    setConfirmDelete(null);
    await deletePhoto(photo);
    if (lightboxIdx !== null) setLightboxIdx(null);
  };

  return (
    <section id="couple" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#fffdf5] relative overflow-hidden">
      {/* Decorative background dots */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#4a7c59 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-divider" />
          <span className="text-[#c9748a] text-sm font-semibold uppercase tracking-widest">Só nosso</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5c3d1e] mt-2 mb-4">
            Nossa história em fotos
          </h2>
          <p className="text-[#8a7a66] text-lg max-w-xl mx-auto leading-relaxed">
            Os momentos que valem a pena guardar — e relembrar sempre.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Upload Form */}
        {showUpload && (
          <form onSubmit={handleUploadSubmit} className="card-paper p-5 mb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-[#5c3d1e] text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#c9748a]" /> Adicionar foto
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
                dragOver ? 'border-[#c9748a] bg-pink-50' : 'border-[#e8d5b0] hover:border-[#c9748a]/50 bg-[#fdf9f0]'
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full max-h-72 object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Clique para trocar</p>
                  </div>
                </div>
              ) : (
                <div className="py-14 flex flex-col items-center gap-3 text-[#c9b48a]">
                  <Camera className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#8a7a66]">Arraste a foto ou clique para escolher</p>
                    <p className="text-xs mt-1">JPG, PNG, WEBP — máx. {MAX_MB}MB</p>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#8a7a66] block mb-1.5">Legenda</label>
                <input type="text" className="input-field" placeholder="Ex: Nossa primeira viagem juntos"
                  value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#8a7a66] block mb-1.5">Data da foto (opcional)</label>
                <input type="date" className="input-field" value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={cancelUpload}
                className="flex items-center gap-1 text-xs text-[#8a7a66] hover:text-[#5c3d1e] px-3 py-1.5 rounded-full border border-[#e8d5b0] transition-colors">
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button type="submit" disabled={!selectedFile || uploading}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #c9748a, #a8556c)', color: 'white' }}>
                {uploading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</>
                  : <><Upload className="w-3.5 h-3.5" /> Salvar foto</>
                }
              </button>
            </div>
          </form>
        )}

        {/* Add button */}
        {!showUpload && (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #c9748a, #a8556c)', color: 'white' }}
            >
              <ImagePlus className="w-4 h-4" /> Adicionar foto
            </button>
          </div>
        )}

        {/* Masonry polaroid grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#c9b48a]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 text-[#c9b48a]">
            <Heart className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-base font-medium text-[#8a7a66]">Nenhuma foto ainda</p>
            <p className="text-sm mt-1">Adicione a primeira foto de vocês dois.</p>
          </div>
        ) : (
          /* CSS columns = masonry nativo, fotos mantêm proporção original */
          <div style={{ columns: 'var(--cols, 2)', columnGap: '1.75rem' }}
            className="[--cols:2] sm:[--cols:3] md:[--cols:4]">
            {photos.map((photo, idx) => {
              const rotation = ROTATIONS[idx % ROTATIONS.length];
              return (
                <div
                  key={photo.id}
                  className="group relative cursor-pointer break-inside-avoid mb-6 sm:mb-7"
                  style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.25s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`)}
                >
                  {/* Polaroid card */}
                  <div className="bg-white shadow-lg border border-[#e8d5b0]/60 p-2.5 pb-8 relative">
                    {/* Foto no tamanho natural */}
                    <div
                      className="overflow-hidden bg-[#f5ead0]"
                      onClick={() => setLightboxIdx(idx)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Nossa foto'}
                        className="w-full h-auto block"
                        loading="lazy"
                      />
                    </div>

                    {/* Caption area */}
                    <div className="mt-2 min-h-[28px] px-0.5">
                      {photo.caption && (
                        <p className="font-hand text-[#5c3d1e] text-sm leading-tight line-clamp-2 text-center">
                          {photo.caption}
                        </p>
                      )}
                      {photo.taken_at && (
                        <p className="text-[10px] text-[#c9b48a] text-center mt-0.5">
                          {formatDate(photo.taken_at)}
                        </p>
                      )}
                    </div>

                    {/* Delete button — sempre visível no mobile, só no hover no desktop */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(photo.id); }}
                      className="absolute top-1.5 right-1.5 p-1.5 md:p-1 bg-white/90 hover:bg-red-50 active:bg-red-50 text-[#c9b48a] hover:text-red-500 active:text-red-500 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm"
                      aria-label="Excluir foto"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-3 md:h-3" />
                    </button>
                  </div>

                  {/* Confirm delete */}
                  {confirmDelete === photo.id && (
                    <div
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3 z-10 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs font-semibold text-[#5c3d1e] text-center">Excluir esta foto?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-[#e8d5b0] text-[#8a7a66] hover:bg-[#f5ead0] transition-colors">
                          Não
                        </button>
                        <button onClick={() => handleDelete(photo)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold">
                          Sim
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {photos.length > 0 && (
          <p className="text-center text-xs text-[#c9b48a] mt-10 flex items-center justify-center gap-1.5">
            <Heart className="w-3 h-3 fill-[#c9748a] text-[#c9748a]" />
            {photos.length} memória{photos.length !== 1 ? 's' : ''} guardada{photos.length !== 1 ? 's' : ''}
            <Heart className="w-3 h-3 fill-[#c9748a] text-[#c9748a]" />
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
          onKeyDown={handleKey}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          <button onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 z-10">
            <X className="w-5 h-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 sm:left-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 z-10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 sm:right-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 z-10">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Polaroid no lightbox — mantém proporção original */}
            <div className="bg-white shadow-2xl p-3 pb-10 inline-block max-w-[min(90vw,520px)]">
              <img
                src={photos[lightboxIdx].url}
                alt={photos[lightboxIdx].caption || 'Nossa foto'}
                className="w-full h-auto block max-h-[70vh] object-contain"
              />
              <div className="mt-2 text-center">
                {photos[lightboxIdx].caption && (
                  <p className="font-hand text-[#5c3d1e] text-lg">{photos[lightboxIdx].caption}</p>
                )}
                {photos[lightboxIdx].taken_at && (
                  <p className="text-xs text-[#c9b48a] mt-1">{formatDate(photos[lightboxIdx].taken_at)}</p>
                )}
              </div>
            </div>
            <p className="text-white/40 text-center text-xs mt-4">
              {lightboxIdx + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
