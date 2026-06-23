import { useState } from 'react'
import { useParams } from 'react-router-dom'
import MenuHeader from '../../components/customer/MenuHeader'
import CategoryTabs from '../../components/customer/CategoryTabs'
import SearchBar from '../../components/customer/SearchBar'
import DietaryFilters from '../../components/customer/DietaryFilters'
import MenuItemCard from '../../components/customer/MenuItemCard'
import CartButton from '../../components/customer/CartButton'
import CartSheet from '../../components/customer/CartSheet'
import useMenu from '../../hooks/useMenu'
import MenuItemSkeleton from '../../components/customer/MenuItemSkeleton'

function MenuPage() {
  const { tableId } = useParams()
  const { categories, items, loading, error } = useMenu(tableId)
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState([])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-amber-500 text-white px-4 py-4">
          <h1 className="text-xl font-bold">Our Menu</h1>
        </div>
        <div className="px-4 py-6 space-y-3">
          <MenuItemSkeleton />
          <MenuItemSkeleton />
          <MenuItemSkeleton />
          <MenuItemSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load menu. Please try again.</p>
      </div>
    )
  }

  function filterItems(categoryItems) {
    return categoryItems.filter(function(item) {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.every(function(f) {
          return item.dietary_tags && item.dietary_tags.includes(f)
        })
      return matchesSearch && matchesFilters
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader tableId={tableId} />
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <CategoryTabs categories={categories} />
        <SearchBar onSearch={setSearch} />
        <DietaryFilters onFilter={setActiveFilters} />
      </div>

      <div className="pb-24">
        {categories.map(function(category) {
          const categoryItems = items.filter(function(item) {
            return item.category_id === category.id
          })
          const filtered = filterItems(categoryItems)

          if (filtered.length === 0) return null

          return (
            <div key={category.id} id={'category-' + category.id} className="px-4 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{category.name}</h2>
              <div className="space-y-3">
                {filtered.map(function(item) {
                  return <MenuItemCard key={item.id} item={item} />
                })}
              </div>
            </div>
          )
        })}

        {categories.every(function(category) {
          const categoryItems = items.filter(function(item) {
            return item.category_id === category.id
          })
          return filterItems(categoryItems).length === 0
        }) && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No items match your search or filters.</p>
            <button
              onClick={function() { setSearch(''); setActiveFilters([]) }}
              className="mt-3 text-amber-500 text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <CartButton onClick={function() { setCartOpen(true) }} />
      <CartSheet
        open={cartOpen}
        onClose={function() { setCartOpen(false) }}
        tableId={tableId}
      />
    </div>
  )
}

export default MenuPage
