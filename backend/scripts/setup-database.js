const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

async function setupDatabase() {
  console.log('[Setup] Iniciando configuração do banco de dados...')
  
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'painel_kpi_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    logging: false
  })

  try {
    // Testar conexão
    await sequelize.authenticate()
    console.log('[Setup] Conexão com PostgreSQL estabelecida com sucesso')
    
    // Importar modelos
    require('../src/models/Venda')
    require('../src/models/Cliente')
    require('../src/models/Produto')
    
    // Sincronizar modelos (criar tabelas)
    await sequelize.sync({ force: false, alter: true })
    console.log('[Setup] Tabelas criadas/atualizadas com sucesso')
    
    console.log('[Setup] Banco de dados configurado com sucesso!')
    
  } catch (error) {
    console.error('[Setup] Erro ao configurar banco de dados:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

if (require.main === module) {
  setupDatabase()
}

module.exports = setupDatabase 