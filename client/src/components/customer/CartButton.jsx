import useCartStore from '../../store/cartStore'

function CartButton({ onClick }) {
  const count = useCartStore((state) => state.getCount())
  const total = useCartStore((state) => state.getTotal())

  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40">
      <button
        onClick={onClick}
      className="w-full bg-amber-500 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg flex items-center justify-between hover:bg-amber-600 transition-colors"
      >
        <span className="bg-amber-600 text-white text-sm px-2 py-0.5 rounded-full">
          {count} items
        </span>
        <span>View Cart</span>
        <span>${total.toFixed(2)}</span>
      </button>
    </div>
  )
}

export default CartButton