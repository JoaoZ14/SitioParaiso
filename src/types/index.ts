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
