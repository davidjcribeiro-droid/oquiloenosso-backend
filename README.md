# 🚀 Backend - O Quilo é Nosso 2025

Backend Node.js com Express, SQLite e WebSocket para o sistema de votação da competição gastronômica **O Quilo é Nosso 2025**.

## ⚡ Tecnologias

- **Node.js** + **Express.js**
- **SQLite** para persistência de dados
- **Socket.io** para comunicação em tempo real
- **CORS** habilitado para integração frontend
- **UUID** para geração de IDs únicos

## 🗄️ Estrutura do Banco

### **Tabelas**
- **pratos**: Informações dos pratos participantes
- **jurados**: Dados dos jurados cadastrados  
- **avaliacoes**: Notas e avaliações dos jurados

### **Critérios de Avaliação**
1. **originalidade** (Peso: 2x)
2. **receita** (Peso: 3x)
3. **apresentacao** (Peso: 2x)
4. **harmonia** (Peso: 2x)
5. **sabor** (Peso: 3x)
6. **adequacao** (Peso: 1x)

## 📡 API Endpoints

### **Pratos**
- `GET /api/pratos` - Listar todos os pratos
- `POST /api/pratos` - Criar novo prato
- `PUT /api/pratos/:id` - Atualizar prato
- `DELETE /api/pratos/:id` - Deletar prato

### **Jurados**
- `GET /api/jurados` - Listar jurados
- `POST /api/jurados` - Cadastrar jurado
- `PUT /api/jurados/:id` - Atualizar jurado
- `DELETE /api/jurados/:id` - Remover jurado

### **Avaliações**
- `POST /api/avaliacoes` - Submeter avaliação
- `GET /api/avaliacoes/:pratoId` - Avaliações de um prato

### **Ranking**
- `GET /api/ranking` - Ranking geral com pontuações

### **Sistema**
- `GET /api/health` - Status do servidor

## 🔄 WebSocket Events

- **Conexão**: Notificação de clientes conectados
- **Sincronização**: Atualizações em tempo real
- **Broadcast**: Mudanças propagadas para todos os clientes

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 🌐 Deploy

Configurado para deploy no **Vercel** com:
- Arquivo `vercel.json` otimizado
- Compatibilidade com serverless functions
- Variáveis de ambiente configuradas

## 🔧 Configuração

### **Variáveis de Ambiente**
- `NODE_ENV`: production/development
- `PORT`: Porta do servidor (padrão: 3001)

### **CORS**
Configurado para aceitar requisições de qualquer origem durante desenvolvimento.

## 📊 Banco de Dados

Utiliza **SQLite em memória** para simplicidade:
- Dados resetam a cada reinicialização
- Ideal para demonstrações e testes
- Para produção: considere PostgreSQL ou MongoDB

## 🔐 Segurança

- CORS configurado
- Validação de dados de entrada
- Tratamento de erros padronizado

---

**Desenvolvido para a competição gastronômica O Quilo é Nosso 2025**
