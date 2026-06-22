function BillSplitCard({ splitCount, setSplitCount, total, tipPercent }) {
  const tipAmount = (total * tipPercent) / 100
  const grandTotal = parseFloat(total) + tipAmount
  const perPerson = splitCount > 0 ? grandTotal / splitCount : grandTotal

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-gray-800 mb-4">Split Bill</h2>

      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600">Number of people</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
          >
            -
          </button>
          <span className="text-lg font-semibold w-6 text-center">{splitCount}</span>
          <button
            onClick={() => setSplitCount(splitCount + 1)}
            className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {splitCount > 1 && (
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-amber-700 text-sm">Each person pays</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            ${perPerson.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}

export default BillSplitCard