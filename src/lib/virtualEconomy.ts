import { UserLevelProgress } from '@/components/XPLevelsSystem'

export interface VirtualEconomyState {
  coins: number
  gems: number
  xp: number
  level: number
  streak: number
  lastActive: string
  inventory: Record<string, number>
  achievements: string[]
}

const STORAGE_KEY = 'virtual_economy_state'

export class VirtualEconomy {
  private state: VirtualEconomyState
  private static instance: VirtualEconomy

  private constructor(initialState?: Partial<VirtualEconomyState>) {
    this.state = this.loadState() || {
      coins: 100,
      gems: 10,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      inventory: {},
      achievements: [],
      ...initialState
    }
    this.updateStreak()
  }

  public static getInstance(): VirtualEconomy {
    if (!VirtualEconomy.instance) {
      VirtualEconomy.instance = new VirtualEconomy()
    }
    return VirtualEconomy.instance
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save virtual economy state:', error)
    }
  }

  private loadState(): VirtualEconomyState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load virtual economy state:', error)
      return null
    }
  }

  private updateStreak() {
    const today = new Date().toISOString().split('T')[0]
    const lastActive = new Date(this.state.lastActive).toISOString().split('T')[0]
    
    if (today === lastActive) return
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (lastActive === yesterdayStr) {
      this.state.streak++
    } else if (lastActive < yesterdayStr) {
      this.state.streak = 1
    }
    
    this.state.lastActive = today
    this.saveState()
  }

  public addXP(amount: number, source: string = 'activity'): { newLevel: boolean; level: number } {
    this.state.xp += amount
    const oldLevel = this.state.level
    
    // Simple level up formula: 1000 XP per level
    const newLevel = Math.floor(this.state.xp / 1000) + 1
    this.state.level = newLevel
    
    // Add level rewards
    if (newLevel > oldLevel) {
      this.state.coins += newLevel * 100
      this.state.gems += Math.floor(newLevel / 5)
      this.saveState()
      return { newLevel: true, level: newLevel }
    }
    
    this.saveState()
    return { newLevel: false, level: this.state.level }
  }

  public addCoins(amount: number, source: string = 'reward') {
    this.state.coins += amount
    this.saveState()
    return this.state.coins
  }

  public addGems(amount: number, source: string = 'reward') {
    this.state.gems += amount
    this.saveState()
    return this.state.gems
  }

  public spendCoins(amount: number): boolean {
    if (this.state.coins < amount) return false
    this.state.coins -= amount
    this.saveState()
    return true
  }

  public spendGems(amount: number): boolean {
    if (this.state.gems < amount) return false
    this.state.gems -= amount
    this.saveState()
    return true
  }

  public getState(): VirtualEconomyState {
    return { ...this.state }
  }

  public reset() {
    this.state = {
      coins: 100,
      gems: 10,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      inventory: {},
      achievements: []
    }
    this.saveState()
  }

  // Sync with server-side data
  public syncWithServerData(serverData: Partial<VirtualEconomyState>) {
    this.state = { ...this.state, ...serverData }
    this.saveState()
  }
}

export const virtualEconomy = VirtualEconomy.getInstance()

// React hook for virtual economy
import { useEffect, useState } from 'react'

export function useVirtualEconomy() {
  const [state, setState] = useState<VirtualEconomyState>(virtualEconomy.getState())

  useEffect(() => {
    const updateState = () => setState(virtualEconomy.getState())
    
    // Listen for storage events to sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        updateState()
      }
    }
    
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return {
    ...state,
    addXP: virtualEconomy.addXP.bind(virtualEconomy),
    addCoins: virtualEconomy.addCoins.bind(virtualEconomy),
    addGems: virtualEconomy.addGems.bind(virtualEconomy),
    spendCoins: virtualEconomy.spendCoins.bind(virtualEconomy),
    spendGems: virtualEconomy.spendGems.bind(virtualEconomy),
    reset: virtualEconomy.reset.bind(virtualEconomy)
  }
}
