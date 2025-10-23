const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { Server } = require('socket.io');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Inicializar banco de dados SQLite
const db = new sqlite3.Database(':memory:');

// Criar tabelas
db.serialize(() => {
  // Tabela de pratos
  db.run(`CREATE TABLE pratos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    restaurante TEXT NOT NULL,
    descricao TEXT,
    estado TEXT,
    chef TEXT,
    imagem TEXT,
    receita_pdf TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de jurados
  db.run(`CREATE TABLE jurados (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    ativo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de avaliações
  db.run(`CREATE TABLE avaliacoes (
    id TEXT PRIMARY KEY,
    jurado_id TEXT,
    prato_id TEXT,
    criterio TEXT,
    nota INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jurado_id) REFERENCES jurados (id),
    FOREIGN KEY (prato_id) REFERENCES pratos (id)
  )`);

  // Inserir dados iniciais
  insertInitialData();
});

function insertInitialData() {
  // Inserir jurados iniciais
  const jurados = [
    { id: uuidv4(), nome: 'Ana Paula', email: 'ana@oquiloenosso.com' },
    { id: uuidv4(), nome: 'Bruno Silva', email: 'bruno@oquiloenosso.com' },
    { id: uuidv4(), nome: 'Carla Mendes', email: 'carla@oquiloenosso.com' },
    { id: uuidv4(), nome: 'Diego Rocha', email: 'diego@oquiloenosso.com' },
    { id: uuidv4(), nome: 'Fernanda Alves', email: 'fernanda@oquiloenosso.com' }
  ];

  jurados.forEach(jurado => {
    db.run('INSERT INTO jurados (id, nome, email) VALUES (?, ?, ?)', 
           [jurado.id, jurado.nome, jurado.email]);
  });

  // Inserir pratos iniciais
  const pratos = [
    {
      id: uuidv4(),
      nome: 'Presunto Artesanal de Frango com Pequi',
      restaurante: 'Junior Cozinha Brasileira',
      descricao: 'Presunto artesanal de frango com pequi recheado, empanado em semente de abóbora, acompanhado de musseline de agrião e crispy de casca de maçã',
      estado: 'Goiás',
      chef: 'Alex Ricardo dos Reis Martins',
      imagem: '/images/prato1.jpg'
    },
    {
      id: uuidv4(),
      nome: 'Café da Manhã Inglês Completo',
      restaurante: 'Sabores Internacionais',
      descricao: 'Café da manhã tradicional inglês com ovos, bacon, linguiça, feijão, cogumelos e torradas',
      estado: 'São Paulo',
      chef: 'Maria Santos',
      imagem: '/images/prato2.jpg'
    },
    {
      id: uuidv4(),
      nome: 'Salada Caesar com Camarão',
      restaurante: 'Tempero da Bahia',
      descricao: 'Salada caesar tradicional com camarões grelhados e molho especial',
      estado: 'Bahia',
      chef: 'João Oliveira',
      imagem: '/images/prato3.jpg'
    },
    {
      id: uuidv4(),
      nome: 'Sopa Oriental de Ervilha',
      restaurante: 'Pantanal Gourmet',
      descricao: 'Sopa cremosa de ervilha com temperos orientais',
      estado: 'Mato Grosso do Sul',
      chef: 'Carlos Lima',
      imagem: '/images/prato4.jpg'
    },
    {
      id: uuidv4(),
      nome: 'Penne com Molho de Tomate',
      restaurante: 'Massa & Arte',
      descricao: 'Penne al dente com molho de tomate artesanal e manjericão fresco',
      estado: 'Rio de Janeiro',
      chef: 'Giuseppe Rossi',
      imagem: '/images/prato5.jpg'
    },
    {
      id: uuidv4(),
      nome: 'Salada Caesar Gourmet',
      restaurante: 'Verde & Sabor',
      descricao: 'Versão gourmet da salada caesar com ingredientes premium',
      estado: 'Minas Gerais',
      chef: 'Patricia Costa',
      imagem: '/images/prato6.jpg'
    }
  ];

  pratos.forEach(prato => {
    db.run(`INSERT INTO pratos (id, nome, restaurante, descricao, estado, chef, imagem) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
           [prato.id, prato.nome, prato.restaurante, prato.descricao, prato.estado, prato.chef, prato.imagem]);
  });
}

// Rotas da API

// PRATOS
app.get('/api/pratos', (req, res) => {
  db.all('SELECT * FROM pratos ORDER BY created_at', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/pratos', (req, res) => {
  const { nome, restaurante, descricao, estado, chef, imagem, receita_pdf } = req.body;
  const id = uuidv4();
  
  db.run(`INSERT INTO pratos (id, nome, restaurante, descricao, estado, chef, imagem, receita_pdf) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
         [id, nome, restaurante, descricao, estado, chef, imagem, receita_pdf],
         function(err) {
           if (err) {
             res.status(500).json({ error: err.message });
             return;
           }
           
           // Buscar o prato criado
           db.get('SELECT * FROM pratos WHERE id = ?', [id], (err, row) => {
             if (err) {
               res.status(500).json({ error: err.message });
               return;
             }
             
             // Emitir evento para todos os clientes conectados
             io.emit('prato_adicionado', row);
             res.json(row);
           });
         });
});

app.put('/api/pratos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, restaurante, descricao, estado, chef, imagem, receita_pdf } = req.body;
  
  db.run(`UPDATE pratos SET nome = ?, restaurante = ?, descricao = ?, estado = ?, chef = ?, 
          imagem = ?, receita_pdf = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
         [nome, restaurante, descricao, estado, chef, imagem, receita_pdf, id],
         function(err) {
           if (err) {
             res.status(500).json({ error: err.message });
             return;
           }
           
           // Buscar o prato atualizado
           db.get('SELECT * FROM pratos WHERE id = ?', [id], (err, row) => {
             if (err) {
               res.status(500).json({ error: err.message });
               return;
             }
             
             // Emitir evento para todos os clientes conectados
             io.emit('prato_atualizado', row);
             res.json(row);
           });
         });
});

app.delete('/api/pratos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM pratos WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Emitir evento para todos os clientes conectados
    io.emit('prato_removido', { id });
    res.json({ message: 'Prato removido com sucesso' });
  });
});

// JURADOS
app.get('/api/jurados', (req, res) => {
  db.all('SELECT * FROM jurados ORDER BY nome', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/jurados', (req, res) => {
  const { nome, email } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO jurados (id, nome, email) VALUES (?, ?, ?)',
         [id, nome, email],
         function(err) {
           if (err) {
             res.status(500).json({ error: err.message });
             return;
           }
           
           db.get('SELECT * FROM jurados WHERE id = ?', [id], (err, row) => {
             if (err) {
               res.status(500).json({ error: err.message });
               return;
             }
             
             io.emit('jurado_adicionado', row);
             res.json(row);
           });
         });
});

app.put('/api/jurados/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, ativo } = req.body;
  
  db.run('UPDATE jurados SET nome = ?, email = ?, ativo = ? WHERE id = ?',
         [nome, email, ativo, id],
         function(err) {
           if (err) {
             res.status(500).json({ error: err.message });
             return;
           }
           
           db.get('SELECT * FROM jurados WHERE id = ?', [id], (err, row) => {
             if (err) {
               res.status(500).json({ error: err.message });
               return;
             }
             
             io.emit('jurado_atualizado', row);
             res.json(row);
           });
         });
});

// AVALIAÇÕES
app.get('/api/avaliacoes', (req, res) => {
  db.all(`SELECT a.*, j.nome as jurado_nome, p.nome as prato_nome 
          FROM avaliacoes a 
          JOIN jurados j ON a.jurado_id = j.id 
          JOIN pratos p ON a.prato_id = p.id 
          ORDER BY a.created_at DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/avaliacoes', (req, res) => {
  const { jurado_id, prato_id, criterio, nota } = req.body;
  const id = uuidv4();
  
  // Verificar se já existe avaliação para este jurado/prato/critério
  db.get('SELECT id FROM avaliacoes WHERE jurado_id = ? AND prato_id = ? AND criterio = ?',
         [jurado_id, prato_id, criterio], (err, existing) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (existing) {
      // Atualizar avaliação existente
      db.run('UPDATE avaliacoes SET nota = ? WHERE id = ?',
             [nota, existing.id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Emitir evento de atualização
        io.emit('avaliacao_atualizada', { jurado_id, prato_id, criterio, nota });
        res.json({ message: 'Avaliação atualizada' });
      });
    } else {
      // Criar nova avaliação
      db.run('INSERT INTO avaliacoes (id, jurado_id, prato_id, criterio, nota) VALUES (?, ?, ?, ?, ?)',
             [id, jurado_id, prato_id, criterio, nota], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Emitir evento de nova avaliação
        io.emit('nova_avaliacao', { jurado_id, prato_id, criterio, nota });
        res.json({ message: 'Avaliação salva' });
      });
    }
  });
});

// RANKING
app.get('/api/ranking', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.nome,
      p.restaurante,
      p.imagem,
      COUNT(DISTINCT a.jurado_id) as total_jurados,
      AVG(CASE WHEN a.criterio = 'originalidade' THEN a.nota * 2 END) as originalidade,
      AVG(CASE WHEN a.criterio = 'receita' THEN a.nota * 3 END) as receita,
      AVG(CASE WHEN a.criterio = 'apresentacao' THEN a.nota * 2 END) as apresentacao,
      AVG(CASE WHEN a.criterio = 'harmonia' THEN a.nota * 2 END) as harmonia,
      AVG(CASE WHEN a.criterio = 'sabor' THEN a.nota * 3 END) as sabor,
      AVG(CASE WHEN a.criterio = 'adequacao' THEN a.nota * 1 END) as adequacao,
      (
        COALESCE(AVG(CASE WHEN a.criterio = 'originalidade' THEN a.nota * 2 END), 0) +
        COALESCE(AVG(CASE WHEN a.criterio = 'receita' THEN a.nota * 3 END), 0) +
        COALESCE(AVG(CASE WHEN a.criterio = 'apresentacao' THEN a.nota * 2 END), 0) +
        COALESCE(AVG(CASE WHEN a.criterio = 'harmonia' THEN a.nota * 2 END), 0) +
        COALESCE(AVG(CASE WHEN a.criterio = 'sabor' THEN a.nota * 3 END), 0) +
        COALESCE(AVG(CASE WHEN a.criterio = 'adequacao' THEN a.nota * 1 END), 0)
      ) / 13 * 10 as pontuacao_final
    FROM pratos p
    LEFT JOIN avaliacoes a ON p.id = a.prato_id
    GROUP BY p.id, p.nome, p.restaurante, p.imagem
    ORDER BY pontuacao_final DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// WebSocket para tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando!' });
});
// Iniciar servidor
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

// Export para Vercel
module.exports = app;
