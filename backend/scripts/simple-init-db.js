const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

async function simpleInitDatabase() {
  console.log('[SimpleInit] Iniciando configuração do PostgreSQL...')
  
  // Primeiro, conectar ao PostgreSQL sem especificar banco
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Banco padrão
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    logging: false
  })

  try {
    // Testar conexão
    await sequelize.authenticate()
    console.log('[SimpleInit] Conexão com PostgreSQL estabelecida')
    
    // Verificar se o banco existe
    const dbName = process.env.DB_NAME || 'painel_kpi_db'
    const [results] = await sequelize.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      {
        bind: [dbName],
        type: Sequelize.QueryTypes.SELECT
      }
    )
    
    if (results && results.length > 0) {
      console.log(`[SimpleInit] Banco '${dbName}' já existe`)
    } else {
      console.log(`[SimpleInit] Criando banco '${dbName}'...`)
      try {
        await sequelize.query(`CREATE DATABASE "${dbName}"`)
        console.log(`[SimpleInit] Banco '${dbName}' criado com sucesso`)
      } catch (createError) {
        if (createError.message.includes('already exists')) {
          console.log(`[SimpleInit] Banco '${dbName}' já existe (verificado via erro)`)
        } else {
          throw createError
        }
      }
    }
    
    await sequelize.close()
    
    // Agora conectar ao banco criado
    const appSequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: dbName,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_password',
      logging: false
    })
    
    await appSequelize.authenticate()
    console.log(`[SimpleInit] Conectado ao banco '${dbName}'`)
    
    // Criar tabelas manualmente
    console.log('[SimpleInit] Criando tabelas...')
    
    // Tabela vendas
    await appSequelize.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        erp_id VARCHAR(50) UNIQUE NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        cliente_id VARCHAR(50) NOT NULL,
        nome_cliente VARCHAR(255) NOT NULL,
        vendedor_id VARCHAR(50),
        nome_vendedor VARCHAR(255),
        data TIMESTAMP NOT NULL,
        situacao_id VARCHAR(50) NOT NULL,
        nome_situacao VARCHAR(100) NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        valor_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
        valor_frete DECIMAL(10,2) NOT NULL DEFAULT 0,
        nome_canal_venda VARCHAR(100) NOT NULL,
        nome_loja VARCHAR(100) NOT NULL,
        condicao_pagamento VARCHAR(100) NOT NULL,
        situacao_financeiro VARCHAR(50) NOT NULL,
        situacao_estoque VARCHAR(50) NOT NULL,
        observacoes TEXT,
        observacoes_interna TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    // Tabela clientes
    await appSequelize.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        erp_id VARCHAR(50) UNIQUE NOT NULL,
        tipo_pessoa VARCHAR(2) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        razao_social VARCHAR(255),
        cnpj VARCHAR(20),
        inscricao_estadual VARCHAR(20),
        inscricao_municipal VARCHAR(20),
        cpf VARCHAR(20),
        rg VARCHAR(20),
        data_nascimento DATE,
        telefone VARCHAR(20) NOT NULL,
        celular VARCHAR(20) NOT NULL,
        fax VARCHAR(20),
        email VARCHAR(255) NOT NULL,
        ativo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    // Tabela produtos
    await appSequelize.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        erp_id VARCHAR(50) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        nome_grupo VARCHAR(100),
        grupo_id VARCHAR(50),
        valor_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
        valor_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
        estoque INTEGER NOT NULL DEFAULT 0,
        codigo_barras VARCHAR(50),
        descricao TEXT,
        ativo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    console.log('[SimpleInit] Tabelas criadas com sucesso')
    
    await appSequelize.close()
    console.log('[SimpleInit] Configuração do banco concluída!')
    
  } catch (error) {
    console.error('[SimpleInit] Erro ao configurar banco:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.error('[SimpleInit] Erro de autenticação. Verifique:')
      console.error('  - Usuário e senha do PostgreSQL')
      console.error('  - Variáveis DB_USER e DB_PASSWORD no .env')
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('[SimpleInit] PostgreSQL não está rodando. Verifique:')
      console.error('  - PostgreSQL está instalado e rodando')
      console.error('  - Porta 5432 está disponível')
      console.error('  - Ou use Docker: docker-compose up -d postgres')
    }
    
    process.exit(1)
  }
}

if (require.main === module) {
  simpleInitDatabase()
}

module.exports = simpleInitDatabase 