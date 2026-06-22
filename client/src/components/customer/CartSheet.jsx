import { useState } from 'react'
import OrderSummary from './OrderSummary'
import useCartStore from '../../store/cartStore'

function CartSheet({ open, onClose, tableId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { items, getTotal, clearCart } = useCartStore()

  if (!open) return null

  async function handlePlaceOrder() {
    setLoading(true)
    setError(null)

    try {
      const sessionId = crypto.randomUUID()

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table_id: tableId,
            customer_session_id: sessionId,
            items: items.map((item) => ({
              item_id: item.item_id,
              item_name: item.name,
              item_price: item.price,
              quantity: item.quantity,
              variant: item.variant,
              addons: item.addons,
              notes: item.notes,
            })),
            total: getTotal(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to place order')

      clearCart()
      onClose()
      window.location.href = `/order-status/${sessionId}`

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
            <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
          </div>

          {/* Order Summary */}
          <OrderSummary />

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || items.length === 0}
            className="w-full mt-6 bg-amber-500 text-white py-4 rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Placing Order...' : `Place Order — $${getTotal().toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartSheet