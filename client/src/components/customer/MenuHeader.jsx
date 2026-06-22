import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'

function MenuHeader({ tableId }) {
  const [tableNumber, setTableNumber] = useState(null)
  const [restaurantName, setRestaurantName] = useState('Our Menu')

  useEffect(function() {
    if (!tableId) return
    async function fetchTableInfo() {
      const { data: table } = await supabase
        .from('tables')
        .select('table_number, restaurant_id')
        .eq('id', tableId)
        .single()

      if (table) {
        setTableNumber(table.table_number)
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', table.restaurant_id)
          .single()
        if (restaurant) setRestaurantName(restaurant.name)
      }
    }
    fetchTableInfo()
  }, [tableId])

  return (
    <div className="bg-amber-500 text-white px-4 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{restaurantName}</h1>
        {tableNumber && (
          <span className="bg-white text-amber-600 text-xs font-bold px-3 py-1 rounded-full">
            Table {tableNumber}
          </span>
        )}
      </div>
    </div>
  )
}

export default MenuHeader
