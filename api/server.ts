import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { repo } from './repositorio'
import {
  cancelarInscricao,
  criarInscricao,
  listarInscricoesPorEmail,
  fazerCheckin,
  ErroInscricao,
} from './inscricoes'
import { haConflitoDeSala } from './alocacao'

const app = express()
app.use(cors())
app.use(express.json())

function responderErroInscricao(res: express.Response, erro: unknown) {
  if (!(erro instanceof ErroInscricao)) throw erro
  const status = erro.codigo === 'nao-encontrada' ? 404 : 409
  res.status(status).json({ erro: erro.message, codigo: erro.codigo })
}

app.get('/api/palestras', async (_req, res) => {
  res.json(await repo.listarPalestras())
})

app.get('/api/palestras/:id', async (req, res) => {
  const palestra = await repo.buscarPalestra(req.params.id)
  if (!palestra) {
    res.status(404).json({ erro: 'Palestra não encontrada' })
    return
  }
  res.json(palestra)
})

app.put('/api/palestras/:id/remanejar', async (req, res) => {
  const palestra = await repo.buscarPalestra(req.params.id)
  if (!palestra) {
    res.status(404).json({ erro: 'Palestra não encontrada' })
    return
  }
  const { sala, inicio, fim } = req.body
  const todas = await repo.listarPalestras()
  const conflito = haConflitoDeSala(todas, { sala, inicio, fim }, palestra.id)
  if (conflito) {
    res.status(409).json({ erro: `Conflito com "${conflito.titulo}" na ${sala}` })
    return
  }
  await repo.atualizarPalestra(palestra.id, { remanejadaDe: palestra.inicio, sala, inicio, fim })
  res.json(await repo.buscarPalestra(palestra.id))
})

app.post('/api/inscricoes', async (req, res) => {
  const { palestraId, nome, email } = req.body
  if (!palestraId || !nome || !String(email ?? '').trim()) {
    res.status(400).json({ erro: 'palestraId, nome e email são obrigatórios' })
    return
  }
  try {
    const inscricao = await criarInscricao(palestraId, nome, email)
    res.status(201).json(inscricao)
  } catch (erro) {
    responderErroInscricao(res, erro)
  }
})

app.delete('/api/inscricoes/:id', async (req, res) => {
  try {
    await cancelarInscricao(req.params.id)
    res.status(204).end()
  } catch (erro) {
    responderErroInscricao(res, erro)
  }
})

app.get('/api/inscricoes', async (req, res) => {
  const email = String(req.query.email ?? '')
  if (!email) {
    res.status(400).json({ erro: 'Informe o e-mail' })
    return
  }
  res.json(await listarInscricoesPorEmail(email))
})

app.post('/api/checkin', async (req, res) => {
  try {
    const inscricao = await fazerCheckin(req.body.inscricaoId)
    if (!inscricao) {
      res.status(404).json({ erro: 'Inscrição não encontrada' })
      return
    }
    res.json(inscricao)
  } catch (erro) {
    responderErroInscricao(res, erro)
  }
})

const porta = Number(process.env.API_PORT ?? 3434)
app.listen(porta, () => {
  console.log(`🎤 API da MergeConf no ar em http://localhost:${porta}`)
})
