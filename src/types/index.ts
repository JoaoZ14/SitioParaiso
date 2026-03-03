export interface Note {
  id: string;
  title: string;
  content: string;
  tag: 'Ideia' | 'Compra' | 'Reforma' | 'Lembrete';
  createdAt: string;
}

export interface Animal {
  id: string;
  type: string;
  name: string;
  qty: number;
  notes: string;
}

export interface Cost {
  id: string;
  item: string;
  category: 'Construção' | 'Animais' | 'Ferramentas' | 'Jardim/Horta' | 'Documentação' | 'Outros';
  value: number;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface Finance {
  saved: number;
  goal: number;
}

export type NoteTag = Note['tag'];
export type AnimalType = 'Galinha' | 'Cachorro' | 'Cavalo' | 'Boi' | 'Cabra' | 'Pato' | 'Porco' | 'Gato' | 'Outro';
export type CostCategory = Cost['category'];
export type Priority = Cost['priority'];

// ─── Metas Gerais ────────────────────────────────────────────

export type MetaCategory =
  | 'Finanças'
  | 'Sítio'
  | 'Casa'
  | 'Saúde'
  | 'Carreira'
  | 'Relacionamento'
  | 'Viagens'
  | 'Estudos'
  | 'Outros';

export type MetaPriority = 'Alta' | 'Média' | 'Baixa';
export type MetaStatus = 'active' | 'done';
export type FilterType = 'all' | 'active' | 'done' | 'overdue';
export type SortType = 'priority' | 'deadline' | 'progress' | 'created';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Meta {
  id: string;
  title: string;
  category: MetaCategory;
  description: string;
  priority: MetaPriority;
  deadline: string;
  progress: number;
  checklist: ChecklistItem[];
  status: MetaStatus;
  createdAt: string;
  pinned?: boolean;
  notes?: string;
}

export interface FinanceMeta {
  saved: number;
  goal: number;
}
