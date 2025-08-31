'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Coins, Gem, ShoppingCart, TrendingUp, Gift, Clock, 
  Star, Trophy, Zap, Sparkles, Crown, Package, 
  History, Filter, Search
} from 'lucide-react'

interface EconomyBalance {
  coins: number
  gems: number
  total_earned_coins: number
  total_earned_gems: number
  total_spent_coins: number
  total_spent_gems: number
}

interface ShopCategory {
  id: string
  name: string
  description: string
  icon: string
  item_count: number
}

interface ShopItem {
  id: string
  name: string
  description: string
  type: string
  cost: {
    coins: number
    gems: number
  }
  original_cost?: {
    coins: number
    gems: number
  }
  discount?: number
  rarity: string
  category: string
  is_new?: boolean
  is_featured?: boolean
  is_limited?: boolean
  is_seasonal?: boolean
  ends_at?: string
  duration?: number
  items_included?: string[]
  popularity?: number
}

interface FeaturedItemsResponse {
  featured_items: ShopItem[]
  daily_special: ShopItem
  refresh_time: string
}

interface Transaction {
  id: string
  type: 'earned' | 'spent'
  currency: 'coins' | 'gems'
  amount: number
  source?: string
  purpose?: string
  item_id?: string
  description: string
  timestamp: string
}

interface CoinPack {
  id: string
  coins: number
  price: number
  currency?: string
  bonus?: number
}

export default function VirtualEconomy() {
  const [balance, setBalance] = useState<EconomyBalance | null>(null)
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [featuredItems, setFeaturedItems] = useState<FeaturedItemsResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [lastAction, setLastAction] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buyTarget, setBuyTarget] = useState<ShopItem | null>(null)
  const [processingPurchase, setProcessingPurchase] = useState(false)

  const MOCK_COIN_PACKS: CoinPack[] = [
    { id: 'pack_small', coins: 250, price: 1.99, currency: 'USD', bonus: 0 },
    { id: 'pack_medium', coins: 750, price: 4.99, currency: 'USD', bonus: 50 },
    { id: 'pack_large', coins: 2000, price: 12.99, currency: 'USD', bonus: 300 },
  ]

  useEffect(() => {
    loadEconomyData()
  }, [])

  const loadEconomyData = async () => {
    try {
      // Load balance
      const balanceResponse = await fetch('/api/gamification/economy')
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        setBalance(balanceData.balance || balanceData)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/gamification/economy/shop')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || categoriesData)
      }

      // Load featured items
      const featuredResponse = await fetch('/api/gamification/economy/shop')
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        setFeaturedItems(featuredData.featured_items || featuredData)
      }

      // Load transactions
      const transactionsResponse = await fetch('/api/gamification/economy')
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }
    } catch (error) {
      console.error('Error loading economy data:', error)
    } finally {
      setLoading(false)
    }
  }

  const earnCurrency = async (amount: number, currencyType: 'coins' | 'gems', source: string) => {
    try {
      const response = await fetch('/api/gamification/economy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'earn',
          amount: amount,
          currency_type: currencyType,
          source: source,
          description: `${source} reward`
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastAction(result)
        await loadEconomyData()
        alert(`🎉 Earned ${amount} ${currencyType}!`)
      }
    } catch (error) {
      console.error('Error earning currency:', error)
    }
  }

  const purchaseItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/gamification/economy/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'purchase',
          item_id: itemId
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastAction(result)
        await loadEconomyData()
        alert(`✅ ${result.message}`)
      } else {
        const error = await response.json()
        alert(`❌ ${error.detail}`)
      }
    } catch (error) {
      console.error('Error purchasing item:', error)
    }
  }

  const openBuyModal = (item: ShopItem | null) => {
    setBuyTarget(item)
    setShowBuyModal(true)
  }

  const confirmCoinPurchase = async (pack: CoinPack) => {
    try {
      setProcessingPurchase(true)
      const response = await fetch('/api/gamification/economy/purchase_coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'purchase_coins',
          pack_id: pack.id,
          coins: pack.coins,
          price: pack.price
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastAction(result)
        await loadEconomyData()
        alert(`✅ Purchased ${pack.coins.toLocaleString()} coins`)
      } else {
        const error = await response.json()
        alert(`❌ ${error.detail || 'Purchase failed'}`)
      }
    } catch (error) {
      console.error('Error purchasing coin pack:', error)
    } finally {
      setProcessingPurchase(false)
      setShowBuyModal(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500/50'
      case 'rare': return 'text-blue-400 border-blue-500/50'
      case 'epic': return 'text-purple-400 border-purple-500/50'
      case 'legendary': return 'text-yellow-400 border-yellow-500/50'
      case 'special': return 'text-green-400 border-green-500/50'
      default: return 'text-gray-400 border-gray-500/50'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4" />
      case 'rare': return <Sparkles className="w-4 h-4" />
      case 'epic': return <Trophy className="w-4 h-4" />
      case 'legendary': return <Crown className="w-4 h-4" />
      case 'special': return <Gift className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const formatTimeRemaining = (endTime?: string) => {
    if (!endTime) return null
    
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-8 h-8 text-yellow-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Virtual Economy
            </h1>
            <Gem className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xl text-gray-600">
            Earn coins and gems, shop for exclusive items, and build your wealth!
          </p>
        </div>

        {/* Last Action Alert */}
        {lastAction && (
          <Alert className="bg-green-50 border border-green-200">
            <Gift className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {lastAction.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Currency Balance */}
        {balance && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <TrendingUp className="w-6 h-6" />
                Your Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Coins</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {balance.coins.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openBuyModal(null)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy More
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Gem className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gems</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {balance.gems.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Get More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
