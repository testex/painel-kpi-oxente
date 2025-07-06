import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

class CacheService {
  private client: any
  private isConnected = false

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    })

    this.client.on('error', (err: any) => {
      console.error('[CacheService] Redis Client Error:', err)
      this.isConnected = false
    })

    this.client.on('connect', () => {
      console.log('[CacheService] Redis connected successfully')
      this.isConnected = true
    })

    this.client.on('disconnect', () => {
      console.log('[CacheService] Redis disconnected')
      this.isConnected = false
    })
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect()
        this.isConnected = true
      } catch (error) {
        console.error('[CacheService] Failed to connect to Redis:', error)
        this.isConnected = false
      }
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.quit()
      this.isConnected = false
    }
  }

  async get(key: string): Promise<any> {
    try {
      await this.connect()
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`[CacheService] Error getting key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.connect()
      await this.client.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error(`[CacheService] Error setting key ${key}:`, error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.connect()
      await this.client.del(key)
    } catch (error) {
      console.error(`[CacheService] Error deleting key ${key}:`, error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      await this.connect()
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
        console.log(`[CacheService] Deleted ${keys.length} keys matching pattern: ${pattern}`)
      }
    } catch (error) {
      console.error(`[CacheService] Error deleting pattern ${pattern}:`, error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.connect()
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error(`[CacheService] Error checking key ${key}:`, error)
      return false
    }
  }

  // Métodos específicos para diferentes tipos de cache
  async getKPIs(period: string): Promise<any> {
    const key = `kpis:${period}`
    return this.get(key)
  }

  async setKPIs(period: string, data: any): Promise<void> {
    const key = `kpis:${period}`
    const ttl = parseInt(process.env.CACHE_TTL_KPIS || '300')
    await this.set(key, data, ttl)
  }

  async getList(entity: string, filters: string): Promise<any> {
    const key = `list:${entity}:${filters}`
    return this.get(key)
  }

  async setList(entity: string, filters: string, data: any): Promise<void> {
    const key = `list:${entity}:${filters}`
    const ttl = parseInt(process.env.CACHE_TTL_LISTS || '60')
    await this.set(key, data, ttl)
  }

  async getDetails(entity: string, id: string): Promise<any> {
    const key = `details:${entity}:${id}`
    return this.get(key)
  }

  async setDetails(entity: string, id: string, data: any): Promise<void> {
    const key = `details:${entity}:${id}`
    const ttl = parseInt(process.env.CACHE_TTL_DETAILS || '600')
    await this.set(key, data, ttl)
  }

  // Invalidar cache quando dados mudam
  async invalidateEntity(entity: string, id?: string): Promise<void> {
    if (id) {
      // Invalidar cache específico
      await this.delPattern(`details:${entity}:${id}`)
      await this.delPattern(`list:${entity}:*`)
    } else {
      // Invalidar todo cache da entidade
      await this.delPattern(`${entity}:*`)
      await this.delPattern(`list:${entity}:*`)
      await this.delPattern(`details:${entity}:*`)
    }
    
    // Invalidar KPIs que podem ter sido afetados
    await this.delPattern('kpis:*')
  }

  // Estatísticas do cache
  async getStats(): Promise<any> {
    try {
      await this.connect()
      const info = await this.client.info('memory')
      const keys = await this.client.dbSize()
      
      return {
        connected: this.isConnected,
        keys,
        info: info.split('\r\n').reduce((acc: any, line: string) => {
          const [key, value] = line.split(':')
          if (key && value) {
            acc[key] = value
          }
          return acc
        }, {})
      }
    } catch (error) {
      console.error('[CacheService] Error getting stats:', error)
      return { connected: this.isConnected, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }
}

export default new CacheService() 