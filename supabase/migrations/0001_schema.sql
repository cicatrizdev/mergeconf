-- MergeConf — schema inicial (edição 2023, "só deu uma mexidinha" desde então)

create table palestras (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  palestrante text not null,
  sala text not null,
  trilha text not null check (trilha in ('frontend', 'backend', 'ia', 'carreira')),
  tipo text not null default 'talk' check (tipo in ('talk', 'workshop', 'keynote')),
  inicio timestamptz not null,
  fim timestamptz not null,
  vagas integer not null,
  inscritos integer not null default 0,
  remanejada_de timestamptz,
  descricao text not null default ''
);

create table inscricoes (
  id uuid primary key default gen_random_uuid(),
  palestra_id uuid not null references palestras (id),
  nome text not null,
  email text not null,
  criada_em timestamptz not null default now(),
  checkin_em timestamptz
);

create index idx_inscricoes_palestra on inscricoes (palestra_id);
create index idx_inscricoes_email on inscricoes (email);
