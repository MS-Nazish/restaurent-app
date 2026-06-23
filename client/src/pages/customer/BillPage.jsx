import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BillSplitCard from '../../components/customer/BillSplitCard'
import TipSelector from '../../components/customer/TipSelector'

function BillPage() {
  const { orderId } = useParams()
  const [splitCount, setSplitCount] = useState(1)
  const [tipPercent, setTipPercent] = useState(0)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  useEffect(function() {
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single()
      setOrder(data)
    }
    fetchOrder()
  }, [orderId])

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const tipAmount = order ? (order.total * tipPercent) / 100 : 0
      const { error } = await supabase
        .from('bill_requests')
        .insert({
          order_id: orderId,
          split_count: splitCount,
          tip_amount: tipAmount,
          receipt_email: email || null,
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
          <div className="text-5xl mb-4">OK</div>
          <h1 className="text-2xl font-bold text-gray-800">Bill Requested!</h1>
          <p className="text-gray-500 mt-2">Your waiter will be with you shortly.</p>
          <a
            href={'/feedback/' + orderId}
            className="mt-6 inline-block bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Leave Feedback
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-amber-500 text-white px-4 py-4">
        <h1 className="text-xl font-bold">Request Bill</h1>
        <p className="text-amber-100 text-sm">We will bring it to your table</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {order && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Order Total</h2>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${order.total}</span>
            </div>
          </div>
        )}

        <BillSplitCard
          splitCount={splitCount}
          setSplitCount={setSplitCount}
          total={order ? order.total : 0}
          tipPercent={tipPercent}
        />

        <TipSelector tipPercent={tipPercent} setTipPercent={setTipPercent} />

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">Receipt Email (Optional)</h2>
          <input
            type="email"
            value={email}
            onChange={function(e) { setEmail(e.target.value) }}
            placeholder="your@email.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-amber-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Requesting...' : 'Request Bill'}
        </button>
      </div>
    </div>
  )
}

export default BillPage
