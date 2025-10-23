// Configuração do Supabase para O Quilo é Nosso 2025
import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase (serão definidas via variáveis de ambiente)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Esquemas das tabelas
export const TABLES = {
  PRATOS: 'pratos',
  JURADOS: 'jurados', 
  AVALIACOES: 'avaliacoes',
  RECEITAS: 'receitas'
}

// Funções utilitárias para operações no banco
export class SupabaseService {
  
  // ===== PRATOS =====
  static async getPratos() {
    const { data, error } = await supabase
      .from(TABLES.PRATOS)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createPrato(prato) {
    const { data, error } = await supabase
      .from(TABLES.PRATOS)
      .insert([{
        nome: prato.nome,
        restaurante: prato.restaurante,
        descricao: prato.descricao,
        chef: prato.chef,
        estado: prato.estado,
        categoria: prato.categoria,
        tempo: prato.tempo,
        porcoes: prato.porcoes,
        imagem: prato.imagem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updatePrato(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.PRATOS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async deletePrato(id) {
    const { error } = await supabase
      .from(TABLES.PRATOS)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // ===== JURADOS =====
  static async getJurados() {
    const { data, error } = await supabase
      .from(TABLES.JURADOS)
      .select('*')
      .order('nome')
    
    if (error) throw error
    return data
  }

  static async createJurado(jurado) {
    const { data, error } = await supabase
      .from(TABLES.JURADOS)
      .insert([{
        nome: jurado.nome,
        email: jurado.email,
        telefone: jurado.telefone,
        especialidade: jurado.especialidade,
        ativo: true,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateJurado(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.JURADOS)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async deleteJurado(id) {
    const { error } = await supabase
      .from(TABLES.JURADOS)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // ===== AVALIAÇÕES =====
  static async getAvaliacoes() {
    const { data, error } = await supabase
      .from(TABLES.AVALIACOES)
      .select(`
        *,
        pratos:prato_id (nome, restaurante, chef),
        jurados:jurado_id (nome)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createAvaliacao(avaliacao) {
    const { data, error } = await supabase
      .from(TABLES.AVALIACOES)
      .insert([{
        prato_id: avaliacao.prato_id,
        jurado_id: avaliacao.jurado_id,
        jurado_nome: avaliacao.jurado_nome,
        originalidade: avaliacao.originalidade,
        receita: avaliacao.receita,
        apresentacao: avaliacao.apresentacao,
        harmonia: avaliacao.harmonia,
        sabor: avaliacao.sabor,
        adequacao: avaliacao.adequacao,
        pontuacao_total: avaliacao.pontuacao_total,
        media_ponderada: avaliacao.media_ponderada,
        observacoes: avaliacao.observacoes,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async getAvaliacoesByPrato(pratoId) {
    const { data, error } = await supabase
      .from(TABLES.AVALIACOES)
      .select('*')
      .eq('prato_id', pratoId)
    
    if (error) throw error
    return data
  }

  static async getAvaliacoesByJurado(juradoId) {
    const { data, error } = await supabase
      .from(TABLES.AVALIACOES)
      .select('*')
      .eq('jurado_id', juradoId)
    
    if (error) throw error
    return data
  }

  // ===== RECEITAS =====
  static async getReceitas() {
    const { data, error } = await supabase
      .from(TABLES.RECEITAS)
      .select(`
        *,
        pratos:prato_id (nome, restaurante)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async createReceita(receita) {
    const { data, error } = await supabase
      .from(TABLES.RECEITAS)
      .insert([{
        prato_id: receita.prato_id,
        titulo: receita.titulo,
        ingredientes: receita.ingredientes,
        modo_preparo: receita.modo_preparo,
        tempo_preparo: receita.tempo_preparo,
        rendimento: receita.rendimento,
        dificuldade: receita.dificuldade,
        arquivo_pdf: receita.arquivo_pdf,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  // ===== RANKING =====
  static async getRanking() {
    const { data, error } = await supabase
      .from(TABLES.AVALIACOES)
      .select(`
        prato_id,
        pratos:prato_id (nome, restaurante, chef, imagem),
        originalidade,
        receita,
        apresentacao,
        harmonia,
        sabor,
        adequacao,
        pontuacao_total,
        media_ponderada
      `)
    
    if (error) throw error
    
    // Agrupar por prato e calcular médias
    const ranking = {}
    
    data.forEach(avaliacao => {
      const pratoId = avaliacao.prato_id
      
      if (!ranking[pratoId]) {
        ranking[pratoId] = {
          prato: avaliacao.pratos,
          avaliacoes: [],
          total_avaliacoes: 0,
          soma_pontuacao: 0,
          media_final: 0
        }
      }
      
      ranking[pratoId].avaliacoes.push(avaliacao)
      ranking[pratoId].total_avaliacoes++
      ranking[pratoId].soma_pontuacao += avaliacao.pontuacao_total
    })
    
    // Calcular médias finais e ordenar
    const rankingArray = Object.values(ranking).map(item => {
      item.media_final = item.soma_pontuacao / item.total_avaliacoes
      return item
    }).sort((a, b) => b.media_final - a.media_final)
    
    return rankingArray
  }

  // ===== ESTATÍSTICAS =====
  static async getEstatisticas() {
    const [pratos, jurados, avaliacoes, receitas] = await Promise.all([
      supabase.from(TABLES.PRATOS).select('id', { count: 'exact' }),
      supabase.from(TABLES.JURADOS).select('id', { count: 'exact' }).eq('ativo', true),
      supabase.from(TABLES.AVALIACOES).select('id', { count: 'exact' }),
      supabase.from(TABLES.RECEITAS).select('id', { count: 'exact' })
    ])
    
    return {
      total_pratos: pratos.count || 0,
      jurados_ativos: jurados.count || 0,
      total_avaliacoes: avaliacoes.count || 0,
      total_receitas: receitas.count || 0,
      ultima_atualizacao: new Date().toISOString()
    }
  }

  // ===== TEMPO REAL =====
  static subscribeToChanges(table, callback) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: table },
        callback
      )
      .subscribe()
  }

  static unsubscribe(subscription) {
    supabase.removeChannel(subscription)
  }
}

export default SupabaseService
