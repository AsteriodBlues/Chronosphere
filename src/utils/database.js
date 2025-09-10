import Dexie from 'dexie'

class ChronosphereDB extends Dexie {
  constructor() {
    super('ChronosphereDB')
    
    this.version(1).stores({
      sessions: '++id, startTime, endTime, planned, actual, category, efficiency, mood, distractions',
      streaks: '++id, date, count, type',
      milestones: '++id, name, achievedAt, type, data',
      settings: 'key, value, updatedAt',
      analytics: '++id, date, type, data',
      backups: '++id, createdAt, type, data'
    })
    
    this.sessions = this.table('sessions')
    this.streaks = this.table('streaks')
    this.milestones = this.table('milestones')
    this.settings = this.table('settings')
    this.analytics = this.table('analytics')
    this.backups = this.table('backups')
  }
}

const db = new ChronosphereDB()

// Database operations
export const dbOperations = {
  // Sessions
  async addSession(sessionData) {
    try {
      const id = await db.sessions.add({
        ...sessionData,
        createdAt: new Date(),
        syncStatus: 'pending'
      })
      return id
    } catch (error) {
      console.error('Failed to add session:', error)
      throw error
    }
  },
  
  async getSessionsByDateRange(startDate, endDate) {
    try {
      return await db.sessions
        .where('startTime')
        .between(startDate, endDate)
        .toArray()
    } catch (error) {
      console.error('Failed to get sessions:', error)
      return []
    }
  },
  
  async getRecentSessions(limit = 50) {
    try {
      return await db.sessions
        .orderBy('startTime')
        .reverse()
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Failed to get recent sessions:', error)
      return []
    }
  },
  
  async updateSession(id, updates) {
    try {
      await db.sessions.update(id, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to update session:', error)
      throw error
    }
  },
  
  async deleteSession(id) {
    try {
      await db.sessions.delete(id)
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw error
    }
  },
  
  // Milestones
  async addMilestone(milestoneData) {
    try {
      const id = await db.milestones.add({
        ...milestoneData,
        achievedAt: new Date()
      })
      return id
    } catch (error) {
      console.error('Failed to add milestone:', error)
      throw error
    }
  },
  
  async getMilestones() {
    try {
      return await db.milestones.orderBy('achievedAt').reverse().toArray()
    } catch (error) {
      console.error('Failed to get milestones:', error)
      return []
    }
  },
  
  // Settings
  async setSetting(key, value) {
    try {
      await db.settings.put({
        key,
        value: JSON.stringify(value),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to save setting:', error)
      throw error
    }
  },
  
  async getSetting(key, defaultValue = null) {
    try {
      const setting = await db.settings.get(key)
      return setting ? JSON.parse(setting.value) : defaultValue
    } catch (error) {
      console.error('Failed to get setting:', error)
      return defaultValue
    }
  },
  
  async getAllSettings() {
    try {
      const settings = await db.settings.toArray()
      const result = {}
      settings.forEach(setting => {
        result[setting.key] = JSON.parse(setting.value)
      })
      return result
    } catch (error) {
      console.error('Failed to get all settings:', error)
      return {}
    }
  },
  
  // Analytics
  async addAnalyticsEvent(type, data) {
    try {
      const id = await db.analytics.add({
        type,
        data: JSON.stringify(data),
        date: new Date()
      })
      return id
    } catch (error) {
      console.error('Failed to add analytics event:', error)
      throw error
    }
  },
  
  async getAnalyticsByType(type, limit = 100) {
    try {
      const events = await db.analytics
        .where('type')
        .equals(type)
        .orderBy('date')
        .reverse()
        .limit(limit)
        .toArray()
      
      return events.map(event => ({
        ...event,
        data: JSON.parse(event.data)
      }))
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return []
    }
  },
  
  // Backups
  async createBackup() {
    try {
      const [sessions, milestones, settings, analytics] = await Promise.all([
        db.sessions.toArray(),
        db.milestones.toArray(),
        db.settings.toArray(),
        db.analytics.toArray()
      ])
      
      const backup = {
        sessions,
        milestones,
        settings,
        analytics,
        version: 1,
        createdAt: new Date()
      }
      
      const id = await db.backups.add({
        type: 'full',
        data: JSON.stringify(backup),
        createdAt: new Date(),
        size: JSON.stringify(backup).length
      })
      
      return id
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  },
  
  async restoreFromBackup(backupId) {
    try {
      const backup = await db.backups.get(backupId)
      if (!backup) throw new Error('Backup not found')
      
      const data = JSON.parse(backup.data)
      
      // Clear existing data
      await db.transaction('rw', db.sessions, db.milestones, db.settings, db.analytics, async () => {
        await db.sessions.clear()
        await db.milestones.clear()
        await db.settings.clear()
        await db.analytics.clear()
        
        // Restore data
        await db.sessions.bulkAdd(data.sessions)
        await db.milestones.bulkAdd(data.milestones)
        await db.settings.bulkAdd(data.settings)
        await db.analytics.bulkAdd(data.analytics)
      })
      
      return true
    } catch (error) {
      console.error('Failed to restore backup:', error)
      throw error
    }
  },
  
  async getBackups() {
    try {
      return await db.backups
        .orderBy('createdAt')
        .reverse()
        .toArray()
    } catch (error) {
      console.error('Failed to get backups:', error)
      return []
    }
  },
  
  // Maintenance
  async cleanOldData(daysToKeep = 365) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      const [deletedSessions, deletedAnalytics] = await Promise.all([
        db.sessions.where('startTime').below(cutoffDate).delete(),
        db.analytics.where('date').below(cutoffDate).delete()
      ])
      
      return { deletedSessions, deletedAnalytics }
    } catch (error) {
      console.error('Failed to clean old data:', error)
      throw error
    }
  },
  
  async getDatabaseSize() {
    try {
      const [sessionCount, milestoneCount, settingCount, analyticsCount, backupCount] = await Promise.all([
        db.sessions.count(),
        db.milestones.count(),
        db.settings.count(),
        db.analytics.count(),
        db.backups.count()
      ])
      
      return {
        sessions: sessionCount,
        milestones: milestoneCount,
        settings: settingCount,
        analytics: analyticsCount,
        backups: backupCount,
        total: sessionCount + milestoneCount + settingCount + analyticsCount + backupCount
      }
    } catch (error) {
      console.error('Failed to get database size:', error)
      return { total: 0 }
    }
  },
  
  // Import/Export
  async exportAllData() {
    try {
      const [sessions, milestones, settings, analytics] = await Promise.all([
        db.sessions.toArray(),
        db.milestones.toArray(),
        db.settings.toArray(),
        db.analytics.toArray()
      ])
      
      return {
        version: 1,
        exportDate: new Date().toISOString(),
        data: {
          sessions,
          milestones,
          settings,
          analytics
        }
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  },
  
  async importData(importData, replaceExisting = false) {
    try {
      const { data } = importData
      
      if (replaceExisting) {
        await db.transaction('rw', db.sessions, db.milestones, db.settings, db.analytics, async () => {
          await db.sessions.clear()
          await db.milestones.clear()
          await db.settings.clear()
          await db.analytics.clear()
          
          if (data.sessions) await db.sessions.bulkAdd(data.sessions)
          if (data.milestones) await db.milestones.bulkAdd(data.milestones)
          if (data.settings) await db.settings.bulkAdd(data.settings)
          if (data.analytics) await db.analytics.bulkAdd(data.analytics)
        })
      } else {
        // Merge data
        if (data.sessions) {
          for (const session of data.sessions) {
            await db.sessions.add({
              ...session,
              importedAt: new Date()
            })
          }
        }
        
        if (data.milestones) {
          for (const milestone of data.milestones) {
            await db.milestones.add({
              ...milestone,
              importedAt: new Date()
            })
          }
        }
        
        if (data.settings) {
          for (const setting of data.settings) {
            await db.settings.put({
              ...setting,
              updatedAt: new Date()
            })
          }
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }
}

// Enhanced localStorage fallback for when IndexedDB is not available
export const localStorageOperations = {
  setItem(key, value) {
    try {
      localStorage.setItem(`chronosphere_${key}`, JSON.stringify({
        value,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('LocalStorage failed:', error)
    }
  },
  
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`chronosphere_${key}`)
      return item ? JSON.parse(item).value : defaultValue
    } catch (error) {
      console.warn('LocalStorage read failed:', error)
      return defaultValue
    }
  },
  
  removeItem(key) {
    try {
      localStorage.removeItem(`chronosphere_${key}`)
    } catch (error) {
      console.warn('LocalStorage remove failed:', error)
    }
  },
  
  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('chronosphere_'))
        .forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('LocalStorage clear failed:', error)
    }
  }
}

// Storage adapter that automatically chooses best available option
export const storage = {
  async isIndexedDBAvailable() {
    try {
      return 'indexedDB' in window && window.indexedDB !== null
    } catch {
      return false
    }
  },
  
  async initialize() {
    try {
      if (await this.isIndexedDBAvailable()) {
        await db.open()
        return 'indexeddb'
      } else {
        console.warn('IndexedDB not available, falling back to localStorage')
        return 'localstorage'
      }
    } catch (error) {
      console.error('Database initialization failed:', error)
      return 'memory'
    }
  },
  
  async store(key, value) {
    try {
      if (await this.isIndexedDBAvailable()) {
        await dbOperations.setSetting(key, value)
      } else {
        localStorageOperations.setItem(key, value)
      }
    } catch (error) {
      console.error('Storage failed:', error)
    }
  },
  
  async retrieve(key, defaultValue = null) {
    try {
      if (await this.isIndexedDBAvailable()) {
        return await dbOperations.getSetting(key, defaultValue)
      } else {
        return localStorageOperations.getItem(key, defaultValue)
      }
    } catch (error) {
      console.error('Storage retrieval failed:', error)
      return defaultValue
    }
  }
}

export default db
export { db }