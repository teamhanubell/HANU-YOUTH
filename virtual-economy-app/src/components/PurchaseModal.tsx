import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { CoinPackCard } from './CoinPackCard'
import { Button } from '@/components/ui/button'

const coinPacks = [
  { id: '1', amount: 100, cost: 1.99 },
  { id: '2', amount: 500, cost: 4.99 },
  { id: '3', amount: 1000, cost: 9.99 },
  { id: '4', amount: 5000, cost: 39.99 },
]

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (amount: number) => void
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, onPurchase }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Purchase Coins</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coinPacks.map(pack => (
            <CoinPackCard
              key={pack.id}
              amount={pack.amount}
              cost={pack.cost}
              onPurchase={() => {
                onPurchase(pack.amount)
                onClose()
              }}
            />
          ))}
        </div>
        <div className="mt-4">
          <Button onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}