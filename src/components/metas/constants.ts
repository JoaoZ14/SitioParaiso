import type { LucideIcon } from 'lucide-react';
import {
  DollarSign, Sprout, Home, Heart, Briefcase,
  Users, Plane, BookOpen, Star,
} from 'lucide-react';
import type { MetaCategory } from '../../types';

export interface CategoryConfig {
  Icon: LucideIcon;
  color: string;
  bg: string;
  textColor: string;
  label: string;
}

export const CATEGORY_CONFIG: Record<MetaCategory, CategoryConfig> = {
  'Finanças':      { Icon: DollarSign, color: '#d97706', bg: '#fef3c7', textColor: '#92400e', label: 'Finanças' },
  'Sítio':         { Icon: Sprout,     color: '#4a7c59', bg: '#d1fae5', textColor: '#065f46', label: 'Sítio' },
  'Casa':          { Icon: Home,       color: '#8b6914', bg: '#fef9c3', textColor: '#713f12', label: 'Casa' },
  'Saúde':         { Icon: Heart,      color: '#16a34a', bg: '#dcfce7', textColor: '#166534', label: 'Saúde' },
  'Carreira':      { Icon: Briefcase,  color: '#6366f1', bg: '#e0e7ff', textColor: '#3730a3', label: 'Carreira' },
  'Relacionamento':{ Icon: Users,      color: '#e11d48', bg: '#ffe4e6', textColor: '#9f1239', label: 'Relacionamento' },
  'Viagens':       { Icon: Plane,      color: '#0891b2', bg: '#cffafe', textColor: '#155e75', label: 'Viagens' },
  'Estudos':       { Icon: BookOpen,   color: '#7c3aed', bg: '#ede9fe', textColor: '#4c1d95', label: 'Estudos' },
  'Outros':        { Icon: Star,       color: '#8a7a66', bg: '#f5ead0', textColor: '#5c3d1e', label: 'Outros' },
};

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as MetaCategory[];

export const PRIORITY_CONFIG = {
  Alta:  { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5', label: 'Alta' },
  Média: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d', label: 'Média' },
  Baixa: { bg: '#dcfce7', text: '#16a34a', border: '#86efac', label: 'Baixa' },
};
