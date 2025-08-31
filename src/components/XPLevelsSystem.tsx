
'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, Star, Zap, ChevronRight, Gift, Flame as FlameIcon, 
  Coins, Gem, Lock, MessageSquare, Moon, Download, BarChart2, 
  CheckCircle, Crown, Clock, Award, Users 
} from 'lucide-react'
import Leaderboard from './Leaderboard'
import { useVirtualEconomy } from '@/lib/virtualEconomy'

// AWS color palette
const AWS_COLORS = {
  blue: {
    100: '#EBF5FB',
    200: '#D6EAF8',
    300: '#AED6F1',
    400: '#5DADE2',
    500: '#3498DB',
    600: '#2E86C1',
    700: '#2874A6'
  },
  orange: {
    100: '#FEF5E7',
    200: '#FADBD8',
    300: '#F5B041',
    400: '#EB984E',
    500: '#E67E22',
    600: '#D35400'
  },
  green: {
    100: '#E8F8F5',
    200: '#D1F2EB',
    300: '#A3E4D7',
    400: '#76D7C4',
    500: '#48C9B0',
    600: '#1ABC9C'
  },
  gray: {
    100: '#F8F9F9',
    200: '#EBEDEE',
    300: '#D5DBDB',
    400: '#AAB7B8',
    500: '#7F8C8D',
    600: '#566573',
    700: '#2C3E50'
  },
  purple: {
    100: '#F5EEF8',
    200: '#E8DAEF',
    300: '#D2B4DE',
    400: '#BB8FCE',
    500: '#A569BD',
    600: '#8E44AD'
  }
} as const;

// AWS styling helpers
const awsCard = 'bg-white border border-gray-200 rounded-lg shadow-xs hover:shadow-sm transition-shadow'

interface LevelRewards {
  coins: number
  gems: number
  features: string[]
}

interface LevelInfo {
  xpRequired: number
  rewards: LevelRewards
}

const LEVELS: Record<number, LevelInfo> = {
  1: { xpRequired: 0, rewards: { coins: 100, gems: 10, features: ['basic_profile'] } },
  2: { xpRequired: 1000, rewards: { coins: 200, gems: 15, features: ['dark_mode'] } },
  3: { xpRequired: 2500, rewards: { coins: 300, gems: 20, features: ['export_data'] } },
  4: { xpRequired: 5000, rewards: { coins: 400, gems: 25, features: ['advanced_analytics'] } },
  5: { xpRequired: 10000, rewards: { coins: 500, gems: 30, features: ['ai_assistant'] } },
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  basic_profile: 'Customize your profile with colors and bio',
  dark_mode: 'Enable dark mode for better visibility at night',
  export_data: 'Export your data for backup or analysis',
  advanced_analytics: 'Get detailed insights about your progress',
  ai_assistant: 'Unlock the AI assistant to help with your learning',
}

