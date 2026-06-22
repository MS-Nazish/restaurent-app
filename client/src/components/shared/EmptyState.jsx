function EmptyState({ title, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-gray-400 text-2xl">?</span>
      </div>
      <h3 className="font-semibold text-gray-700 text-lg">{title}</h3>
      {message && <p className="text-gray-400 text-sm mt-1 text-center">{message}</p>}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-600"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export default EmptyState