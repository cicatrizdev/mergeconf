# MergeConf 2026 🎤

A conferência onde tudo se junta — com conflitos.

App que gerencia a grade de palestras, inscrições e check-in da MergeConf, além da área do organizador. Foi feito em 3 semanas por voluntários antes da 1ª edição (2023) e, desde então, cada edição alguém "só deu uma mexidinha". A edição 2026 vem aí — e o backlog está honesto.

Este é o projeto do curso **Cursor: IA no Dia a Dia do Dev** (Alura). Os bugs e as features faltantes são **de propósito**: cada ticket do backlog é resolvido ao longo do curso.

## Stack

- React 19 + Vite + TypeScript
- TailwindCSS 4 + componentes estilo shadcn/ui
- React Router 7
- API Node.js + Express (porta 3434)
- Supabase/PostgreSQL (schema e seed em `supabase/`)
- Vitest + Testing Library · Playwright (e2e)

## Pré-requisitos

- Node.js 20+
- npm

## Como rodar

```bash
npm install
npm run dev
```

Sobe a API (http://localhost:3434) e o app (http://localhost:5173) juntos. A API usa dados em memória — não precisa de banco para rodar.

```bash
npm test        # testes unitários
npm run e2e     # e2e (antes, uma vez: npx playwright install chromium)
```

## Atalhos usados no curso

As aulas são gravadas no macOS. No Windows e no Linux, a regra geral é trocar `Cmd` por `Ctrl`:

| Ação | macOS | Windows / Linux |
|------|-------|-----------------|
| Aceitar sugestão do Tab | `Tab` | `Tab` |
| Aceitar sugestão palavra a palavra | `Cmd + →` | `Ctrl + →` |
| Descartar sugestão | `Esc` | `Esc` |
| Edição inline (editor e terminal) | `Cmd + K` | `Ctrl + K` |

Se algum atalho não bater com a sua instalação, confira em Settings → Keyboard Shortcuts no próprio Cursor — os atalhos podem mudar entre versões.

## Estrutura

```
mergeconf/
├── api/          ← API Express (server, dados, inscrições, alocação de salas)
├── src/
│   ├── components/   ← TalkCard, GradeHorarios, MinhaAgendaDrawer, FormInscricao
│   ├── components/ui ← button, card, badge, input (estilo shadcn)
│   ├── pages/        ← Grade, PalestraDetalhe, CheckIn, Organizador
│   └── lib/          ← api client, formatação, cn()
├── supabase/     ← migrations + seed (usados a partir do Módulo 4 do curso)
└── e2e/          ← smoke tests Playwright
```
