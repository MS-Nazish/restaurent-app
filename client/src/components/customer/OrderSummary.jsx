import useCartStore from '../../store/cartStore'

function OrderSummary() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 py-3 border-b border-gray-100">
          <div className="flex-1">
            <p className="font-medium text-gray-800">{item.name}</p>
            {item.variant && (
              <p className="text-xs text-gray-500">Variant: {item.variant}</p>
            )}
            {item.addons && item.addons.length > 0 && (
              <p className="text-xs text-gray-500">Add-ons: {item.addons.join(', ')}</p>
            )}
            {item.notes && (
              <p className="text-xs text-gray-400 italic">Note: {item.notes}</p>
            )}
            <p className="text-blue-600 font-semibold mt-1">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
            >
              −
            </button>
            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center"
            >
              +
            </button>
            <button
              onClick={() => removeItem(item.id)}
              className="ml-2 text-red-400 text-sm hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center pt-2">
        <span className="font-bold text-gray-800">Total</span>
        <span className="font-bold text-blue-600 text-lg">${getTotal().toFixed(2)}</span>
      </div>
    </div>
  )
}

export default OrderSummary