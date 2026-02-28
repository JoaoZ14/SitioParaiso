# 🌿 Sítio Paraíso

**Planejando nosso futuro no campo — juntos.**

Landing page completa e responsiva para o planejamento do nosso sítio/rancho.  
Anotações, animais, custos e meta financeira — tudo salvo localmente no navegador.

---

## ✨ Funcionalidades

- **Navbar** fixa com transição transparente → sólida ao rolar
- **Hero** com imagem de fundo, headline e cards de destaque
- **Visão do Sítio** com sonhos/planos e linha do tempo
- **Painel de Planejamento** com 4 cards funcionais:
  - 📝 **Anotações** — CRUD com tags (Ideia, Compra, Reforma, Lembrete)
  - 🐾 **Animais** — CRUD com tipo, nome, quantidade e observações
  - 💸 **Custos** — CRUD com categoria, prioridade, total por categoria
  - 🎯 **Meta Financeira** — barra de progresso animada, sugestão de meta
- **Galeria** com lightbox (9 imagens do Unsplash)
- **Como Usamos** — 3 passos com ícones
- **Rodapé** com data atual

## 🗃️ Dados persistidos (LocalStorage)

| Chave | Descrição |
|-------|-----------|
| `sp_notes` | Anotações |
| `sp_animals` | Animais cadastrados |
| `sp_costs` | Custos planejados |
| `sp_finance` | Meta e dinheiro guardado |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 20.19+ (ou 22.12+)
- npm

### Instalar e rodar

```bash
npm install
npm run dev
```

Acesse: **http://localhost:5173**

### Build de produção

```bash
npm run build
npm run preview
```

---

## 🛠️ Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **TailwindCSS 4** (com `@tailwindcss/vite`)
- **lucide-react** (ícones)
- **LocalStorage** (sem backend)

---

## 📁 Estrutura

```
src/
├── components/
│   ├── planner/
│   │   ├── NotesCard.tsx
│   │   ├── AnimalsCard.tsx
│   │   ├── CostsCard.tsx
│   │   └── FinanceCard.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── VisionSection.tsx
│   │   ├── PlannerDashboard.tsx
│   │   ├── Gallery.tsx
│   │   └── HowToUse.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   └── useFinanceCalc.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

*Feito com ❤️ para o nosso futuro no campo.*
