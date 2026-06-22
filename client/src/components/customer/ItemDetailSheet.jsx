import { useState } from 'react'
import QuantityStepper from './QuantityStepper'
import useCartStore from '../../store/cartStore'

function ItemDetailSheet({ item, open, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [notes, setNotes] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  if (!open) return null

  function toggleAddon(addon) {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  function calculateTotal() {
    let total = item.price
    if (selectedVariant) total += selectedVariant.price_modifier
    selectedAddons.forEach((addon) => (total += addon.price))
    return (total * quantity).toFixed(2)
  }

  function handleAddToCart() {
    addItem({
      item_id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      variant: selectedVariant?.name || null,
      addons: selectedAddons.map((a) => a.name),
      notes,
    })
    onClose()
    setQuantity(1)
    setSelectedVariant(null)
    setSelectedAddons([])
    setNotes('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Image */}
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {item.description && (
            <p className="text-gray-500 text-sm mt-2">{item.description}</p>
          )}

          <p className="text-blue-600 font-bold text-lg mt-2">${item.price}</p>

          {/* Variants */}
          {item.item_variants && item.item_variants.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Size / Variant</h3>
              <div className="space-y-2">
                {item.item_variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full flex justify-between items-center p-3 rounded-lg border transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-sm">{variant.name}</span>
                    <span className="text-sm text-gray-500">
                      +${variant.price_modifier}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {item.item_addons && item.item_addons.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Add-ons</h3>
              <div className="space-y-2">
                {item.item_addons.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`w-full flex justify-between items-center p-3 rounded-lg border transition-colors ${
                      selectedAddons.find((a) => a.id === addon.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-sm">{addon.name}</span>
                    <span className="text-sm text-gray-500">+${addon.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center justify-between mt-6">
            <QuantityStepper
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Add to Cart — ${calculateTotal()}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailSheet