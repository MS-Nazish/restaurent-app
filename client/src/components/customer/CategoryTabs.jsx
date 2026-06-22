import { useState } from 'react'

function CategoryTabs({ categories }) {
  const [activeCategory, setActiveCategory] = useState(null)

  function scrollToCategory(categoryId) {
    setActiveCategory(categoryId)
    const element = document.getElementById('category-' + categoryId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b border-slate-100" style={{ scrollbarWidth: 'none' }}>
      {categories.map(function(category) {
        const isActive = activeCategory === category.id
        return (
          <button
            key={category.id}
            onClick={function() { scrollToCategory(category.id) }}
            className={
              'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ' +
              (isActive
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600')
            }
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
