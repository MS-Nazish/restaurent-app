import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function useMenu(tableId) {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tableId) return
    fetchMenu()
  }, [tableId])

  async function fetchMenu() {
    try {
      setLoading(true)

      // Step 1 — Get table info to find restaurant_id
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('restaurant_id')
        .eq('id', tableId)
        .single()

      if (tableError) throw tableError

      // Step 2 — Get categories for this restaurant
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', table.restaurant_id)
        .order('display_order')

      if (categoriesError) throw categoriesError

      // Step 3 — Get all menu items with variants and addons
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          item_variants (*),
          item_addons (*)
        `)
        .in('category_id', categoriesData.map((c) => c.id))
        .order('display_order')

      if (itemsError) throw itemsError

      setCategories(categoriesData)
      setItems(itemsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { categories, items, loading, error }
}

export default useMenu