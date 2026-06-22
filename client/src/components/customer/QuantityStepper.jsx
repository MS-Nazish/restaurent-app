function QuantityStepper({ quantity, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-lg flex items-center justify-center disabled:opacity-40"
      >
        −
      </button>
      <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
      <button
        onClick={onIncrease}
        className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper