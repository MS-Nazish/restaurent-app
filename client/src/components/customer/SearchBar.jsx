function SearchBar({ onSearch }) {
  return (
    <div className="px-4 py-2">
      <input
        type="text"
        placeholder="Search menu..."
        onChange={(e) => onSearch && onSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
      />
    </div>
  )
}

export default SearchBar