import { useState } from 'react';
import { Plus, Pencil, Trash2, PawPrint, X, Check, Loader2 } from 'lucide-react';
import {
  GiChicken, GiSittingDog, GiHorseHead, GiBull, GiGoat,
  GiDuck, GiPig, GiCat, GiPawPrint,
} from 'react-icons/gi';
import type { IconType } from 'react-icons';
import { useAnimals } from '../../hooks/useAnimals';
import type { Animal, AnimalType } from '../../types';

const ANIMAL_TYPES: AnimalType[] = ['Galinha', 'Cachorro', 'Cavalo', 'Boi', 'Cabra', 'Pato', 'Porco', 'Gato', 'Outro'];

const ANIMAL_ICONS: Record<string, IconType> = {
  Galinha: GiChicken,
  Cachorro: GiSittingDog,
  Cavalo: GiHorseHead,
  Boi: GiBull,
  Cabra: GiGoat,
  Pato: GiDuck,
  Porco: GiPig,
  Gato: GiCat,
  Outro: GiPawPrint,
};

function AnimalIcon({ type, size = 20 }: { type: string; size?: number }) {
  const Icon = ANIMAL_ICONS[type] ?? GiPawPrint;
  return <Icon size={size} />;
}

const emptyForm = { type: 'Galinha' as AnimalType, name: '', qty: 1, notes: '' };

export default function AnimalsCard() {
  const { animals, loading, addAnimal, updateAnimal, deleteAnimal } = useAnimals();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('Todos');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) {
      await updateAnimal(editId, { ...form, qty: Number(form.qty) });
      setEditId(null);
    } else {
      await addAnimal({ ...form, qty: Number(form.qty) });
    }
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleEdit = (animal: Animal) => {
    setForm({ type: animal.type as AnimalType, name: animal.name, qty: animal.qty, notes: animal.notes });
    setEditId(animal.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAnimal(id);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const presentTypes = [...new Set(animals.map((a) => a.type))];
  const filtered = filterType === 'Todos' ? animals : animals.filter((a) => a.type === filterType);
  const totalAnimals = animals.reduce((sum, a) => sum + Number(a.qty), 0);

  return (
    <div className="card-paper flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-[#e8d5b0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#5c3d1e] text-base">Animais</h3>
            <p className="text-xs text-[#8a7a66]">{animals.length} espécie{animals.length !== 1 ? 's' : ''} · {totalAnimals} animal{totalAnimals !== 1 ? 'is' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-1.5 bg-[#4a7c59] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#2d5a3d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Novo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-[#e8d5b0] bg-[#fdf9f0] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8a7a66] block mb-1">Tipo</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AnimalType }))}
                aria-label="Tipo de animal"
              >
                {ANIMAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8a7a66] block mb-1">Quantidade</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.qty}
                onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                aria-label="Quantidade"
              />
            </div>
          </div>
          <input
            className="input-field"
            placeholder="Nome ou apelido (ex: Caramelo)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            aria-label="Nome"
            required
          />
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Observações (raça, origem, cuidados...)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            aria-label="Observações"
          />
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

      {animals.length > 0 && presentTypes.length > 1 && (
        <div className="px-4 pt-3 pb-1 flex gap-1.5 flex-wrap">
          {(['Todos', ...presentTypes]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                filterType === type
                  ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                  : 'border-[#e8d5b0] text-[#8a7a66] hover:border-[#4a7c59] hover:text-[#4a7c59]'
              }`}
            >
              {type !== 'Todos' && <AnimalIcon type={type} size={12} />}
              {type}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[340px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-[#c9b48a]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-[#c9b48a]">
            <PawPrint className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Nenhum animal cadastrado</p>
            <p className="text-xs mt-1 opacity-70">Adicione os futuros moradores do sítio</p>
          </div>
        ) : (
          filtered.map((animal) => (
            <div key={animal.id} className="group bg-white rounded-xl p-3 border border-[#e8d5b0] hover:border-[#4a7c59]/30 transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#e8f4ed] flex items-center justify-center text-[#4a7c59]">
                  <AnimalIcon type={animal.type} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#5c3d1e] text-sm">{animal.name}</span>
                    <span className="text-[10px] bg-[#e8f4ed] text-[#4a7c59] px-2 py-0.5 rounded-full font-medium">{animal.qty}x {animal.type}</span>
                  </div>
                  {animal.notes && <p className="text-xs text-[#8a7a66] mt-0.5 truncate">{animal.notes}</p>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => handleEdit(animal)} className="p-1 text-[#8a7a66] hover:text-[#4a7c59] transition-colors" aria-label="Editar">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(animal.id)} className="p-1 text-[#8a7a66] hover:text-red-500 transition-colors" aria-label="Excluir">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
