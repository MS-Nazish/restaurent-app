function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="h-4 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-64 bg-gray-200 rounded-xl mt-4" />
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

export default PageSkeleton