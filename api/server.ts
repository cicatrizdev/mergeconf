import express from 'express'
import cors from 'cors'
import { listarPalestras, buscarPalestra, palestras } from './dados'
import { criarInscricao, listarInscricoesPorEmail, fazerCheckin, ErroInscricao } from './inscricoes'
import { haConflitoDeSala } from './alocacao'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/palestras', (_req, res) => {
  res.json(listarPalestras())
})

app.get('/api/palestras/:id', (req, res) => {
  const palestra = buscarPalestra(req.params.id)
  if (!palestra) {
    res.status(404).json({ erro: 'Palestra não encontrada' })
    return
  }
  res.json(palestra)
})

app.put('/api/palestras/:id/remanejar', (req, res) => {
  const palestra = buscarPalestra(req.params.id)
  if (!palestra) {
    res.status(404).json({ erro: 'Palestra não encontrada' })
    return
  }
  const { sala, inicio, fim } = req.body
  const conflito = haConflitoDeSala(palestras, { sala, inicio, fim }, palestra.id)
  if (conflito) {
    res.status(409).json({ erro: `Conflito com "${conflito.titulo}" na ${sala}` })
    return
  }
  palestra.remanejadaDe = palestra.inicio
  palestra.sala = sala
  palestra.inicio = inicio
  palestra.fim = fim
  res.json(palestra)
})

app.post('/api/inscricoes', async (req, res) => {
  const { palestraId, nome, email } = req.body
  if (!palestraId || !nome || !email) {
    res.status(400).json({ erro: 'palestraId, nome e email são obrigatórios' })
    return
  }
  try {
    const inscricao = await criarInscricao(palestraId, nome, email)
    res.status(201).json(inscricao)
  } catch (erro) {
    if (erro instanceof ErroInscricao) {
      const status = erro.codigo === 'nao-encontrada' ? 404 : 409
      res.status(status).json({ erro: erro.message, codigo: erro.codigo })
      return
    }
    throw erro
  }
})

app.get('/api/inscricoes', (req, res) => {
  const email = String(req.query.email ?? '')
  if (!email) {
    res.status(400).json({ erro: 'Informe o e-mail' })
    return
  }
  res.json(listarInscricoesPorEmail(email))
})

app.post('/api/checkin', (req, res) => {
  const inscricao = fazerCheckin(req.body.inscricaoId)
  if (!inscricao) {
    res.status(404).json({ erro: 'Inscrição não encontrada' })
    return
  }
  res.json(inscricao)
})

const porta = Number(process.env.API_PORT ?? 3434)
app.listen(porta, () => {
  console.log(`🎤 API da MergeConf no ar em http://localhost:${porta}`)
})
