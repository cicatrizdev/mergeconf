# CUR-04 — Lista de espera para talks lotadas

> Plano de ação para implementar a feature. Gerado a partir do ticket do Linear e da leitura do código em `api/` e `src/`. As decisões da seção 3 já foram tomadas com o responsável pelo ticket e não devem ser reabertas sem consulta.

## 1. Contexto e objetivo

Talks lotadas hoje simplesmente recusam a inscrição: `criarInscricao` lança `ErroInscricao('lotada')` e o formulário mostra a string crua "Palestra lotada" em vermelho. A comunidade pede lista de espera desde a edição passada.

Resultado esperado ao final:

- Inscrição em talk lotada entra como **em espera**, com posição visível na fila.
- Cancelamento de uma inscrição confirmada libera a vaga e **promove automaticamente** o primeiro da fila.
- Participante pode **sair da fila**.
- A UI diferencia claramente **Inscrito** de **Em espera**.
- As regras de promoção têm testes.

## 2. Como o sistema funciona hoje

Mapa para quem vai implementar. Tudo em português (identificadores, colunas, mensagens, testes).

| Camada | Onde | O que importa |
|---|---|---|
| Tipos | `src/types.ts` | Compartilhado com a API (`api/*` importa de `../src/types`). `Inscricao` não tem status. Capacidade = `Palestra.vagas` vs contador `Palestra.inscritos`. |
| Regras | `api/inscricoes.ts` | `criarInscricao`: normaliza e-mail → checa duplicata → checa lotação → delay de 150ms → `repo.criarInscricao` → `repo.atualizarPalestra({ inscritos + 1 })`. Também `listarInscricoesPorEmail` e `fazerCheckin`. |
| Repositório | `api/repositorio.ts` | Interface `Repositorio` e singleton `repo` (Supabase com `.env`, memória sem). Implementações em `api/repositorio-memoria.ts` (muta os arrays de `api/dados.ts`) e `api/repositorio-supabase.ts` (tabelas `palestras` e `inscricoes`, colunas snake_case). |
| Schema | `supabase/migrations/0001_schema.sql`, `supabase/seed.sql` | `inscricoes` sem coluna de status. Seed em SQL é espelho de `api/dados.ts`. |
| HTTP | `api/server.ts` | `POST /api/inscricoes` (201; `ErroInscricao` vira 404 para `nao-encontrada`, 409 para o resto, corpo `{ erro, codigo }`), `GET /api/inscricoes?email=`, `POST /api/checkin`. Não existe DELETE. |
| Client | `src/lib/api.ts` | `ErroApi(mensagem, codigo)`, `inscrever`, `buscarInscricoes`, `fazerCheckin`. Helper `json()` assume corpo na resposta. |
| Formulário | `src/components/FormInscricao.tsx` | Estados `parado / enviando / sucesso / erro`. Só trata `codigo === 'duplicada'`. Submit é `<div onClick>` (bug plantado CUR-09, não corrigir). |
| Check-in | `src/pages/CheckIn.tsx` | Busca por e-mail, lista `InscricaoComPalestra`, mostra "Presente" ou botão "Check-in". |
| Agenda | `src/hooks/useAgenda.ts`, `src/components/MinhaAgendaDrawer.tsx` | localStorage `mergeconf:agenda` guardando `Palestra[]`. Drawer tem dois bugs plantados (CUR-13 `remover` sem chamada, CUR-14 `totalHoras` só de talks), não corrigir. |
| Badge | `src/components/ui/badge.tsx` | Variantes por trilha + `neutro`, via união de tipos e `Record`. |
| Cards | `src/components/TalkCard.tsx`, `src/pages/PalestraDetalhe.tsx` | Mostram `vagasRestantes`; com 0 vagas exibem "0 vagas". |
| Testes | `api/inscricoes.test.ts`, `src/components/FormInscricao.test.tsx` | Vitest + Testing Library. API testa contra o repositório em memória e desfaz mutações no `afterEach`. Frontend mocka `../lib/api` com `importOriginal`. Frases de `it()` em português. |

Seed útil para demo: talk **Kubernetes** (`00000000-0000-0000-0000-000000000011`), 30 vagas e 29 inscritos.

## 3. Decisões já tomadas

