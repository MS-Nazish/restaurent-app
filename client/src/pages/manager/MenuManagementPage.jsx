import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'

function MenuManagementPage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [restaurantId, setRestaurantId] = useState(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [showCategorySidebar, setShowCategorySidebar] = useState(false)

  useEffect(function() {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single()
      if (!profile) return
      setRestaurantId(profile.restaurant_id)
      const { data: cats } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('display_order')
      setCategories(cats || [])
      if (cats && cats.length > 0) {
        setSelectedCategory(cats[0])
        fetchItems(cats[0].id)
      } else {
        setSelectedCategory(null)
        setItems([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchItems(categoryId) {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('display_order')
    setItems(data || [])
  }

  async function handleCategoryClick(category) {
    setSelectedCategory(category)
    fetchItems(category.id)
    setShowCategorySidebar(false)
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    setSavingCategory(true)
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({ restaurant_id: restaurantId, name: newCategoryName.trim(), display_order: categories.length })
        .select()
        .single()
      if (error) throw error
      const updated = [...categories, data]
      setCategories(updated)
      setNewCategoryName('')
      setShowAddCategory(false)
      if (!selectedCategory) {
        setSelectedCategory(data)
        fetchItems(data.id)
      }
    } catch (err) {
      alert('Could not add category: ' + err.message)
    } finally {
      setSavingCategory(false)
    }
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm('Delete "' + category.name + '"? Items in this category must be moved or deleted first.')) return
    try {
      const { error } = await supabase.from('menu_categories').delete().eq('id', category.id)
      if (error) throw error
      const remaining = categories.filter(function(c) { return c.id !== category.id })
      setCategories(remaining)
      if (selectedCategory && selectedCategory.id === category.id) {
        if (remaining.length > 0) {
          setSelectedCategory(remaining[0])
          fetchItems(remaining[0].id)
        } else {
          setSelectedCategory(null)
          setItems([])
        }
      }
    } catch (err) {
      alert('Could not delete category. Move or delete its items first.\n\n' + err.message)
    }
  }

  async function handleToggleAvailability(item) {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    fetchItems(item.category_id)
  }

  async function handleDeleteItem(item) {
    if (!window.confirm('Delete ' + item.name + '?')) return
    await supabase.from('item_variants').delete().eq('item_id', item.id)
    await supabase.from('item_addons').delete().eq('item_id', item.id)
    await supabase.from('menu_items').delete().eq('id', item.id)
    fetchItems(item.category_id)
  }

  function handleEditItem(item) {
    setEditingItem(item)
    setShowModal(true)
  }

  function handleAddItem() {
    if (!selectedCategory) {
      alert('Please create a category first.')
      return
    }
    setEditingItem(null)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50 relative">

      {/* Mobile category overlay */}
      {showCategorySidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={function() { setShowCategorySidebar(false) }}
        />
      )}

      {/* Left Sidebar - Categories */}
      <div className={
        'fixed md:static top-14 left-0 h-full md:h-auto w-64 bg-white border-r border-gray-200 flex flex-col z-30 transition-transform duration-300 md:translate-x-0 ' +
        (showCategorySidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0')
      }>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-base">Categories</h2>
          <button
            onClick={function() { setShowCategorySidebar(false) }}
            className="md:hidden text-gray-400 text-xl leading-none"
          >
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories.map(function(category) {
            const isActive = selectedCategory && selectedCategory.id === category.id
            return (
              <div
                key={category.id}
                className={isActive
                  ? 'flex items-center justify-between px-4 py-3 bg-amber-50 border-r-4 border-amber-500'
                  : 'flex items-center justify-between px-4 py-3 hover:bg-gray-50'}
              >
                <button
                  onClick={function() { handleCategoryClick(category) }}
                  className={isActive ? 'flex-1 text-left text-amber-700 font-medium text-sm' : 'flex-1 text-left text-gray-600 text-sm'}
                >
                  {category.name}
                </button>
                <button
                  onClick={function() { handleDeleteCategory(category) }}
                  className="text-gray-300 hover:text-red-500 text-sm px-2"
                >
                  x
                </button>
              </div>
            )
          })}
          {categories.length === 0 && !showAddCategory && (
            <p className="text-sm text-gray-400 px-4 py-3">No categories yet.</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          {showAddCategory ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={function(e) { setNewCategoryName(e.target.value) }}
                placeholder="Category name"
                autoFocus
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={function() { setShowAddCategory(false); setNewCategoryName('') }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={savingCategory}
                  className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {savingCategory ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={function() { setShowAddCategory(true) }}
              className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              + Add Category
            </button>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile category toggle */}
            <button
              onClick={function() { setShowCategorySidebar(true) }}
              className="md:hidden text-slate-600 flex flex-col gap-1"
            >
              <span className="w-4 h-0.5 bg-slate-600 block" />
              <span className="w-4 h-0.5 bg-slate-600 block" />
              <span className="w-4 h-0.5 bg-slate-600 block" />
            </button>
            <h3 className="font-bold text-gray-800 text-base">
              {selectedCategory ? selectedCategory.name : 'Select a category'}
            </h3>
          </div>
          <button
            onClick={handleAddItem}
            className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            + Add Item
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedCategory ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Create a category first to start adding items.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No items in this category yet.</p>
              <button onClick={handleAddItem} className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg font-medium">
                Add First Item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(function(item) {
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-start gap-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 font-bold text-lg">
                          {item.name && item.name.length > 0 ? item.name[0] : '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                        {item.is_special && (
                          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">Special</span>
                        )}
                        {!item.is_available && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Sold Out</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-amber-600 font-bold text-sm">${item.price}</span>
                        {item.dietary_tags && item.dietary_tags.map(function(tag) {
                          return (
                            <span key={tag} className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                          )
                        })}
                      </div>
                      {/* Action buttons below on mobile */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <button
                          onClick={function() { handleToggleAvailability(item) }}
                          className={item.is_available
                            ? 'px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-600'
                            : 'px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-600'}
                        >
                          {item.is_available ? 'Available' : 'Sold Out'}
                        </button>
                        <button
                          onClick={function() { handleEditItem(item) }}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={function() { handleDeleteItem(item) }}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showModal && (
        <ItemFormModal
          item={editingItem}
          categoryId={selectedCategory ? selectedCategory.id : null}
          categories={categories}
          onClose={function() { setShowModal(false) }}
          onSaved={function() {
            setShowModal(false)
            if (selectedCategory) fetchItems(selectedCategory.id)
          }}
        />
      )}
    </div>
  )
}

function ItemFormModal({ item, categoryId, categories, onClose, onSaved }) {
  const [name, setName] = useState(item ? item.name : '')
  const [description, setDescription] = useState(item ? item.description || '' : '')
  const [price, setPrice] = useState(item ? item.price : '')
  const [selectedCategoryId, setSelectedCategoryId] = useState(item ? item.category_id : categoryId)
  const [isAvailable, setIsAvailable] = useState(item ? item.is_available : true)
  const [isSpecial, setIsSpecial] = useState(item ? item.is_special : false)
  const [dietaryTags, setDietaryTags] = useState(item ? item.dietary_tags || [] : [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten Free', 'Spicy', 'Halal']

  function toggleTag(tag) {
    setDietaryTags(function(prev) {
      return prev.includes(tag) ? prev.filter(function(t) { return t !== tag }) : [...prev, tag]
    })
  }

  async function handleSave() {
    if (!name || !price) { setError('Name and price are required'); return }
    setLoading(true)
    setError(null)
    try {
      if (item) {
        await supabase.from('menu_items').update({
          name, description, price: parseFloat(price),
          category_id: selectedCategoryId, is_available: isAvailable,
          is_special: isSpecial, dietary_tags: dietaryTags,
        }).eq('id', item.id)
      } else {
        await supabase.from('menu_items').insert({
          name, description, price: parseFloat(price),
          category_id: selectedCategoryId, is_available: isAvailable,
          is_special: isSpecial, dietary_tags: dietaryTags,
        })
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-800">{item ? 'Edit Item' : 'Add New Item'}</h2>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none">x</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input type="text" value={name} onChange={function(e) { setName(e.target.value) }}
                placeholder="e.g. Grilled Chicken"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={function(e) { setDescription(e.target.value) }}
                placeholder="Short description..." rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" value={price} onChange={function(e) { setPrice(e.target.value) }}
                placeholder="0.00" step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={selectedCategoryId || ''} onChange={function(e) { setSelectedCategoryId(e.target.value) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                {categories.map(function(cat) {
                  return <option key={cat.id} value={cat.id}>{cat.name}</option>
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(function(tag) {
                  return (
                    <button key={tag} onClick={function() { toggleTag(tag) }}
                      className={dietaryTags.includes(tag)
                        ? 'px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white'
                        : 'px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600'}>
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isAvailable}
                  onChange={function(e) { setIsAvailable(e.target.checked) }}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isSpecial}
                  onChange={function(e) { setIsSpecial(e.target.checked) }}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-medium text-gray-700">Daily Special</span>
              </label>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuManagementPage
