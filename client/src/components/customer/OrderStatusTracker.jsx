import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const STEPS = [
  { key: 'received', label: 'Received' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
]

const ORDER = ['received', 'preparing', 'ready', 'served']

function StatusTracker({ status }) {
  const currentIndex = ORDER.indexOf(status)

  function getWidth() {
    if (currentIndex <= 0) return '0%'
    if (currentIndex === 1) return '33%'
    if (currentIndex === 2) return '66%'
    return '100%'
  }

  return (
    <div className="relative px-2 py-4">
      <div className="absolute top-9 left-7 right-7 h-0.5 bg-slate-100" />
      <div
        className="absolute top-9 left-7 h-0.5 bg-amber-400 transition-all duration-700"
        style={{ width: getWidth() }}
      />
      <div className="relative flex justify-between">
        {STEPS.map(function(step, index) {
          const isDone = index < currentIndex
          const isActive = index === currentIndex
          const isPending = index > currentIndex

          let circleClass = 'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 '
          if (isDone) circleClass += 'bg-amber-500 border-amber-500'
          else if (isActive) circleClass += 'bg-white border-amber-500 shadow-sm'
          else circleClass += 'bg-white border-slate-200'

          let labelClass = 'text-xs font-medium text-center mt-2 '
          if (isActive) labelClass += 'text-amber-600'
          else if (isDone) labelClass += 'text-slate-600'
          else labelClass += 'text-slate-300'

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div className={circleClass}>
                {isDone ? (
                  <span className="text-white text-sm font-bold">v</span>
                ) : (
                  <span className={isPending ? 'text-slate-300 text-sm' : 'text-slate-600 text-sm font-semibold'}>
                    {index + 1}
                  </span>
                )}
              </div>
              <p className={labelClass}>{step.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderStatusTracker({ sessionId }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    if (!sessionId) return
    fetchOrder()

    const channel = supabase
      .channel('order-' + sessionId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'customer_session_id=eq.' + sessionId,
        },
        function(payload) {
          setOrder(function(prev) { return { ...prev, ...payload.new } })
        }
      )
      .subscribe()

    return function() { supabase.removeChannel(channel) }
  }, [sessionId])

  async function fetchOrder() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_session_id', sessionId)
        .single()
      if (error) throw error
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading order status...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-4">Order Progress</h2>
        <StatusTracker status={order.status} />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-4">Your Order</h2>
        <div className="space-y-3">
          {order.order_items && order.order_items.map(function(item) {
            return (
              <div key={item.id} className="flex justify-between items-center">
                <p className="font-medium text-gray-800">{item.quantity}x {item.item_name}</p>
                <p className="text-amber-600 font-semibold">${(item.item_price * item.quantity).toFixed(2)}</p>
              </div>
            )
          })}
          <div className="border-t pt-3 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-amber-600">${order.total}</span>
          </div>
        </div>
      </div>

      {order.status === 'served' && (
        <div className="space-y-3">
          
            href={'/bill/' + order.id}
            className="block w-full bg-amber-500 text-white text-center py-4 rounded-xl font-semibold"
          >
            Request Bill
          </a>
          
            href={'/feedback/' + order.id}
            className="block w-full bg-gray-100 text-gray-600 text-center py-4 rounded-xl font-semibold"
          >
            Leave Feedback
          </a>
        </div>
      )}
    </div>
  )
}

export default OrderStatusTracker