| Tema | Decisão |
|---|---|
| Cancelamento | Um endpoint único `DELETE /api/inscricoes/:id`. Cancela inscrição confirmada (libera vaga e promove) **e** tira da fila. |
| Resposta do DELETE | `204` sem corpo. `404 { erro, codigo: 'nao-encontrada' }` se não existir. |
| Modelo | `Inscricao.status: 'confirmada' \| 'em-espera'`. Posição **derivada** na leitura pela ordem de `criadaEm`, exposta como `posicaoFila?: number`. Sem coluna de posição. |
| Backends | Memória e Supabase. Migration `0002` e seed atualizados. |
| Scaffold do curso | **Preservar** os bugs plantados: CUR-03 (normalização no repositório), CUR-05 (check e incremento não atômicos, sem constraint), CUR-09 (`<div onClick>`), CUR-13 (`remover` sem chamada), CUR-14 (`totalHoras`). |
| UI | Três lugares: FormInscricao (página da palestra), página `/checkin` e drawer Minha Agenda. |
| Agenda local | Formato evolui para `{ palestra, inscricaoId?, status }`. Itens antigos (Palestra crua) são lidos como confirmada sem ação de cancelar. |
| Rótulo Lotada | TalkCard mostra "Lotada" e PalestraDetalhe mostra "Lotada · lista de espera" quando `vagasRestantes <= 0`. |
| Erro `'lotada'` | Removido do union. Novo código `'em-espera'` recusa check-in de quem está na fila. |
| Organizador | Fora de escopo. Vira follow-up. |

## 4. Regras de negócio detalhadas

1. `inscritos` conta **só confirmadas**. Entrar ou sair da fila não altera `inscritos`.
2. Talk lotada (`inscritos >= vagas`): a inscrição é criada com `status: 'em-espera'`. A checagem de duplicata continua valendo, então o mesmo e-mail já na fila recebe `duplicada`.
3. Posição = índice 1-based entre as inscrições `em-espera` da mesma palestra, ordenadas por `criadaEm` ascendente. No Supabase desempata por `id`. Na memória o sort é estável.
4. Cancelar confirmada: remove a inscrição, decrementa `inscritos`, chama `promoverPrimeiroDaFila`. Se há fila, o primeiro vira `confirmada` e `inscritos` volta a subir. Saldo líquido zero.
5. Cancelar em-espera: remove a inscrição. Quem vem depois sobe sozinho, porque a posição é derivada.
6. Check-in de inscrição em espera é recusado com `ErroInscricao('em-espera')`, HTTP 409.
7. Cancelar inscrição inexistente lança `nao-encontrada`, HTTP 404. Cancelar confirmada com check-in feito é permitido na API. A UI apenas não oferece o botão nesse caso.
8. Não há notificação na promoção (fica para CUR-12). Não há atomicidade (CUR-05, deliberado).

## 5. Etapas de implementação

Cada etapa termina num checkpoint verificável. Executar em ordem e revisar antes de seguir.

### Etapa 1 — Tipos, seed e migration

Checkpoint: compila ao final da Etapa 2.

- `src/types.ts`: criar `export type StatusInscricao = 'confirmada' | 'em-espera'`. Em `Inscricao`, adicionar `status: StatusInscricao` e `posicaoFila?: number` (derivado, presente só em espera, nunca persistido). `InscricaoComPalestra` herda sem mudança.
- `api/dados.ts`: adicionar `status: 'confirmada'` nas três inscrições do seed. Não seedar inscrição em espera.
- `supabase/migrations/0002_lista_de_espera.sql` (novo):

```sql
-- CUR-04: lista de espera. Posição na fila é derivada (ordem de criada_em), não persistida.
alter table inscricoes
  add column status text not null default 'confirmada'
  check (status in ('confirmada', 'em-espera'));

create index idx_inscricoes_fila on inscricoes (palestra_id, criada_em)
  where status = 'em-espera';
```

  Sem constraint de capacidade (CUR-05 fica intacto).

- `supabase/seed.sql`: incluir a coluna `status` com `'confirmada'` nos inserts de inscrições, para manter o espelho de `dados.ts`.

### Etapa 2 — Repositório

Checkpoint: `npx tsc --noEmit` e `npm test` verdes.

- `api/repositorio.ts`: adicionar à interface `Repositorio`:

```ts
criarInscricao(inscricao: Omit<Inscricao, 'id' | 'posicaoFila'>): Promise<Inscricao>
buscarInscricao(id: string): Promise<Inscricao | undefined>
listarFilaDaPalestra(palestraId: string): Promise<Inscricao[]> // só em-espera, criadaEm asc
atualizarInscricao(id: string, mudancas: Pick<Inscricao, 'status'>): Promise<Inscricao | undefined>
removerInscricao(id: string): Promise<void>
```

- `api/repositorio-memoria.ts`: `buscarInscricao` com `find`; `listarFilaDaPalestra` com `filter` por `palestraId` e `status === 'em-espera'` seguido de `sort` por `criadaEm` (`localeCompare`); `atualizarInscricao` com `Object.assign` como em `atualizarPalestra`; `removerInscricao` com `findIndex` e `splice` no array `inscricoes` de `dados.ts`. Não tocar em `buscarInscricaoExata`.
- `api/repositorio-supabase.ts`: `LinhaInscricao` ganha `status`; `paraInscricao` mapeia `status`; `criarInscricao` inclui `status` no `insert`; `buscarInscricao` com `.eq('id', id).maybeSingle()`; `listarFilaDaPalestra` com `.eq('palestra_id', palestraId).eq('status', 'em-espera').order('criada_em').order('id')`; `atualizarInscricao` com `.update({ status }).eq('id', id).select().maybeSingle()`; `removerInscricao` com `.delete().eq('id', id)`. Erros lançados como `Error('Supabase: ...')`, igual aos demais.

### Etapa 3 — Regras de negócio e testes

Checkpoint: `npx vitest run api` verde.

`api/inscricoes.ts`:

- `ErroInscricao.codigo` passa a ser `'nao-encontrada' | 'duplicada' | 'em-espera'`. O código `'lotada'` some.
- `criarInscricao`: manter busca da palestra, duplicata e o delay de 150ms. Trocar o `throw` de lotada por:

```ts
const lotada = palestra.inscritos >= palestra.vagas
// ...delay de 150ms inalterado
const inscricao = await repo.criarInscricao({
  palestraId,
  nome,
  email: emailNormalizado,
  criadaEm: new Date().toISOString(),
  checkinEm: null,
  status: lotada ? 'em-espera' : 'confirmada',
})
if (lotada) return comPosicao(inscricao)
await repo.atualizarPalestra(palestraId, { inscritos: palestra.inscritos + 1 })
return inscricao
```

- Helpers `posicaoNaFila(inscricao)` (retorna `undefined` se não está em espera; senão `findIndex` na fila + 1) e `comPosicao(inscricao)` (espalha `posicaoFila` quando definido).
- `promoverPrimeiroDaFila(palestraId)`: busca a palestra; retorna `undefined` se não existe, se `inscritos >= vagas` ou se a fila está vazia. Senão `atualizarInscricao(primeira.id, { status: 'confirmada' })`, `atualizarPalestra({ inscritos: inscritos + 1 })` e retorna a promovida. Mesmo padrão não atômico de hoje.
- `cancelarInscricao(id)`: busca a inscrição (lança `nao-encontrada`), remove. Se `em-espera`, retorna `{ removida }`. Se confirmada, decrementa `inscritos` e chama `promoverPrimeiroDaFila`. Retorna `{ removida, promovida? }` para uso interno e testes. A rota HTTP responde 204.
- `fazerCheckin` vira `async`: busca a inscrição, retorna `undefined` se não existe, lança `ErroInscricao('em-espera', 'Inscrição em lista de espera não pode fazer check-in')` se na fila, senão delega a `repo.marcarCheckin`.
- `listarInscricoesPorEmail`: aplicar `comPosicao` em cada item para expor `posicaoFila`.

`api/inscricoes.test.ts`, novo `describe('lista de espera')` reutilizando a palestra `...04` (60 vagas). No `beforeEach` guardar `inscritos` e lotar com `inscritos = vagas`. No `afterEach` restaurar `inscritos` e remover de `inscricoes` toda linha com e-mail terminado em `@teste.dev`. Casos:

1. entra na lista de espera com posição 1 quando a palestra está lotada (e `inscritos` não muda)
2. segunda pessoa na fila recebe posição 2
3. recusa duplicata mesmo quando a primeira inscrição está em espera
4. cancelar inscrição confirmada promove o primeiro da fila e mantém inscritos
5. cancelar confirmada sem fila libera a vaga
6. sair da fila não altera inscritos e reordena quem vem depois
7. recusa check-in de inscrição em espera
8. cancelar inscrição inexistente lança nao-encontrada
9. listarInscricoesPorEmail expõe status e posição na fila
10. promoverPrimeiroDaFila é no-op quando não há fila

Os três testes existentes continuam válidos.

### Etapa 4 — HTTP

Checkpoint: `curl` contra `npm run dev:api`.

`api/server.ts`:

- Helper local `responderErroInscricao(res, erro)`: se não for `ErroInscricao`, relança; senão responde 404 para `nao-encontrada` e 409 para o resto, corpo `{ erro, codigo }`.
- `POST /api/inscricoes`: sem mudança de contrato. O 201 agora traz `status` e, quando em espera, `posicaoFila`.
- `DELETE /api/inscricoes/:id` (novo): chama `cancelarInscricao`, responde `204` sem corpo, ou 404 via helper.
- `POST /api/checkin`: envolver em `try/catch` para responder `409 { codigo: 'em-espera' }`. O 404 atual permanece.

Smoke manual:

```bash
# 1ª inscrição preenche a última vaga do Kubernetes
curl -s -X POST localhost:3434/api/inscricoes -H 'content-type: application/json' \
  -d '{"palestraId":"00000000-0000-0000-0000-000000000011","nome":"A","email":"a@teste.dev"}'
# 2ª entra na fila: espera "status":"em-espera","posicaoFila":1
curl -s -X POST localhost:3434/api/inscricoes -H 'content-type: application/json' \
  -d '{"palestraId":"00000000-0000-0000-0000-000000000011","nome":"B","email":"b@teste.dev"}'
# cancela a 1ª (204) e confere que B foi promovida
curl -s -i -X DELETE localhost:3434/api/inscricoes/<id da 1ª>
curl -s 'localhost:3434/api/inscricoes?email=b@teste.dev'
```

### Etapa 5 — Fundações do frontend

Checkpoint: `npx vitest run src/hooks` e `npx tsc --noEmit` verdes.

- `src/lib/api.ts`: `cancelarInscricao(inscricaoId): Promise<void>` com `fetch` e `method: 'DELETE'`. O helper `json()` atual chama `res.json()`; criar `semCorpo(res)` que só lança `ErroApi` quando `!res.ok` e usar nesse caso, porque a resposta é 204.
- `src/hooks/useAgenda.ts`: exportar `ItemAgenda = { palestra: Palestra; inscricaoId?: string; status: StatusInscricao }`. Manter a chave `mergeconf:agenda`. `lerAgenda` normaliza item antigo (sem campo `palestra`, ou seja, uma `Palestra` crua) para `{ palestra: item, status: 'confirmada' }`. `adicionar(palestra, inscricao?: Pick<Inscricao, 'id' | 'status'>)` grava o formato novo com dedupe por `item.palestra.id`. Novo `atualizar(palestraId, mudancas)` para sincronizar `inscricaoId` e `status`. `remover` inalterado.
- `src/hooks/useAgenda.test.ts` (novo): o módulo tem `cache` em escopo de módulo, então cada teste faz `vi.resetModules()` e `await import('./useAgenda')` depois de semear o `localStorage`, usando `renderHook` e `act`. Casos: lê agenda no formato antigo como confirmada sem `inscricaoId`; grava item novo com `inscricaoId` e `status`; não duplica a mesma palestra; atualiza status de item existente.
- `src/components/ui/badge.tsx`: adicionar `confirmada: 'bg-emerald-100 text-emerald-700'` e `espera: 'bg-orange-100 text-orange-700'` ao union e ao `Record`.
- `src/components/BadgeStatusInscricao.tsx` (novo): recebe `Pick<Inscricao, 'status' | 'posicaoFila'>` e renderiza `<Badge variant="confirmada">Inscrito</Badge>` ou `<Badge variant="espera">Em espera · {posicaoFila}º</Badge>` (só "Em espera" quando a posição é indefinida). Reutilizado em Check-in e no drawer.

### Etapa 6 — Página da palestra

Checkpoint: `npx vitest run src/components` verde.

- `src/components/FormInscricao.tsx`:
  - Trocar `inscritoNaApi: boolean` por `inscricaoAtual: { id?: string; status: StatusInscricao; posicaoFila?: number } | null`. O blur do e-mail preenche via `buscarInscricoes` (que agora traz `status` e `posicaoFila`) e chama `atualizar` na agenda quando a palestra já está lá. O item da agenda é o fallback.
  - `lotada = palestra.inscritos >= palestra.vagas`.
  - Rótulo do `<div onClick>` (não converter em `<button>`, CUR-09): `'Você já está inscrito'`, `'Enviando…'`, `'Entrar na lista de espera'` quando lotada, senão `'Inscrever-se'`.
  - Se `inscricaoAtual?.status === 'em-espera'`: no lugar do div, renderizar `Você está na lista de espera · posição N` e um `<Button variant="outline">Sair da fila</Button>` que chama `cancelarInscricao(id)`, depois `remover(palestra.id)`, zera `inscricaoAtual` e volta ao estado `parado`. Em `ErroApi` com `nao-encontrada`, também remove localmente.
  - Sucesso do `enviar`: `adicionar(palestra, { id, status })`. Mensagem em âmbar `Você entrou na lista de espera · posição N` quando em espera, ou esmeralda `Inscrição confirmada! Nos vemos lá.`.
  - Branch `duplicada`: manter como hoje.
- `src/components/FormInscricao.test.tsx`: mock ganha `cancelarInscricao: vi.fn()`; fixtures ganham `status: 'confirmada'`. Novos casos: oferece "Entrar na lista de espera" quando a palestra está lotada; mostra a posição após entrar na lista de espera (`inscrever` resolve com `status: 'em-espera', posicaoFila: 3`); mostra posição e "Sair da fila" quando o e-mail já está em espera (clique chama `cancelarInscricao` com o id e o formulário volta a oferecer inscrição).
- `src/components/TalkCard.tsx` e `src/pages/PalestraDetalhe.tsx`: com `vagasRestantes <= 0` (usar `<=`, porque CUR-05 pode deixar `inscritos > vagas`), o card mostra `Lotada` e o detalhe mostra `Lotada · lista de espera` no lugar de `N de M vagas`. Manter o título "Garanta sua vaga", pois o e2e `e2e/grade.spec.ts` depende dele. Novo teste em `TalkCard.test.tsx`: mostra "Lotada" quando não há vagas.

### Etapa 7 — Página Check-in

Checkpoint: `npx vitest run src/pages` verde.

- `src/pages/CheckIn.tsx`: `BadgeStatusInscricao` ao lado do título de cada item. Ações à direita: em espera → `<Button variant="outline">Sair da fila</Button>` (sem Check-in); confirmada com check-in → "Presente" (inalterado, sem cancelar); confirmada sem check-in → botão `Check-in` existente mais `<Button variant="ghost" className="text-red-600">Cancelar inscrição</Button>`. `cancelar(id)` faz `await cancelarInscricao(id)` e `await buscar()`, mesmo padrão de `checkin`.
- `src/pages/CheckIn.test.tsx` (novo), mockando `../lib/api` como no teste do formulário. Casos: diferencia inscrição confirmada de em espera com posição (badges "Inscrito" e "Em espera · 2º"); mostra "Sair da fila" em vez de Check-in para inscrição em espera (clique chama `cancelarInscricao` e refaz `buscarInscricoes`); oferece "Cancelar inscrição" para confirmada sem check-in.

### Etapa 8 — Minha Agenda

Checkpoint: `npm test` completo e `npm run build` verdes.

- `src/components/MinhaAgendaDrawer.tsx`: iterar `agenda.map(({ palestra, inscricaoId, status }) => ...)`. `totalHoras` passa a ler `item.palestra`, mantendo o filtro `tipo === 'talk'` (CUR-14 intacto). Badge `BadgeStatusInscricao` sem posição (a agenda local não conhece a fila). Nova ação só quando há `inscricaoId`: `Sair da fila` para em espera ou `Cancelar inscrição` para confirmada, chamando `cancelarInscricao(inscricaoId)` e depois `remover(palestra.id)` (também em `ErroApi` com `nao-encontrada`). Itens antigos sem `inscricaoId` ficam só com o botão legado "Remover da agenda", cujo `onClick={() => { remover }}` **não** é corrigido (CUR-13).

## 6. Verificação de ponta a ponta

1. `npm test`, depois `npm run build` (inclui `tsc --noEmit`). `npm run e2e` é opcional, a grade não muda.
2. `npm run dev` e abrir `/palestra/00000000-0000-0000-0000-000000000011` (Kubernetes, 30/29):
   - Inscrever `a@teste.dev` → "Inscrição confirmada". O card na grade passa a mostrar "Lotada".
   - Recarregar, inscrever `b@teste.dev` → botão "Entrar na lista de espera" → "Você entrou na lista de espera · posição 1". Inscrever `c@teste.dev` → posição 2.
   - `/checkin` com `b@teste.dev` → badge "Em espera · 1º" e "Sair da fila". Com `a@teste.dev` → "Inscrito", Check-in e "Cancelar inscrição".
   - Cancelar `a@teste.dev`. Buscar `b@teste.dev` → "Inscrito". Buscar `c@teste.dev` → "Em espera · 1º". O detalhe da palestra continua "Lotada".
   - Abrir o drawer "Minha Agenda": itens com badge de status. "Sair da fila" remove da fila e da agenda.
3. Em memória o estado reseta ao reiniciar a API. Com `.env` do Supabase, aplicar `0002_lista_de_espera.sql` antes de subir.

## 7. Riscos e premissas

- **Corrida preservada (CUR-05).** Dois POSTs simultâneos na última vaga viram duas confirmadas. Cancelar e promover também não é atômico. Deliberado.
- **Sem notificação na promoção (CUR-12).** Quem é promovido só descobre ao consultar `/checkin` ou ao dar blur no e-mail na página da palestra.
- **Drift da agenda local.** O `status` no localStorage congela no momento da inscrição. A promoção só é refletida quando o blur do e-mail chama `atualizar`. Cancelamentos feitos em `/checkin` deixam o item no drawer até o usuário clicar na ação, que trata 404 removendo.
- **`inscritos` é contador, não contagem.** Pode divergir das confirmadas reais (já era assim). A fila é sempre calculada por `status`.
- **N+1 na leitura.** `listarInscricoesPorEmail` faz uma consulta de fila por inscrição em espera, como já faz com palestras. Aceitável para o volume do evento.
- **`palestra` fica stale no formulário** após inscrever, sem refetch. A mensagem de sucesso substitui o form, então não há efeito visível.
- **Empate de `criadaEm`.** Memória usa sort estável (ordem de inserção). Supabase desempata por `id`. O delay de 150ms separa os timestamps na prática.

## 8. Follow-ups sugeridos (fora do ticket)

- Coluna "Fila" na tabela do Organizador (exige expor a contagem de em espera na API).
- Notificação por e-mail na promoção (CUR-12).
- Fechar a fila ao atingir um limite, reintroduzindo o código `'lotada'`.

## 9. Prompt para executar a feature em outro contexto

Copie o bloco abaixo como está. Ele não depende de ferramenta específica.

```text
Você vai implementar a feature "Lista de espera para talks lotadas" (ticket CUR-04) no repositório MergeConf. O plano completo está em PLANO_CUR-04.md na raiz do repo. Leia-o inteiro antes de começar e siga as etapas na ordem, parando em cada checkpoint para eu revisar antes de seguir.

CONTEXTO DO PROJETO
- React 19 + Vite + TypeScript, TailwindCSS 4, componentes estilo shadcn em src/components/ui, React Router 7.
- API Node + Express 5 em api/ (porta 3434). Camada de repositório em api/repositorio.ts com duas implementações: memória (api/repositorio-memoria.ts, muta os arrays de api/dados.ts) e Supabase (api/repositorio-supabase.ts). Schema em supabase/migrations.
- Tipos compartilhados em src/types.ts (a API importa de ../src/types).
- Testes com Vitest + Testing Library, co-localizados (*.test.ts / *.test.tsx). Rodar com npm test. Build com npm run build (inclui tsc --noEmit).

REGRAS DE NEGÓCIO
1. Talk lotada (inscritos >= vagas): a inscrição é criada com status 'em-espera' e recebe posição na fila. O contador inscritos NÃO muda.
2. Posição na fila é derivada na leitura: índice 1-based entre as inscrições em espera da mesma palestra, ordenadas por criadaEm. Não existe coluna de posição.
3. Cancelar uma inscrição confirmada libera a vaga (inscritos - 1) e promove automaticamente o primeiro da fila (status vira 'confirmada', inscritos + 1).
4. Sair da fila remove a inscrição em espera. Quem vem depois sobe sozinho.
5. Check-in de quem está em espera é recusado com o código 'em-espera' (HTTP 409).
6. A checagem de duplicata por e-mail continua valendo para quem está na fila.

DECISÕES JÁ TOMADAS (não reabrir)
- Um endpoint único DELETE /api/inscricoes/:id serve para cancelar confirmada e para sair da fila. Responde 204 sem corpo, ou 404 { erro, codigo: 'nao-encontrada' }.
- Inscricao ganha status: 'confirmada' | 'em-espera' e posicaoFila?: number (derivado).
- Implementar nos dois backends (memória e Supabase), com migration supabase/migrations/0002_lista_de_espera.sql e seed atualizado.
- O código de erro 'lotada' é removido do union de ErroInscricao. Entra 'em-espera'.
- UI em três lugares: FormInscricao (página da palestra), página /checkin e drawer Minha Agenda. A agenda no localStorage passa a guardar { palestra, inscricaoId?, status }, lendo o formato antigo (Palestra crua) como confirmada sem ação de cancelar.
- TalkCard mostra "Lotada" e PalestraDetalhe mostra "Lotada · lista de espera" quando vagasRestantes <= 0. Manter o título "Garanta sua vaga" (o e2e depende).
- Organizador está fora de escopo.

RESTRIÇÕES OBRIGATÓRIAS (scaffold de curso com bugs plantados)
- NÃO tornar atômicos o check de capacidade e o incremento de inscritos. NÃO adicionar constraint de capacidade no banco. Seguir o padrão atual: ler palestra, decidir, repo.atualizarPalestra({ inscritos }).
- NÃO mexer em buscarInscricaoExata nem na normalização de e-mail no repositório.
- NÃO converter o <div onClick> do FormInscricao em <button>.
- NÃO corrigir o onClick={() => { remover }} nem o cálculo de totalHoras no MinhaAgendaDrawer.
- Não alterar nada além do que o plano lista.

CONVENÇÕES
- Identificadores, colunas, mensagens de erro e textos de UI em português.
- Sem ponto e vírgula, aspas simples, 2 espaços de indentação.
- Testes com describe nomeando a função e it() em frases completas em português.
- Testes da API rodam contra o repositório em memória e desfazem mutações no afterEach. Testes de componentes mockam ../lib/api com importOriginal.

ETAPAS E CHECKPOINTS
1. Tipos, seed e migration.
2. Repositório (interface + memória + Supabase). Checkpoint: npx tsc --noEmit e npm test verdes.
3. Regras em api/inscricoes.ts + describe('lista de espera') em api/inscricoes.test.ts cobrindo: entrar na fila com posição 1 e 2, duplicata em espera, cancelar confirmada promove o primeiro e mantém inscritos, cancelar sem fila libera vaga, sair da fila reordena sem tocar em inscritos, check-in em espera recusado, cancelar inexistente, listarInscricoesPorEmail expõe status e posição, promoção é no-op sem fila. Checkpoint: npx vitest run api verde.
4. HTTP em api/server.ts (DELETE novo, POST com status/posicaoFila, checkin com 409). Checkpoint: smoke com curl na palestra 00000000-0000-0000-0000-000000000011.
5. Frontend base: cancelarInscricao em src/lib/api.ts (tratar 204 sem corpo), useAgenda com o novo formato e teste, variantes confirmada/espera no Badge, componente BadgeStatusInscricao. Checkpoint: npx vitest run src/hooks e tsc verdes.
6. FormInscricao (estado em espera, rótulo "Entrar na lista de espera", "Sair da fila", mensagens com posição) + TalkCard/PalestraDetalhe com "Lotada" + testes. Checkpoint: npx vitest run src/components verde.
7. Página Check-in com badge de status, "Sair da fila" e "Cancelar inscrição" + teste. Checkpoint: npx vitest run src/pages verde.
8. MinhaAgendaDrawer com badge e ação de sair/cancelar. Checkpoint: npm test e npm run build verdes.

CRITÉRIOS DE ACEITE
- Inscrição em talk lotada entra na lista de espera com posição visível.
- Cancelamento/liberação promove o primeiro da fila.
- UI diferencia claramente "Inscrito" de "Em espera".
- Testes das regras de promoção passando.

Ao terminar cada etapa, liste os arquivos alterados e o resultado do checkpoint. Se algo no plano não bater com o código real, pare e me avise em vez de improvisar.
```
