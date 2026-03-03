export type GoalCategory =
  | 'Finanças' | 'Carreira' | 'Estudos' | 'Saúde'
  | 'Casa' | 'Viagens' | 'Projetos' | 'Relacionamento' | 'Outros';

export type GoalType     = 'financial' | 'non-financial';
export type GoalStatus   = 'active' | 'paused' | 'done';
export type GoalPriority = 'Alta' | 'Média' | 'Baixa';

export interface GoalChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CoupleGoal {
  id: string;
  title: string;
  category: GoalCategory;
  type: GoalType;
  description?: string;
  priority: GoalPriority;
  deadline?: string;
  status: GoalStatus;
  isFocus: boolean;
  // Financial
  targetValue?: number;
  savedValue?: number;
  monthlyContribution?: number;
  // Non-financial
  progress?: number;
  checklist?: GoalChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type ReferenceType = 'link' | 'image' | 'note';

export interface CoupleReference {
  id: string;
  title: string;
  type: ReferenceType;
  imageUrl?: string;
  url?: string;
  tags: string[];
  notes?: string;
  favorite: boolean;
  createdAt: string;
}

export type TimelineEventType =
  | 'Relacionamento' | 'Carreira' | 'Financeiro'
  | 'Viagem' | 'Projeto' | 'Conquista' | 'Outros';

export type TimelineStatus = 'planned' | 'done';

export interface CoupleTimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: TimelineEventType;
  status: TimelineStatus;
  optionalLink?: string;
}

export interface EmergencyFund {
  monthlyExpenses: number;
  safetyMonths: 3 | 6 | 9 | 12;
  savedAmount: number;
}

export type TabId = 'dashboard' | 'goals' | 'references' | 'timeline' | 'emergency';
