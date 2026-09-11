-- CUR-04: lista de espera. Posição na fila é derivada (ordem de criada_em), não persistida.
alter table inscricoes
  add column status text not null default 'confirmada'
  check (status in ('confirmada', 'em-espera'));

create index idx_inscricoes_fila on inscricoes (palestra_id, criada_em)
  where status = 'em-espera';
