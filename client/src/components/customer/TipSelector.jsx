const TIPS = [0, 10, 15, 20]

function TipSelector({ tipPercent, setTipPercent }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-gray-800 mb-4">Add Tip</h2>
      <div className="grid grid-cols-4 gap-2">
        {TIPS.map((tip) => (
          <button
            key={tip}
            onClick={() => setTipPercent(tip)}
            className={
              tipPercent === tip
                ? 'py-3 rounded-xl font-semibold text-sm bg-amber-500 text-white'
                : 'py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600'
            }
          >
            {tip === 0 ? 'No Tip' : tip + '%'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TipSelector