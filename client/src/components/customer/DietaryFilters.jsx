import { useState } from 'react'

const FILTERS = ['Vegetarian', 'Vegan', 'Gluten Free', 'Spicy']

function DietaryFilters({ onFilter }) {
  const [active, setActive] = useState([])

  function toggleFilter(filter) {
    const updated = active.includes(filter)
      ? active.filter(function(f) { return f !== filter })
      : [...active, filter]
    setActive(updated)
    if (onFilter) onFilter(updated)
  }

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-white border-b border-slate-100">
      {FILTERS.map(function(filter) {
        const isActive = active.includes(filter)
        return (
          <button
            key={filter}
            onClick={function() { toggleFilter(filter) }}
            className={
              'whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ' +
              (isActive
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600')
            }
          >
            {filter}
          </button>
        )
      })}
    </div>
  )
}

export default DietaryFilters
