const EMOJIS = [
  { value: 1, emoji: '😞', label: 'Poor' },
  { value: 2, emoji: '😐', label: 'OK' },
  { value: 3, emoji: '😊', label: 'Good' },
  { value: 4, emoji: '😍', label: 'Amazing' },
]

function EmojiRatingPicker({ rating, setRating }) {
  return (
    <div className="flex justify-around">
      {EMOJIS.map(function(item) {
        return (
          <button
            key={item.value}
            onClick={function() { setRating(item.value) }}
            className={rating === item.value ? 'flex flex-col items-center p-3 rounded-xl bg-amber-50 border-2 border-amber-500' : 'flex flex-col items-center p-3 rounded-xl border-2 border-transparent'}
          >
            <span className="text-4xl">{item.emoji}</span>
            <span className={rating === item.value ? 'text-xs mt-1 font-medium text-amber-600' : 'text-xs mt-1 font-medium text-gray-400'}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default EmojiRatingPicker