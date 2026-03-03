-- ============================================================
--  Metas Gerais — Migração Supabase
--  Execute no SQL Editor do painel Supabase (https://app.supabase.com)
--  Project → SQL Editor → New query → cole e clique em Run
-- ============================================================

-- ── Tabela: metas ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.metas (
  id           TEXT PRIMARY KEY,                         -- gerado no client (genId)
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'Outros',
  description  TEXT NOT NULL DEFAULT '',
  priority     TEXT NOT NULL DEFAULT 'Média',
  deadline     TEXT,                                     -- ISO string ou null
  progress     INTEGER NOT NULL DEFAULT 0
               CHECK (progress >= 0 AND progress <= 100),
  checklist    JSONB NOT NULL DEFAULT '[]'::jsonb,       -- ChecklistItem[]
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'done')),
  pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice por usuário (queries sempre filtram por user_id)
CREATE INDEX IF NOT EXISTS metas_user_id_idx ON public.metas (user_id);

-- Row-Level Security
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Política: cada usuário só acessa suas próprias metas
CREATE POLICY "metas: owner full access"
  ON public.metas
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── Tabela: finance_meta ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.finance_meta (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  saved       NUMERIC NOT NULL DEFAULT 0,
  goal        NUMERIC NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_meta: owner full access"
  ON public.finance_meta
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
--  PRONTO!
--  Após rodar, abra o app e as metas serão salvas no Supabase.
--  Dados antigos do localStorage são ignorados (não migrados
--  automaticamente). Para migrar, use: localStorage.getItem('sp-metas')
--  e insira manualmente via painel Supabase → Table Editor.
-- ============================================================
