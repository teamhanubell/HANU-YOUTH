// PurchaseModal.tsx (paste into a new file or inside VirtualEconomy)
import React from 'react'
import { Button } from '@/components/ui/button' // adjust imports if needed
import { Coins, ShoppingCart } from 'lucide-react'

type Bundle = { id: string; coins: number; priceUSD: string; bonus?: string }

export function PurchaseModal({
  open,
  onClose,
  onPurchase,
  itemName
}: {
  open: boolean
  onClose: () => void
  onPurchase: (bundle: Bundle) => void
  itemName?: string
}) {
  if (!open) return null

  const bundles: Bundle[] = [
    { id: 'b1', coins: 100, priceUSD: '$0.99', bonus: '+5%' },
    { id: 'b2', coins: 550, priceUSD: '$4.99', bonus: '+10%' },
    { id: 'b3', coins: 1200, priceUSD: '$9.99', bonus: '+20%' },
    { id: 'b4', coins: 2500, priceUSD: '$19.99', bonus: '+35%' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl bg-gray-900 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Buy Coins {itemName ? `for ${itemName}` : ''}</h3>
            <p className="text-sm text-gray-400">Select a bundle to complete purchase.</p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bundles.map((b) => (
            <div key={b.id} className="p-4 rounded-lg border border-gray-700 bg-black/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <div className="text-lg font-semibold">{b.coins.toLocaleString()} coins</div>
                </div>
                <div className="text-sm text-gray-400 mt-2">{b.priceUSD} • {b.bonus}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-xs">
                  Instant
                </span>
                <Button
                  onClick={() => onPurchase(b)}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy {b.priceUSD}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          This is a mock purchase UI for prototype. Wire payment gateway when integrating.
        </div>
      </div>
    </div>
  )
}