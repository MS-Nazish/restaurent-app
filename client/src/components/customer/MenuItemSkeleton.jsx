function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex gap-3 animate-pulse">
      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16 mt-2" />
      </div>
    </div>
  )
}

export default MenuItemSkeleton