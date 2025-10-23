// Server.js com integração Supabase para O Quilo é Nosso 2025
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import SupabaseService from './supabase-config.js'

// Configurar variáveis de ambiente
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
})

const PORT = process.env.PORT || 3001

// ===== MIDDLEWARES =====
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// ===== ROTAS DE SAÚDE =====
app.get('/', (req, res) => {
  res.json({
    message: 'O Quilo é Nosso 2025 - Backend API com Supabase',
    version: '2.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'Supabase PostgreSQL'
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando com Supabase!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// ===== ROTAS DE PRATOS =====
app.get('/api/pratos', async (req, res) => {
  try {
    const pratos = await SupabaseService.getPratos()
    
    // Emitir atualização via WebSocket
    io.emit('pratos_updated', pratos)
    
    res.json({
      success: true,
      data: pratos,
      total: pratos.length
    })
  } catch (error) {
    console.error('Erro ao buscar pratos:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar pratos',
      message: error.message
    })
  }
})

app.post('/api/pratos', async (req, res) => {
  try {
    const prato = await SupabaseService.createPrato(req.body)
    
    // Emitir atualização via WebSocket
    io.emit('prato_created', prato)
    io.emit('pratos_updated', await SupabaseService.getPratos())
    
    res.status(201).json({
      success: true,
      data: prato,
      message: 'Prato criado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar prato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao criar prato',
      message: error.message
    })
  }
})

app.put('/api/pratos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const prato = await SupabaseService.updatePrato(id, req.body)
    
    // Emitir atualização via WebSocket
    io.emit('prato_updated', prato)
    io.emit('pratos_updated', await SupabaseService.getPratos())
    
    res.json({
      success: true,
      data: prato,
      message: 'Prato atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar prato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar prato',
      message: error.message
    })
  }
})

app.delete('/api/pratos/:id', async (req, res) => {
  try {
    const { id } = req.params
    await SupabaseService.deletePrato(id)
    
    // Emitir atualização via WebSocket
    io.emit('prato_deleted', { id })
    io.emit('pratos_updated', await SupabaseService.getPratos())
    
    res.json({
      success: true,
      message: 'Prato excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir prato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir prato',
      message: error.message
    })
  }
})

// ===== ROTAS DE JURADOS =====
app.get('/api/jurados', async (req, res) => {
  try {
    const jurados = await SupabaseService.getJurados()
    
    res.json({
      success: true,
      data: jurados,
      total: jurados.length
    })
  } catch (error) {
    console.error('Erro ao buscar jurados:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar jurados',
      message: error.message
    })
  }
})

app.post('/api/jurados', async (req, res) => {
  try {
    const jurado = await SupabaseService.createJurado(req.body)
    
    // Emitir atualização via WebSocket
    io.emit('jurado_created', jurado)
    io.emit('jurados_updated', await SupabaseService.getJurados())
    
    res.status(201).json({
      success: true,
      data: jurado,
      message: 'Jurado criado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar jurado:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao criar jurado',
      message: error.message
    })
  }
})

app.put('/api/jurados/:id', async (req, res) => {
  try {
    const { id } = req.params
    const jurado = await SupabaseService.updateJurado(id, req.body)
    
    // Emitir atualização via WebSocket
    io.emit('jurado_updated', jurado)
    io.emit('jurados_updated', await SupabaseService.getJurados())
    
    res.json({
      success: true,
      data: jurado,
      message: 'Jurado atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar jurado:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar jurado',
      message: error.message
    })
  }
})

// ===== ROTAS DE AVALIAÇÕES =====
app.get('/api/avaliacoes', async (req, res) => {
  try {
    const avaliacoes = await SupabaseService.getAvaliacoes()
    
    res.json({
      success: true,
      data: avaliacoes,
      total: avaliacoes.length
    })
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar avaliações',
      message: error.message
    })
  }
})

app.post('/api/avaliacoes', async (req, res) => {
  try {
    const avaliacao = await SupabaseService.createAvaliacao(req.body)
    
    // Emitir atualização via WebSocket
    io.emit('avaliacao_created', avaliacao)
    io.emit('avaliacoes_updated', await SupabaseService.getAvaliacoes())
    io.emit('ranking_updated', await SupabaseService.getRanking())
    
    res.status(201).json({
      success: true,
      data: avaliacao,
      message: 'Avaliação registrada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar avaliação',
      message: error.message
    })
  }
})

