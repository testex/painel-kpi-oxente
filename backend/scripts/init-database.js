const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

async function initDatabase() {
  console.log('[Init] Iniciando configuração do PostgreSQL...')
  
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
    console.log('[Init] Conexão com PostgreSQL estabelecida')
    
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
      console.log(`[Init] Banco '${dbName}' já existe`)
    } else {
      console.log(`[Init] Criando banco '${dbName}'...`)
      await sequelize.query(`CREATE DATABASE "${dbName}"`)
      console.log(`[Init] Banco '${dbName}' criado com sucesso`)
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
    console.log(`[Init] Conectado ao banco '${dbName}'`)
    
    // Importar e sincronizar modelos
    require('../src/models/Venda')
    require('../src/models/Cliente')
    require('../src/models/Produto')
    
    await appSequelize.sync({ force: false, alter: true })
    console.log('[Init] Tabelas criadas/atualizadas com sucesso')
    
    await appSequelize.close()
    console.log('[Init] Configuração do banco concluída!')
    
  } catch (error) {
    console.error('[Init] Erro ao configurar banco:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.error('[Init] Erro de autenticação. Verifique:')
      console.error('  - Usuário e senha do PostgreSQL')
      console.error('  - Variáveis DB_USER e DB_PASSWORD no .env')
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('[Init] PostgreSQL não está rodando. Verifique:')
      console.error('  - PostgreSQL está instalado e rodando')
      console.error('  - Porta 5432 está disponível')
      console.error('  - Ou use Docker: docker-compose up -d postgres')
    }
    
    process.exit(1)
  }
}

if (require.main === module) {
  initDatabase()
}

module.exports = initDatabase 