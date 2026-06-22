import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import EmojiRatingPicker from '../../components/customer/EmojiRatingPicker'

function FeedbackPage() {
  const { orderId } = useParams()
  const [rating, setRating] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!rating) {
      setError('Please select a rating')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          order_id: orderId || null,
          overall_rating: rating,
          comment: comment || null,
        })
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="text-2xl font-bold text-gray-800">Thank You!</h1>
          <p className="text-gray-500 mt-2">We appreciate your feedback.</p>
          <p className="text-gray-400 text-sm mt-1">Hope to see you again soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-amber-500 text-white px-4 py-4">
        <h1 className="text-xl font-bold">Your Feedback</h1>
        <p className="text-amber-100 text-sm">How was your experience?</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 text-center">
            How was your overall experience?
          </h2>
          <EmojiRatingPicker rating={rating} setRating={setRating} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">Leave a comment (Optional)</h2>
          <textarea
            value={comment}
            onChange={function(e) { setComment(e.target.value) }}
            placeholder="Tell us what you liked or what we can improve..."
            maxLength={200}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/200</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-amber-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>

        <button
          onClick={function() { setSubmitted(true) }}
          className="w-full text-gray-400 text-sm py-2"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

export default FeedbackPage