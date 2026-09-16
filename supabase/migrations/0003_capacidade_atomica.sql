-- CUR-05: impede overbooking (inscritos > vagas) e reserva/libera vaga de forma atômica.

alter table palestras
  add constraint palestras_inscritos_entre_zero_e_vagas
  check (inscritos >= 0 and inscritos <= vagas);

create or replace function reservar_vaga(p_palestra_id uuid)
returns boolean
language plpgsql
as $$
begin
  update palestras
  set inscritos = inscritos + 1
  where id = p_palestra_id
    and inscritos < vagas;
  return found;
end;
$$;

create or replace function liberar_vaga(p_palestra_id uuid)
returns void
language plpgsql
as $$
begin
  update palestras
  set inscritos = inscritos - 1
  where id = p_palestra_id
    and inscritos > 0;
end;
$$;

grant execute on function reservar_vaga(uuid) to anon, authenticated, service_role;
grant execute on function liberar_vaga(uuid) to anon, authenticated, service_role;
