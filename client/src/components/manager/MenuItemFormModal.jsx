import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ImageUploadZone from './ImageUploadZone'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten Free', 'Spicy', 'Halal']

function MenuItemFormModal({ item, categoryId, categories, onClose, onSaved }) {
  const [name, setName] = useState(item ? item.name : '')
  const [description, setDescription] = useState(item ? item.description || '' : '')
  const [price, setPrice] = useState(item ? item.price : '')
  const [imageUrl, setImageUrl] = useState(item ? item.image_url || null : null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(item ? item.category_id : categoryId)
  const [isAvailable, setIsAvailable] = useState(item ? item.is_available : true)
  const [isSpecial, setIsSpecial] = useState(item ? item.is_special : false)
  const [dietaryTags, setDietaryTags] = useState(item ? item.dietary_tags || [] : [])

  const [variants, setVariants] = useState([])
  const [addons, setAddons] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingExtras, setLoadingExtras] = useState(Boolean(item))
  const [error, setError] = useState(null)

  useEffect(function () {
    if (item) fetchExtras(item.id)
  }, [item])

  async function fetchExtras(itemId) {
    setLoadingExtras(true)
    try {
      const variantsResult = await supabase
        .from('item_variants')
        .select('*')
        .eq('item_id', itemId)

      const addonsResult = await supabase
        .from('item_addons')
        .select('*')
        .eq('item_id', itemId)

      setVariants(variantsResult.data || [])
      setAddons(addonsResult.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingExtras(false)
    }
  }

  function toggleTag(tag) {
    setDietaryTags(function (prev) {
      return prev.includes(tag) ? prev.filter(function (t) { return t !== tag }) : [...prev, tag]
    })
  }

  function addVariantRow() {
    setVariants(function (prev) {
      return [...prev, { id: 'new-' + Date.now(), name: '', price_modifier: 0 }]
    })
  }

  function updateVariantRow(rowId, field, value) {
    setVariants(function (prev) {
      return prev.map(function (v) {
        if (v.id !== rowId) return v
        const updated = Object.assign({}, v)
        updated[field] = value
        return updated
      })
    })
  }

  function removeVariantRow(rowId) {
    setVariants(function (prev) { return prev.filter(function (v) { return v.id !== rowId }) })
  }

  function addAddonRow() {
    setAddons(function (prev) {
      return [...prev, { id: 'new-' + Date.now(), name: '', price: 0 }]
    })
  }

  function updateAddonRow(rowId, field, value) {
    setAddons(function (prev) {
      return prev.map(function (a) {
        if (a.id !== rowId) return a
        const updated = Object.assign({}, a)
        updated[field] = value
        return updated
      })
    })
  }

  function removeAddonRow(rowId) {
    setAddons(function (prev) { return prev.filter(function (a) { return a.id !== rowId } ) })
  }

  async function handleSave() {
    if (!name || !price) {
      setError('Name and price are required')
      return
    }
    if (!selectedCategoryId) {
      setError('Please create a category first, then add items to it')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let itemId = item ? item.id : null

      const payload = {
        name,
        description,
        price: parseFloat(price),
        image_url: imageUrl,
        category_id: selectedCategoryId,
        is_available: isAvailable,
        is_special: isSpecial,
        dietary_tags: dietaryTags,
      }

      if (item) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', item.id)
        if (updateError) throw updateError
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('menu_items')
          .insert(payload)
          .select()
          .single()
        if (insertError) throw insertError
        itemId = inserted.id
      }

      await supabase.from('item_variants').delete().eq('item_id', itemId)
      const variantRows = variants
        .filter(function (v) { return v.name && v.name.trim().length > 0 })
        .map(function (v) {
          return {
            item_id: itemId,
            name: v.name,
            price_modifier: parseFloat(v.price_modifier) || 0,
          }
        })
      if (variantRows.length > 0) {
        const { error: variantError } = await supabase.from('item_variants').insert(variantRows)
        if (variantError) throw variantError
      }

      await supabase.from('item_addons').delete().eq('item_id', itemId)
      const addonRows = addons
        .filter(function (a) { return a.name && a.name.trim().length > 0 })
        .map(function (a) {
          return {
            item_id: itemId,
            name: a.name,
            price: parseFloat(a.price) || 0,
          }
        })
      if (addonRows.length > 0) {
        const { error: addonError } = await supabase.from('item_addons').insert(addonRows)
        if (addonError) throw addonError
      }

      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {item ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none">x</button>
          </div>

          <div className="space-y-4">
            <ImageUploadZone value={imageUrl} onChange={setImageUrl} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={function (e) { setName(e.target.value) }}
                placeholder="e.g. Grilled Chicken"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={function (e) { setDescription(e.target.value) }}
                placeholder="Short description..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={function (e) { setPrice(e.target.value) }}
                placeholder="0.00"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategoryId || ''}
                onChange={function (e) { setSelectedCategoryId(e.target.value) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a category</option>
                {categories.map(function (cat) {
                  return (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(function (tag) {
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={function () { toggleTag(tag) }}
                      className={dietaryTags.includes(tag) ? 'px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white' : 'px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600'}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={function (e) { setIsAvailable(e.target.checked) }}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={function (e) { setIsSpecial(e.target.checked) }}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Daily Special</span>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Variants</label>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="text-sm text-amber-600 font-medium hover:text-amber-700"
                >
                  + Add variant
                </button>
              </div>
              {loadingExtras ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : variants.length === 0 ? (
                <p className="text-sm text-gray-400">No variants. e.g. Small / Medium / Large</p>
              ) : (
                <div className="space-y-2">
                  {variants.map(function (v) {
                    return (
                      <div key={v.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={v.name}
                          onChange={function (e) { updateVariantRow(v.id, 'name', e.target.value) }}
                          placeholder="e.g. Large"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          type="number"
                          value={v.price_modifier}
                          onChange={function (e) { updateVariantRow(v.id, 'price_modifier', e.target.value) }}
                          placeholder="+0.00"
                          step="0.01"
                          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={function () { removeVariantRow(v.id) }}
                          className="text-red-500 text-sm px-2"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Add-ons</label>
                <button
                  type="button"
                  onClick={addAddonRow}
                  className="text-sm text-amber-600 font-medium hover:text-amber-700"
                >
                  + Add add-on
                </button>
              </div>
              {loadingExtras ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : addons.length === 0 ? (
                <p className="text-sm text-gray-400">No add-ons. e.g. Extra cheese +$1</p>
              ) : (
                <div className="space-y-2">
                  {addons.map(function (a) {
                    return (
                      <div key={a.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={a.name}
                          onChange={function (e) { updateAddonRow(a.id, 'name', e.target.value) }}
                          placeholder="e.g. Extra cheese"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          type="number"
                          value={a.price}
                          onChange={function (e) { updateAddonRow(a.id, 'price', e.target.value) }}
                          placeholder="0.00"
                          step="0.01"
                          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={function () { removeAddonRow(a.id) }}
                          className="text-red-500 text-sm px-2"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuItemFormModal
