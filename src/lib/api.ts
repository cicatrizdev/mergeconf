import type { Inscricao, InscricaoComPalestra, Palestra } from '../types'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const corpo = await res.json().catch(() => ({}))
    throw new Error(corpo.erro ?? `Erro ${res.status}`)
  }
  return res.json()
}

export function listarPalestras(): Promise<Palestra[]> {
  return fetch('/api/palestras').then((res) => json<Palestra[]>(res))
}

export function buscarPalestra(id: string): Promise<Palestra> {
  return fetch(`/api/palestras/${id}`).then((res) => json<Palestra>(res))
}

export function inscrever(palestraId: string, nome: string, email: string): Promise<Inscricao> {
  return fetch('/api/inscricoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ palestraId, nome, email }),
  }).then((res) => json<Inscricao>(res))
}

export function buscarInscricoes(email: string): Promise<InscricaoComPalestra[]> {
  return fetch(`/api/inscricoes?email=${encodeURIComponent(email)}`).then((res) =>
    json<InscricaoComPalestra[]>(res),
  )
}

export function fazerCheckin(inscricaoId: string): Promise<Inscricao> {
  return fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inscricaoId }),
  }).then((res) => json<Inscricao>(res))
}