export default function XPLevelsSystem() {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpInfo, setLevelUpInfo] = useState<{oldLevel: number, newLevel: number} | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  
  // Virtual economy hook
  const {
    level,
    xp,
    coins,
    gems,
    streak,
    addXP,
    addCoins,
    addGems
  } = useVirtualEconomy()
  
  // Calculate level progress
  const currentLevelInfo = LEVELS[level] || { xpRequired: 0, rewards: { coins: 0, gems: 0, features: [] } }
  const nextLevelInfo = LEVELS[level + 1] || { xpRequired: 0, rewards: { coins: 0, gems: 0, features: [] } }
  const xpForNextLevel = nextLevelInfo.xpRequired - currentLevelInfo.xpRequired
  const currentLevelXP = xp - currentLevelInfo.xpRequired
  const levelProgress = Math.min(100, Math.max(0, (currentLevelXP / xpForNextLevel) * 100))

  // Handle level up effect
  useEffect(() => {
    const checkLevelUp = async () => {
      const currentLevel = level
      const xpResult = await addXP(0) // Just check without adding XP
      
      if (xpResult.newLevel && xpResult.level > currentLevel) {
        setLevelUpInfo({ oldLevel: currentLevel, newLevel: xpResult.level })
        setShowLevelUp(true)
      }
    }
    
    checkLevelUp()
  }, [xp, addXP])
  
  // Helper functions with AWS styling
  const getLevelIcon = (lvl: number) => {
    if (lvl >= 5) return <Crown className="w-5 h-5" style={{ color: AWS_COLORS.orange[500] }} />
    if (lvl >= 3) return <Trophy className="w-5 h-5" style={{ color: AWS_COLORS.blue[500] }} />
    return <Star className="w-5 h-5" style={{ color: AWS_COLORS.blue[400] }} />
  }
  
  const getLevelBadge = (lvl: number) => {
    if (lvl >= 5) return (
      <span className="px-2 py-1 text-xs font-medium rounded" 
            style={{ background: AWS_COLORS.orange[200], color: AWS_COLORS.orange[700] }}>
        Legend
      </span>
    )
    if (lvl >= 3) return (
      <span className="px-2 py-1 text-xs font-medium rounded" 
            style={{ background: AWS_COLORS.gray[200], color: AWS_COLORS.gray[700] }}>
        Elite
      </span>
    )
    return (
      <span className="px-2 py-1 text-xs font-medium rounded" 
            style={{ background: AWS_COLORS.blue[200], color: AWS_COLORS.blue[700] }}>
        Beginner
      </span>
    )
  }
  
  const getFeatureIcon = (feature: string, isUpcoming: boolean = false) => {
    const iconProps = {
      className: `w-4 h-4 ${isUpcoming ? 'opacity-70' : ''}`,
      style: { color: isUpcoming ? AWS_COLORS.gray[500] : AWS_COLORS.green[500] }
    }
    
    switch(feature) {
      case 'dark_mode':
        return <Moon {...iconProps} />
      case 'export_data':
        return <Download {...iconProps} />
      case 'advanced_analytics':
        return <BarChart2 {...iconProps} />
      case 'ai_assistant':
        return <MessageSquare {...iconProps} />
      default:
        return <CheckCircle {...iconProps} />
    }
  }

  // Level up modal
  const LevelUpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Level Up!</h3>
          <p className="text-gray-600 mb-6">You've reached level {levelUpInfo?.newLevel}!</p>
          
          <div className="bg-aws-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-aws-blue-800 mb-2">Rewards Unlocked</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Coins className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">+{currentLevelInfo.rewards.coins} Coins</span>
              </div>
              <div className="flex items-center">
                <Gem className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-gray-700">+{currentLevelInfo.rewards.gems} Gems</span>
              </div>
              {currentLevelInfo.rewards.features.map(feature => (
                <div key={feature} className="flex items-center">
                  {getFeatureIcon(feature)}
                  <span className="ml-2 text-gray-700">
                    {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowLevelUp(false)}
            className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors"
            style={{
              backgroundColor: AWS_COLORS.blue[600]
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = AWS_COLORS.blue[700]}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = AWS_COLORS.blue[600]}
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  )

  // Get all unlocked features from previous levels
  const unlockedFeatures = Object.entries(LEVELS)
    .filter(([lvl]) => Number(lvl) <= level)
    .flatMap(([_, info]) => info.rewards.features)
    .filter((feature, index, self) => self.indexOf(feature) === index)

  return (
    <div className="min-h-screen" style={{ backgroundColor: AWS_COLORS.gray[50], padding: '1.5rem' }}>
      {showLevelUp && levelUpInfo && <LevelUpModal />}
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div style={{ 
              backgroundColor: AWS_COLORS.blue[100], 
              padding: '0.5rem', 
              borderRadius: '0.5rem' 
            }}>
              <Trophy className="w-6 h-6" style={{ color: AWS_COLORS.blue[500] }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-aws-gray-900">Achievements</h1>
              <p className="text-aws-gray-500">Level up and unlock new features</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className={awsCard}>
              <div className="flex items-center p-4">
                <div style={{ 
                  backgroundColor: AWS_COLORS.blue[100], 
                  padding: '0.5rem', 
                  borderRadius: '9999px',
                  marginRight: '0.75rem'
                }}>
                  <Trophy className="w-5 h-5" style={{ color: AWS_COLORS.blue[500] }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>Level</p>
                  <p className="font-semibold" style={{ color: AWS_COLORS.gray[800] }}>{level}</p>
                </div>
              </div>
            </div>
            
            <div className={awsCard}>
              <div className="flex items-center p-4">
                <div style={{ 
                  backgroundColor: AWS_COLORS.orange[100], 
                  padding: '0.5rem', 
                  borderRadius: '9999px',
                  marginRight: '0.75rem'
                }}>
                  <Coins className="w-5 h-5" style={{ color: AWS_COLORS.orange[500] }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>Coins</p>
                  <p className="font-semibold" style={{ color: AWS_COLORS.gray[800] }}>{coins}</p>
                </div>
              </div>
            </div>
            
            <div className={awsCard}>
              <div className="flex items-center p-4">
                <div style={{ 
                  backgroundColor: AWS_COLORS.blue[100], 
                  padding: '0.5rem', 
                  borderRadius: '9999px',
                  marginRight: '0.75rem'
                }}>
                  <Gem className="w-5 h-5" style={{ color: AWS_COLORS.blue[500] }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>Gems</p>
                  <p className="font-semibold" style={{ color: AWS_COLORS.gray[800] }}>{gems}</p>
                </div>
              </div>
            </div>
            
            <div className={awsCard}>
              <div className="flex items-center p-4">
                <div style={{ 
                  backgroundColor: AWS_COLORS.orange[100], 
                  padding: '0.5rem', 
                  borderRadius: '9999px',
                  marginRight: '0.75rem'
                }}>
                  <FlameIcon className="w-5 h-5" style={{ color: AWS_COLORS.orange[500] }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>Streak</p>
                  <p className="font-semibold" style={{ color: AWS_COLORS.gray[800] }}>{streak} days</p>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-aws-gray-900">Achievements</h1>
          <p className="text-aws-gray-500">Track your learning journey</p>
        </div>

        {/* Level Progress */}
        <div className={awsCard}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium" style={{ color: AWS_COLORS.gray[800] }}>Level Progress</h3>
                <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>
                  Level {level} of {Object.keys(LEVELS).length}
                </p>
              </div>
              <div className="border rounded-md px-2 py-1" style={{ borderColor: AWS_COLORS.blue[300] }}>
                {getLevelBadge(level)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm" style={{ color: AWS_COLORS.gray[700] }}>
                  <span>XP Progress</span>
                  <span className="font-medium">
                    {currentLevelXP.toLocaleString()}
                    {xpForNextLevel > 0 ? ` / ${xpForNextLevel.toLocaleString()}` : ' (Max Level)'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${levelProgress}%`,
                      backgroundColor: AWS_COLORS.blue[500]
                    }}
                  />
                </div>
                
                {xpForNextLevel > 0 && (
                  <div className="text-right text-xs" style={{ color: AWS_COLORS.gray[500] }}>
                    {xpForNextLevel - currentLevelXP} XP to level {level + 1}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button 
                  onClick={() => addXP(100, 'activity')}
                  className="flex items-center justify-center text-xs px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderColor: AWS_COLORS.gray[300],
                    color: AWS_COLORS.gray[700]
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" style={{ color: AWS_COLORS.orange[500] }} />
                  +100 XP
                </button>
                <button
                  onClick={() => addXP(500, 'activity')}
                  className="flex items-center justify-center text-xs px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderColor: AWS_COLORS.gray[300],
                    color: AWS_COLORS.gray[700]
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" style={{ color: AWS_COLORS.orange[500] }} />
                  +500 XP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unlocked Features */}
        <div className={awsCard}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium" style={{ color: AWS_COLORS.gray[800] }}>Unlocked Features</h3>
                <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>
                  {unlockedFeatures.length} of {Object.values(LEVELS).flatMap(l => l.rewards.features).length} unlocked
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: AWS_COLORS.gray[300],
                    color: AWS_COLORS.gray[700]
                  }}
                >
                  View All
                </button>
              </div>
            </div>
            
            {unlockedFeatures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedFeatures.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-start p-4 rounded-lg border hover:shadow-sm transition-shadow"
                    style={{ borderColor: AWS_COLORS.gray[200] }}
                  >
                    <div 
                      className="p-2 rounded-lg mr-3"
                      style={{ 
                        backgroundColor: AWS_COLORS.green[100],
                        color: AWS_COLORS.green[500]
                      }}
                    >
                      {getFeatureIcon(feature)}
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: AWS_COLORS.gray[800] }}>
                        {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </h4>
                      <p className="text-xs" style={{ color: AWS_COLORS.gray[600] }}>
                        {FEATURE_DESCRIPTIONS[feature] || 'New feature unlocked'}
                      </p>
                      {selectedFeature === feature && (
                        <div className="mt-2 pt-2 border-t" style={{ borderColor: AWS_COLORS.gray[100] }}>
                          <p className="text-xs" style={{ color: AWS_COLORS.gray[500] }}>
                            Unlocked at level {Object.entries(LEVELS).find(([_, l]) => l.rewards.features.includes(feature))?.[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div 
                  className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: AWS_COLORS.gray[100] }}
                >
                  <Lock className="w-5 h-5" style={{ color: AWS_COLORS.gray[400] }} />
                </div>
                <h4 className="font-medium" style={{ color: AWS_COLORS.gray[800] }}>No features unlocked yet</h4>
                <p className="text-sm mt-1" style={{ color: AWS_COLORS.gray[500] }}>Reach higher levels to unlock more features</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Level Preview */}
        <div className={awsCard}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium" style={{ color: AWS_COLORS.gray[800] }}>Next Level Preview</h3>
                <p className="text-sm" style={{ color: AWS_COLORS.gray[600] }}>
                  {level < Object.keys(LEVELS).length 
                    ? `Unlock at level ${level + 1}` 
                    : 'You\'ve reached the maximum level!'}
                </p>
              </div>
              <div className="border rounded-md px-2 py-1 text-sm" style={{ 
                borderColor: AWS_COLORS.blue[200],
                color: AWS_COLORS.blue[600],
                backgroundColor: AWS_COLORS.blue[50]
              }}>
                {level < Object.keys(LEVELS).length ? `Level ${level + 1}` : 'Max Level'}
              </div>
            </div>

            {level < Object.keys(LEVELS).length ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div 
                    className="p-2 rounded-lg mr-3"
                    style={{ 
                      backgroundColor: AWS_COLORS.blue[100],
                      color: AWS_COLORS.blue[600]
                    }}
                  >
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: AWS_COLORS.gray[800] }}>Level {level + 1} Rewards</h4>
                    <p className="text-xs" style={{ color: AWS_COLORS.gray[600] }}>Unlock these rewards at the next level</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className="p-3 rounded-lg border"
                    style={{ borderColor: AWS_COLORS.gray[200] }}
                  >
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 mr-2" style={{ color: AWS_COLORS.orange[400] }} />
                      <span className="text-sm font-medium" style={{ color: AWS_COLORS.gray[800] }}>
                        +{LEVELS[level + 1]?.rewards.coins} Coins
                      </span>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-lg border"
                    style={{ borderColor: AWS_COLORS.gray[200] }}
                  >
                    <div className="flex items-center">
                      <Gem className="w-4 h-4 mr-2" style={{ color: AWS_COLORS.purple[400] }} />
                      <span className="text-sm font-medium" style={{ color: AWS_COLORS.gray[800] }}>
                        +{LEVELS[level + 1]?.rewards.gems} Gems
                      </span>
                    </div>
                  </div>
                </div>

                {LEVELS[level + 1]?.rewards.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium" style={{ color: AWS_COLORS.gray[800] }}>New Features</h4>
                    <div className="space-y-2">
                      {LEVELS[level + 1]?.rewards.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-start p-3 rounded-lg border hover:shadow-sm transition-shadow"
                    style={{ borderColor: AWS_COLORS.gray[200] }}
                  >
                    <div 
                      className="p-1.5 rounded-md mr-3"
                      style={{ 
                        backgroundColor: AWS_COLORS.green[100],
                        color: AWS_COLORS.green[500]
                      }}
                    >
                      {getFeatureIcon(feature, true)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: AWS_COLORS.gray[800] }}>
                        {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                      <p className="text-xs" style={{ color: AWS_COLORS.gray[600] }}>
                        {FEATURE_DESCRIPTIONS[feature] || 'New feature'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
              <div className="text-center py-8">
                <Trophy 
                  className="w-10 h-10 mx-auto mb-3" 
                  style={{ color: AWS_COLORS.orange[400] }} 
                />
                <h4 className="font-medium" style={{ color: AWS_COLORS.gray[800] }}>Maximum Level Reached!</h4>
                <p className="text-sm mt-1" style={{ color: AWS_COLORS.gray[600] }}>
                  You've unlocked all available features
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Leaderboard Section */}
      <div className="mt-12">
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 mr-2" style={{ color: AWS_COLORS.blue[500] }} />
          <h2 className="text-xl font-semibold" style={{ color: AWS_COLORS.gray[800] }}>Community Leaderboard</h2>
        </div>
        <Leaderboard currentUserId={1} itemsToShow={5} />
      </div>
    </div>
  )
}
