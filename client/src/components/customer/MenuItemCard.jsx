import { useState } from 'react'
import ItemDetailSheet from './ItemDetailSheet'

function MenuItemCard({ item }) {
  const [open, setOpen] = useState(false)

  if (!item.is_available) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 opacity-60 relative overflow-hidden">
        <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
          ) : (
            <span className="text-slate-400 font-bold text-xl">{item.name ? item.name[0] : '?'}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-500">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
          )}
          <p className="text-slate-400 font-bold mt-2">${item.price}</p>
        </div>
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Sold Out
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        onClick={function() { setOpen(true) }}
        className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all active:scale-95"
      >
        {/* Image or initial block */}
        <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-2xl">{item.name ? item.name[0] : '?'}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</h3>
            {item.is_special && (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium">
                Special
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
          )}
          {item.dietary_tags && item.dietary_tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {item.dietary_tags.map(function(tag) {
                return (
                  <span key={tag} className="bg-green-50 text-green-600 text-xs px-1.5 py-0.5 rounded-full">{tag}</span>
                )
              })}
            </div>
          )}
          <p className="text-amber-500 font-bold mt-2 text-sm">${item.price}</p>
        </div>
      </div>

      <ItemDetailSheet item={item} open={open} onClose={function() { setOpen(false) }} />
    </>
  )
}

export default MenuItemCard