app.get('/api/avaliacoes/prato/:pratoId', async (req, res) => {
  try {
    const { pratoId } = req.params
    const avaliacoes = await SupabaseService.getAvaliacoesByPrato(pratoId)
    
    res.json({
      success: true,
      data: avaliacoes,
      total: avaliacoes.length
    })
  } catch (error) {
    console.error('Erro ao buscar avaliações do prato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar avaliações do prato',
      message: error.message
    })
  }
})

app.get('/api/avaliacoes/jurado/:juradoId', async (req, res) => {
  try {
    const { juradoId } = req.params
    const avaliacoes = await SupabaseService.getAvaliacoesByJurado(juradoId)
    
    res.json({
      success: true,
      data: avaliacoes,
      total: avaliacoes.length
    })
  } catch (error) {
    console.error('Erro ao buscar avaliações do jurado:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar avaliações do jurado',
      message: error.message
    })
  }
})

// ===== ROTAS DE RECEITAS =====
app.get('/api/receitas', async (req, res) => {
  try {
    const receitas = await SupabaseService.getReceitas()
    
    res.json({
      success: true,
      data: receitas,
      total: receitas.length
    })
  } catch (error) {
    console.error('Erro ao buscar receitas:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar receitas',
      message: error.message
    })
  }
})

app.post('/api/receitas', async (req, res) => {
  try {
    const receita = await SupabaseService.createReceita(req.body)
    
    // Emitir atualização via WebSocket
    io.emit('receita_created', receita)
    io.emit('receitas_updated', await SupabaseService.getReceitas())
    
    res.status(201).json({
      success: true,
      data: receita,
      message: 'Receita criada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar receita:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao criar receita',
      message: error.message
    })
  }
})

// ===== ROTAS DE RANKING =====
app.get('/api/ranking', async (req, res) => {
  try {
    const ranking = await SupabaseService.getRanking()
    
    // Emitir atualização via WebSocket
    io.emit('ranking_updated', ranking)
    
    res.json({
      success: true,
      data: ranking,
      total: ranking.length
    })
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar ranking',
      message: error.message
    })
  }
})

// ===== ROTAS DE ESTATÍSTICAS =====
app.get('/api/estatisticas', async (req, res) => {
  try {
    const stats = await SupabaseService.getEstatisticas()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      message: error.message
    })
  }
})

// ===== WEBSOCKET PARA TEMPO REAL =====
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)
  
  // Enviar dados iniciais para o cliente
  socket.emit('connected', {
    message: 'Conectado ao servidor O Quilo é Nosso 2025',
    timestamp: new Date().toISOString()
  })
  
  // Escutar eventos do cliente
  socket.on('join_admin', () => {
    socket.join('admin')
    console.log('Cliente entrou no canal admin:', socket.id)
  })
  
  socket.on('join_voting', () => {
    socket.join('voting')
    console.log('Cliente entrou no canal voting:', socket.id)
  })
  
  socket.on('request_data', async (type) => {
    try {
      let data
      switch (type) {
        case 'pratos':
          data = await SupabaseService.getPratos()
          socket.emit('pratos_updated', data)
          break
        case 'jurados':
          data = await SupabaseService.getJurados()
          socket.emit('jurados_updated', data)
          break
        case 'avaliacoes':
          data = await SupabaseService.getAvaliacoes()
          socket.emit('avaliacoes_updated', data)
          break
        case 'ranking':
          data = await SupabaseService.getRanking()
          socket.emit('ranking_updated', data)
          break
        case 'receitas':
          data = await SupabaseService.getReceitas()
          socket.emit('receitas_updated', data)
          break
        default:
          socket.emit('error', { message: 'Tipo de dados não reconhecido' })
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      socket.emit('error', { message: error.message })
    }
  })
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

// ===== MIDDLEWARE DE ERRO =====
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error)
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: error.message
  })
})

// ===== ROTA 404 =====
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `Rota ${req.method} ${req.originalUrl} não existe`
  })
})

// ===== INICIAR SERVIDOR =====
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Banco de dados: Supabase PostgreSQL`)
  console.log(`🔄 WebSocket ativo para sincronização em tempo real`)
  console.log(`⏰ Iniciado em: ${new Date().toISOString()}`)
})

// ===== TRATAMENTO DE SINAIS =====
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, fechando servidor...')
  server.close(() => {
    console.log('Servidor fechado')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, fechando servidor...')
  server.close(() => {
    console.log('Servidor fechado')
    process.exit(0)
  })
})

export default app
