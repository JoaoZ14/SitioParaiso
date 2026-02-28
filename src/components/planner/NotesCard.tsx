import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, X, Check, StickyNote, Loader2 } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import type { Note, NoteTag } from '../../types';

const TAG_STYLES: Record<NoteTag, string> = {
  Ideia: 'bg-yellow-100 text-yellow-800',
  Compra: 'bg-blue-100 text-blue-800',
  Reforma: 'bg-orange-100 text-orange-800',
  Lembrete: 'bg-purple-100 text-purple-800',
};

const TAGS: NoteTag[] = ['Ideia', 'Compra', 'Reforma', 'Lembrete'];

const emptyForm = { title: '', content: '', tag: 'Ideia' as NoteTag };

export default function NotesCard() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<NoteTag | 'Todas'>('Todas');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    if (editId) {
      await updateNote(editId, form);
      setEditId(null);
    } else {
      await addNote(form);
    }
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleEdit = (note: Note) => {
    setForm({ title: note.title, content: note.content, tag: note.tag });
    setEditId(note.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const filtered = filterTag === 'Todas' ? notes : notes.filter((n) => n.tag === filterTag);

  return (
    <div className="card-paper flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#e8d5b0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#5c3d1e] text-base">Anotações</h3>
            <p className="text-xs text-[#8a7a66]">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-1.5 bg-[#4a7c59] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#2d5a3d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Nova
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-[#e8d5b0] bg-[#fdf9f0] space-y-3">
          <input
            className="input-field"
            placeholder="Título da anotação"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            aria-label="Título"
            required
          />
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Escreva aqui sua anotação..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            aria-label="Conteúdo"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#8a7a66] font-medium">Tag:</span>
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setForm((f) => ({ ...f, tag }))}
                className={`tag-pill transition-all ${TAG_STYLES[tag]} ${form.tag === tag ? 'ring-2 ring-offset-1 ring-[#4a7c59]' : 'opacity-60 hover:opacity-100'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="flex items-center gap-1 text-xs text-[#8a7a66] hover:text-[#5c3d1e] px-3 py-1.5 rounded-full border border-[#e8d5b0] transition-colors">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-1 text-xs bg-[#4a7c59] text-white px-3 py-1.5 rounded-full hover:bg-[#2d5a3d] transition-colors font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      {notes.length > 0 && (
        <div className="px-4 pt-3 pb-1 flex gap-1.5 flex-wrap">
          {(['Todas', ...TAGS] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                filterTag === tag
                  ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                  : 'border-[#e8d5b0] text-[#8a7a66] hover:border-[#4a7c59] hover:text-[#4a7c59]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-[#c9b48a]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-[#c9b48a]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Nenhuma anotação ainda</p>
            <p className="text-xs mt-1 opacity-70">Clique em "Nova" para começar</p>
          </div>
        ) : (
          filtered.map((note) => (
            <div key={note.id} className="group bg-white rounded-xl p-3.5 border border-[#e8d5b0] hover:border-[#4a7c59]/30 transition-all">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`tag-pill flex-shrink-0 ${TAG_STYLES[note.tag]}`}>{note.tag}</span>
                  <h4 className="font-semibold text-[#5c3d1e] text-sm truncate">{note.title}</h4>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleEdit(note)} className="p-1 text-[#8a7a66] hover:text-[#4a7c59] transition-colors" aria-label="Editar">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1 text-[#8a7a66] hover:text-red-500 transition-colors" aria-label="Excluir">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {note.content && <p className="text-xs text-[#8a7a66] leading-relaxed line-clamp-2">{note.content}</p>}
              <p className="text-[10px] text-[#c9b48a] mt-1.5">
                {new Date(note.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
