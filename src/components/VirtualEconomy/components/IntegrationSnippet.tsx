'use client';

import React, { useState } from 'react'
import './IntegrationSnippet.css'

type Bundle = { coins: number; priceUSD: string }

// Integration snippet wrapped as a component so hooks and JSX are valid.
// Use this component as an example integration inside your VirtualEconomy component.
export function VirtualEconomyIntegrationSnippet() {
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [purchaseItemName, setPurchaseItemName] = useState<string | undefined>(undefined)

  // use this handler instead of immediate purchaseItem(...) so modal opens
  function handleOpenPurchase(itemName?: string, itemId?: string) {
    setPurchaseItemName(itemName)
    setPurchaseOpen(true)
    // optionally store itemId if you want to auto-purchase a specific shop item after bundle selection
    // setSelectedShopItemId(itemId)
  }

  // Pass to Buy Now button: onClick={() => handleOpenPurchase(featuredItems?.daily_special?.name, featuredItems?.daily_special?.id)}

  return (
    <>
      {/* Example: render a button that opens the modal */}
      <button onClick={() => handleOpenPurchase('Example Item', 'item_123')}>Buy Now (example)</button>

      {/* Add PurchaseModal component near the end of your JSX */}
      <PurchaseModal
        open={purchaseOpen}
        itemName={purchaseItemName}
        onClose={() => setPurchaseOpen(false)}
        onPurchase={(bundle) => {
          // mock flow: call your existing purchaseItem API or simulate
          console.log('User chose bundle', bundle)
          // Example: call purchase endpoint / or credit user in UI
          // purchaseItem(selectedShopItemId || '')
          alert(`Mock buy: ${bundle.coins} coins for ${bundle.priceUSD}`)
          setPurchaseOpen(false)
        }}
      />
    </>
  )
}

// Minimal PurchaseModal stub to satisfy usage; replace with your real modal implementation.
function PurchaseModal(props: {
  open: boolean
  itemName?: string
  onClose: () => void
  onPurchase: (bundle: Bundle) => void
}) {
  const { open, itemName, onClose, onPurchase } = props
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" className="purchase-modal">
      <h2>Purchase{itemName ? ` — ${itemName}` : ''}</h2>
      <h2>Purchase{itemName ? ` — ${itemName}` : ''}</h2>
      <p>Choose a bundle (example)</p>
      <div className='flex gap-8'>
        <button onClick={() => onPurchase({ coins: 100, priceUSD: '$0.99' })}>100 coins — $0.99</button>
        <button onClick={() => onPurchase({ coins: 500, priceUSD: '$3.99' })}>500 coins — $3.99</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}