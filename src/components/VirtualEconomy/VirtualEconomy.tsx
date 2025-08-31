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

export default function VirtualEconomy() {
  const [balance, setBalance] = useState<EconomyBalance | null>(null)
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [featuredItems, setFeaturedItems] = useState<FeaturedItemsResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [lastAction, setLastAction] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Buy modal state & mock coin packs
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buyTarget, setBuyTarget] = useState<ShopItem | null>(null)
  const [processingPurchase, setProcessingPurchase] = useState(false)

  interface CoinPack { id: string; coins: number; price: number; currency?: string; bonus?: number }
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






  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }


  const openBuyModal = (item: ShopItem | null) => {
    setBuyTarget(item);
    setShowBuyModal(true);
  };

  const confirmCoinPurchase = async (pack: CoinPack) => {
    try {
      setProcessingPurchase(true)

      // Mock API call for purchasing coins - adjust endpoint as needed
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

  const formatTimeRemaining = (endTime?: string) => {
    if (!endTime) return null;
    
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };




  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'text-gray-400 border-gray-500/50';
    
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-400 border-gray-500/50';
      case 'rare': return 'text-blue-400 border-blue-500/50';
      case 'epic': return 'text-purple-400 border-purple-500/50';
      case 'legendary': return 'text-yellow-400 border-yellow-500/50';
      case 'special': return 'text-green-400 border-green-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    if (!rarity) return <Star className="w-4 h-4" />;
    
    switch (rarity.toLowerCase()) {
      case 'common': return <Star className="w-4 h-4" />;
      case 'rare': return <Sparkles className="w-4 h-4" />;
      case 'epic': return <Trophy className="w-4 h-4" />;
      case 'legendary': return <Crown className="w-4 h-4" />;
      case 'special': return <Gift className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">
                      {(balance?.coins ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">Coins</div>
                  <div className="text-xs text-gray-500">
                    Earned: {(balance?.total_earned_coins ?? 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gem className="w-6 h-6 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">
                      {(balance?.gems ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">Gems</div>
                  <div className="text-xs text-gray-500">
                    Earned: {(balance?.total_earned_gems ?? 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-2">
                    {(balance?.total_spent_coins ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Coins Spent</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {(balance?.total_spent_gems ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Gems Spent</div>
                </div>
              </div>

              {/* Quick Earn Actions */}
              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium text-gray-300 mb-2">Quick Earn:</div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => earnCurrency(10, 'coins', 'daily_bonus')}
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-100 border-gray-300"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Daily Bonus +10
                  </Button>
                  <Button 
                    onClick={() => earnCurrency(25, 'coins', 'quiz_complete')}
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-100 border-gray-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Quiz +25
                  </Button>
                  <Button 
                    onClick={() => earnCurrency(5, 'gems', 'streak_milestone')}
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-100 border-gray-300"
                  >
                    <Gem className="w-4 h-4 mr-2" />
                    Streak +5
                  </Button>
                  <Button 
                    onClick={() => earnCurrency(50, 'coins', 'achievement')}
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-100 border-gray-300"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Achievement +50
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Items */}
        {featuredItems && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-6 h-6" />
                Featured Items
              </CardTitle>
              <CardDescription className="text-gray-400">
                Special offers and daily deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Daily Special */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <span className="text-lg font-semibold text-orange-400">Daily Special</span>
                    </div>
                    {featuredItems?.daily_special?.ends_at && (
                      <div className="text-sm text-orange-400">
                        Ends in {formatTimeRemaining(featuredItems.daily_special.ends_at)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {featuredItems?.daily_special?.name ?? 'Daily Special'}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {featuredItems?.daily_special?.description ?? ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRarityColor(featuredItems?.daily_special?.rarity)}>
                          {getRarityIcon(featuredItems?.daily_special?.rarity)}
                          {featuredItems?.daily_special?.rarity ?? 'common'}
                        </Badge>
                        {(featuredItems?.daily_special?.discount ?? 0) > 0 && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                            {Math.round((featuredItems.daily_special.discount ?? 0) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">
                          {(featuredItems?.daily_special?.cost?.coins ?? 0).toLocaleString()}
                        </span>
                      </div>
                      {(featuredItems?.daily_special?.cost?.gems ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Gem className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-semibold">
                            {(featuredItems?.daily_special?.cost?.gems ?? 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <Button 
                        onClick={() => openBuyModal(featuredItems?.daily_special ?? null)}
                        variant="outline"
                        className="bg-white text-black hover:bg-gray-100 border-gray-300"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Featured Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(featuredItems?.featured_items || []).map((item, idx) => (
                    <div key={`featured-${item.id ?? idx}`} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span key={`rarity-${item.id ?? idx}`}>
                          <Badge variant="outline" className={getRarityColor(item.rarity)}>
                            {getRarityIcon(item.rarity)}
                            {item.rarity}
                          </Badge>
                        </span>
                        <div className="flex gap-2">
                          {item.is_new && (
                            <Badge key={`new-${item.id ?? idx}`} className="bg-green-500/20 text-green-400 border-green-500/50">
                              NEW
                            </Badge>
                          )}
                          {item.is_limited && (
                            <Badge key={`limited-${item.id ?? idx}`} className="bg-red-500/20 text-red-400 border-red-500/50">
                              LIMITED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-semibold">
                              {(item?.cost?.coins ?? 0).toLocaleString()}
                            </span>
                          </div>
                          { (item?.cost?.gems ?? 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <Gem className="w-4 h-4 text-cyan-400" />
                              <span className="text-cyan-400 font-semibold">
                                {(item?.cost?.gems ?? 0).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => openBuyModal(item)}
                          variant="outline"
                          className="bg-white text-black hover:bg-gray-100 border-gray-300"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {item.discount && (
                        <div className="mt-2 text-xs text-green-400">
                          Save {Math.round(item.discount * 100)}%!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shop Categories */}
        {categories.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Package className="w-6 h-6" />
                Shop Categories
              </CardTitle>
              <CardDescription className="text-gray-400">
                Browse items by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(categories || []).map((category, index) => {
                  const categoryKey = `category-${category.id || index}`;
                  return (
                    <div 
                      key={categoryKey}
                      className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                        <p className="text-xs text-gray-400 mb-2">{category.description}</p>
                        <Badge variant="outline" className="text-blue-400">
                          {(category.item_count ?? 0).toLocaleString()} items
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <History className="w-6 h-6" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(transactions || []).slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {transaction.type === 'earned' ? (
                          <Coins className="w-4 h-4 text-green-400" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-400">
                          {transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'earned' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}
                        {(transaction.amount ?? 0).toLocaleString()} {transaction.currency}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {transaction.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* BUY MODAL (mock coin packs) */}
        {showBuyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowBuyModal(false)} />
            <div className="relative z-10 w-full max-w-3xl p-6">
              <Card className="bg-black/80 border-cyan-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">
                        Buy Coins {buyTarget ? `for ${buyTarget.name}` : ''}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Select a coin pack to purchase. This is a prototype / mock integration.
                      </CardDescription>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" className="bg-white text-black hover:bg-gray-100 border-gray-300" onClick={() => setShowBuyModal(false)}>Close</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_COIN_PACKS.map((pack) => (
                      <div key={pack.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="text-center mb-3">
                          <div className="text-2xl font-bold text-yellow-400">{pack.coins.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Coins</div>
                          {pack.bonus ? <div className="text-xs text-green-400 mt-1">+{pack.bonus} bonus</div> : null}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-300">{pack.currency ?? 'USD'} {pack.price.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">Instant delivery</div>
                        </div>
                        <Button
                          onClick={() => confirmCoinPurchase(pack)}
                          disabled={processingPurchase}
                          className="w-full bg-white text-black hover:bg-gray-100 border-gray-300"
                        >
                          {processingPurchase ? 'Processing...' : `Buy ${pack.currency} ${pack.price}`}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}