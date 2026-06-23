const STEPS = [
  { key: 'received', label: 'Received' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
]

const ORDER = ['received', 'preparing', 'ready', 'served']

export default function OrderStatusTracker({ status }) {
  const currentIndex = ORDER.indexOf(status)

  const getWidth = () => {
    if (currentIndex <= 0) return '0%'
    if (currentIndex === 1) return '33%'
    if (currentIndex === 2) return '66%'
    return '100%'
  }

  return (
    <div className="relative px-2 py-4">
      <div className="absolute top-9 left-7 right-7 h-0.5 bg-slate-100" />
      <div
        className="absolute top-9 left-7 h-0.5 bg-amber-400 transition-all duration-700"
        style={{ width: getWidth() }}
      />
      <div className="relative flex justify-between">
        {STEPS.map(function(step, index) {
          const isDone = index < currentIndex
          const isActive = index === currentIndex
          const isPending = index > currentIndex

          let circleClass = 'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 '
          if (isDone) circleClass += 'bg-amber-500 border-amber-500'
          else if (isActive) circleClass += 'bg-white border-amber-500 shadow-sm'
          else circleClass += 'bg-white border-slate-200'

          let labelClass = 'text-xs font-medium text-center mt-2 '
          if (isActive) labelClass += 'text-amber-600'
          else if (isDone) labelClass += 'text-slate-600'
          else labelClass += 'text-slate-300'

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div className={circleClass}>
                {isDone ? (
                  <span className="text-white text-sm font-bold">v</span>
                ) : (
                  <span className={isPending ? 'text-slate-300 text-sm' : 'text-slate-600 text-sm font-semibold'}>
                    {index + 1}
                  </span>
                )}
              </div>
              <p className={labelClass}>{step.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
