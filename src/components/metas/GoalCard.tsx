import { useState } from 'react';
import {
  CheckCircle2, Circle, Edit3, Trash2, ChevronDown, ChevronUp,
  Calendar, Flag, MoreVertical, Check, Bookmark, Minus, Plus,
  AlertTriangle, Bell,
} from 'lucide-react';
import type { Meta, ChecklistItem } from '../../types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from './constants';

interface Props {
  meta: Meta;
  isOverdue: boolean;
  today: Date;
  onEdit: (meta: Meta) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
  onChecklistToggle: (metaId: string, itemId: string) => void;
  onPin: (id: string) => void;
  onProgressChange: (id: string, progress: number) => void;
}

export default function GoalCard({
  meta, isOverdue, today, onEdit, onDelete, onToggleDone,
  onChecklistToggle, onPin, onProgressChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cat = CATEGORY_CONFIG[meta.category] ?? CATEGORY_CONFIG['Outros'];
  const pri = PRIORITY_CONFIG[meta.priority] ?? PRIORITY_CONFIG['Baixa'];

  const doneItems = meta.checklist.filter((i: ChecklistItem) => i.done).length;
  const totalItems = meta.checklist.length;
  const isDone = meta.status === 'done';

  const daysUntil = meta.deadline
    ? Math.ceil((new Date(meta.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7 && !isDone;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const daysLabel = (days: number) => {
    if (days === 0) return 'Hoje!';
    if (days === 1) return 'Amanhã';
    return `${days}d`;
  };

  const daysColor = (days: number) => {
    if (days === 0) return '#dc2626';
    if (days <= 2)  return '#ea580c';
    return '#d97706';
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(meta.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleProgressStep = (delta: number) => {
    const next = Math.max(0, Math.min(100, meta.progress + delta));
    onProgressChange(meta.id, next);
  };

  const visibleChecklist = expanded ? meta.checklist : meta.checklist.slice(0, 3);
  const hasMore = !expanded && meta.checklist.length > 3;

  return (
    <div
      className={`relative rounded-2xl bg-[#fffdf5] border shadow-[0_4px_20px_rgba(74,124,89,0.07)] hover:shadow-[0_8px_32px_rgba(74,124,89,0.16)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col ${
        isDone ? 'opacity-70' : ''
      } ${meta.pinned ? 'border-[#d97706]/50 ring-1 ring-[#d97706]/20' : 'border-[#e8d5b0]'}`}
    >
      {/* Pinned ribbon */}
      {meta.pinned && (
        <div className="absolute top-0 right-8 w-0 h-0"
          style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '12px solid #d97706' }}
        />
      )}

      {/* Category color accent */}
      <div className="h-1 flex-shrink-0" style={{ background: cat.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {/* Category badge */}
            <span
              className="tag-pill flex-shrink-0 flex items-center gap-1"
              style={{ background: cat.bg, color: cat.textColor }}
            >
              <cat.Icon className="w-3 h-3" />
              {meta.category}
            </span>

            {/* Overdue badge */}
            {isOverdue && (
              <span className="tag-pill flex-shrink-0 flex items-center gap-1" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <AlertTriangle className="w-3 h-3" />
                Atrasada
              </span>
            )}

            {/* Due soon badge */}
            {isDueSoon && !isOverdue && (
              <span
                className="tag-pill flex-shrink-0 flex items-center gap-1 animate-pulse"
                style={{ background: '#fef3c7', color: '#d97706' }}
              >
                <Bell className="w-3 h-3" />
                {daysLabel(daysUntil!)}
              </span>
            )}

            {/* Done badge */}
            {isDone && (
              <span className="tag-pill flex-shrink-0 flex items-center gap-1" style={{ background: '#d1fae5', color: '#065f46' }}>
                <CheckCircle2 className="w-3 h-3" />
                Concluída
              </span>
            )}
          </div>

          {/* Pin + 3-dot menu */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => onPin(meta.id)}
              title={meta.pinned ? 'Desafixar' : 'Fixar no topo'}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                meta.pinned
                  ? 'text-[#d97706] hover:bg-[#fef3c7]'
                  : 'text-[#e8d5b0] hover:text-[#d97706] hover:bg-[#fef3c7]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={meta.pinned ? 'currentColor' : 'none'} />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-7 h-7 rounded-full hover:bg-[#f5ead0] flex items-center justify-center text-[#8a7a66] transition-colors"
                aria-label="Opções"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 bg-white border border-[#e8d5b0] rounded-xl shadow-xl z-20 py-1 min-w-[152px]">
                    <button
                      onClick={() => { onEdit(meta); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#5c3d1e] hover:bg-[#f5ead0] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#8a7a66]" /> Editar
                    </button>
                    <button
                      onClick={() => { onToggleDone(meta.id); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#5c3d1e] hover:bg-[#f5ead0] transition-colors"
                    >
                      {isDone
                        ? <><Circle className="w-3.5 h-3.5 text-[#8a7a66]" /> Reabrir</>
                        : <><CheckCircle2 className="w-3.5 h-3.5 text-[#6aab7e]" /> Concluir</>
                      }
                    </button>
                    <button
                      onClick={() => { onPin(meta.id); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#5c3d1e] hover:bg-[#f5ead0] transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#d97706]" />
                      {meta.pinned ? 'Desafixar' : 'Fixar no topo'}
                    </button>
                    <div className="border-t border-[#f5ead0] my-1" />
                    <button
                      onClick={handleDeleteClick}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                        confirmDelete
                          ? 'bg-red-50 text-red-600 font-semibold'
                          : 'text-red-400 hover:bg-red-50 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {confirmDelete ? 'Confirmar exclusão?' : 'Excluir'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-serif text-lg leading-snug mb-1 ${
            isDone ? 'line-through text-[#c9b48a]' : 'text-[#2d5a3d]'
          }`}
        >
          {meta.title}
        </h3>

        {/* Description */}
        {meta.description && (
          <p className="text-sm text-[#8a7a66] mb-3 line-clamp-2 leading-relaxed">{meta.description}</p>
        )}

        {/* Notes */}
        {meta.notes && (
          <div className="bg-[#fef9ec] border border-[#f5ead0] rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-[#8a7a66] font-hand leading-relaxed line-clamp-2">"{meta.notes}"</p>
          </div>
        )}

        {/* Progress bar with quick +/- controls */}
        <div className="mb-4 mt-1">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#8a7a66]">Progresso</span>
              {!isDone && (
                <>
                  <button
                    onClick={() => handleProgressStep(-10)}
                    disabled={meta.progress <= 0}
                    className="w-5 h-5 rounded-md bg-[#f5ead0] hover:bg-[#e8d5b0] disabled:opacity-30 flex items-center justify-center text-[#8a7a66] transition-colors"
                    title="-10%"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => handleProgressStep(10)}
                    disabled={meta.progress >= 100}
                    className="w-5 h-5 rounded-md bg-[#4a7c59]/10 hover:bg-[#4a7c59]/20 disabled:opacity-30 flex items-center justify-center text-[#4a7c59] transition-colors"
                    title="+10%"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>
            <span className="text-xs font-bold" style={{ color: isDone ? '#6aab7e' : cat.color }}>
              {meta.progress}%
            </span>
          </div>
          <div className="h-2 bg-[#f5ead0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-bar-inner"
              style={{
                width: `${meta.progress}%`,
                background: isDone
                  ? 'linear-gradient(90deg, #6aab7e, #4a7c59)'
                  : `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
              }}
            />
          </div>
        </div>

        {/* Footer: priority + deadline */}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={{ background: pri.bg, color: pri.text, borderColor: pri.border }}
            >
              <Flag className="w-2.5 h-2.5" /> {meta.priority}
            </span>

            {meta.deadline && (
              <span
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-red-500 font-medium' :
                  isDueSoon  ? 'font-medium' : 'text-[#8a7a66]'
                }`}
                style={isDueSoon && !isOverdue ? { color: daysColor(daysUntil!) } : {}}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(meta.deadline)}
              </span>
            )}
          </div>

          {/* Checklist toggle */}
          {totalItems > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-[#8a7a66] hover:text-[#4a7c59] transition-colors"
            >
              <Check className="w-3 h-3" />
              {doneItems}/{totalItems}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Checklist expanded */}
        {expanded && totalItems > 0 && (
          <div className="mt-3 pt-3 border-t border-[#f0e8d0] space-y-2">
            {visibleChecklist.map((item: ChecklistItem) => (
              <button
                key={item.id}
                onClick={() => onChecklistToggle(meta.id, item.id)}
                className="flex items-center gap-2 w-full text-left group"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.done
                      ? 'bg-[#4a7c59] border-[#4a7c59]'
                      : 'border-[#c9b48a] group-hover:border-[#4a7c59]'
                  }`}
                >
                  {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`text-xs leading-snug ${item.done ? 'line-through text-[#c9b48a]' : 'text-[#5c3d1e]'}`}>
                  {item.text}
                </span>
              </button>
            ))}
            {hasMore && (
              <p className="text-xs text-[#c9b48a] pl-6">+{meta.checklist.length - 3} itens...</p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f5ead0]">
          <button
            onClick={() => onToggleDone(meta.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDone
                ? 'bg-[#f5ead0] text-[#8a7a66] hover:bg-[#e8d5b0]'
                : 'bg-[#4a7c59]/10 text-[#4a7c59] hover:bg-[#4a7c59]/20'
            }`}
          >
            {isDone
              ? <><Circle className="w-3.5 h-3.5" /> Reabrir</>
              : <><CheckCircle2 className="w-3.5 h-3.5" /> Concluir</>
            }
          </button>
          <button
            onClick={() => onEdit(meta)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-[#f5ead0] text-[#8a7a66] hover:bg-[#e8d5b0] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}
