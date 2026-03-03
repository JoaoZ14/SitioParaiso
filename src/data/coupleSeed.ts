import type {
  CoupleGoal, CoupleReference, CoupleTimelineItem, EmergencyFund,
} from '../types/couple';

const now = new Date().toISOString();

const addMonths = (n: number) => {
  const d = new Date(); d.setMonth(d.getMonth() + n); return d.toISOString();
};
const subMonths = (n: number) => {
  const d = new Date(); d.setMonth(d.getMonth() - n); return d.toISOString();
};

export const SEED_GOALS: CoupleGoal[] = [
  {
    id: 'sg1', title: 'Comprar um carro 0km',
    category: 'Finanças', type: 'financial',
    description: 'Carro para facilitar o dia a dia e as viagens de fim de semana.',
    priority: 'Alta', deadline: addMonths(18), status: 'active', isFocus: true,
    targetValue: 60000, savedValue: 18000, monthlyContribution: 2000,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'sg2', title: 'Pós-graduação em Design',
    category: 'Estudos', type: 'non-financial',
    description: 'MBA em Design Estratégico — 18 meses online.',
    priority: 'Média', deadline: addMonths(20), status: 'active', isFocus: false,
    progress: 0,
    checklist: [
      { id: 'ck1', text: 'Pesquisar e comparar instituições', done: true },
      { id: 'ck2', text: 'Realizar inscrição', done: true },
      { id: 'ck3', text: 'Pagar primeira mensalidade', done: false },
      { id: 'ck4', text: 'Iniciar módulo 1 — Fundamentos', done: false },
      { id: 'ck5', text: 'Concluir TCC', done: false },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'sg3', title: 'Viagem Europa — Portugal, Espanha e Itália',
    category: 'Viagens', type: 'financial',
    description: '21 dias pelos três países, primavera europeia.',
    priority: 'Média', deadline: addMonths(30), status: 'active', isFocus: false,
    targetValue: 35000, savedValue: 8500, monthlyContribution: 1000,
    createdAt: now, updatedAt: now,
  },
];

export const SEED_REFS: CoupleReference[] = [
  {
    id: 'sr1', title: 'Guia completo de Fundos Imobiliários',
    type: 'link', url: 'https://www.infomoney.com.br',
    tags: ['finanças', 'investimentos', 'FIIs'],
    notes: 'Ótimo guia para começar a investir em FIIs com segurança.',
    favorite: true, createdAt: now,
  },
  {
    id: 'sr2', title: 'Melhor época para visitar Portugal',
    type: 'link', url: 'https://www.tripadvisor.com.br',
    tags: ['viagens', 'europa', 'portugal'],
    notes: 'Primavera (abr–jun) e outono (set–out) são ideais — clima ameno e menos turistas.',
    favorite: false, createdAt: now,
  },
  {
    id: 'sr3', title: 'Rotina matinal para produtividade',
    type: 'note',
    tags: ['hábitos', 'saúde', 'produtividade'],
    notes: '6h → exercício → meditação 10min → journaling → café antes do trabalho.',
    favorite: true, createdAt: now,
  },
  {
    id: 'sr4', title: 'Trilha UX/UI — Alura',
    type: 'link', url: 'https://www.alura.com.br',
    tags: ['estudos', 'design', 'carreira'],
    notes: 'Trilha completa com certificado — bom complemento para a pós.',
    favorite: false, createdAt: now,
  },
  {
    id: 'sr5', title: 'Inspiração: apê escandinavo + plantas',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    tags: ['casa', 'decoração', 'minimalismo'],
    notes: 'Estilo que queremos para o próximo apartamento.',
    favorite: true, createdAt: now,
  },
  {
    id: 'sr6', title: 'Planilha de Orçamento do Casal',
    type: 'link', url: 'https://docs.google.com/spreadsheets',
    tags: ['finanças', 'organização'],
    notes: 'Template de controle financeiro compartilhado — atualizar toda segunda.',
    favorite: false, createdAt: now,
  },
];

export const SEED_TIMELINE: CoupleTimelineItem[] = [
  {
    id: 'st1', date: subMonths(10), title: 'Aniversário de 2 anos juntos',
    description: 'Viagem de fim de semana para Campos do Jordão.',
    type: 'Relacionamento', status: 'done',
  },
  {
    id: 'st2', date: subMonths(4), title: 'Mudança para o apartamento',
    description: 'Primeiro lar juntos! Reforma leve + decoração nova.',
    type: 'Conquista', status: 'done',
  },
  {
    id: 'st3', date: addMonths(2), title: 'Início da pós-graduação',
    description: 'MBA em Design Estratégico — primeiro módulo online.',
    type: 'Carreira', status: 'planned',
  },
  {
    id: 'st4', date: addMonths(7), title: 'Meta de promoção',
    description: 'Promoção com aumento de 30% — negociação planejada.',
    type: 'Carreira', status: 'planned',
  },
  {
    id: 'st5', date: addMonths(16), title: 'Comprar o carro',
    description: 'Atingir meta financeira e retirar o carro novo.',
    type: 'Financeiro', status: 'planned',
  },
  {
    id: 'st6', date: addMonths(28), title: 'Viagem Europa',
    description: 'Portugal, Espanha e Itália — 3 semanas inesquecíveis.',
    type: 'Viagem', status: 'planned',
  },
];

export const SEED_EMERGENCY: EmergencyFund = {
  monthlyExpenses: 8000,
  safetyMonths: 6,
  savedAmount: 22000,
};
