import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CoinPackCardProps {
  amount: number
  cost: {
    coins: number
    gems: number
  }
  onPurchase: (amount: number) => void
}

const CoinPackCard: React.FC<CoinPackCardProps> = ({ amount, cost, onPurchase }) => {
  return (
    <Card className="p-4 bg-black/20 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-2">Buy {amount} Coins</h3>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 font-semibold">{cost.coins} Coins</span>
          {cost.gems > 0 && (
            <span className="text-cyan-400 font-semibold">{cost.gems} Gems</span>
          )}
        </div>
      </div>
      <Button 
        onClick={() => onPurchase(amount)} 
        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
      >
        Purchase
      </Button>
    </Card>
  )
}

export default CoinPackCard