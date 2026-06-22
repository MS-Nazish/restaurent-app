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
      <div className="bg-blue-600 text-white px-4 py-4">
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

  function filterItems(items) {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.every((f) => item.dietary_tags?.includes(f))
      return matchesSearch && matchesFilters && item.is_available
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
        {categories.map((category) => {
          const filtered = filterItems(
            items.filter((item) => item.category_id === category.id)
          )
          if (filtered.length === 0) return null
          return (
            <div key={category.id} id={`category-${category.id}`} className="px-4 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{category.name}</h2>
              <div className="space-y-3">
                {filtered.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <CartButton onClick={() => setCartOpen(true)} />
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        tableId={tableId}
      />
    </div>
  )
}

export default MenuPage