import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function timeElapsed(createdAt) {
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000)
  const mins = Math.floor(diff / 60)
  const secs = diff % 60
  return { mins, secs, total: diff }
}

function TimerBadge({ createdAt }) {
  const [elapsed, setElapsed] = useState(timeElapsed(createdAt))

  useEffect(function() {
    const interval = setInterval(function() {
      setElapsed(timeElapsed(createdAt))
    }, 1000)
    return function() { clearInterval(interval) }
  }, [createdAt])

  const color =
    elapsed.mins < 10
      ? 'bg-green-100 text-green-700'
      : elapsed.mins < 20
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'

  return (
    <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + color}>
      {elapsed.mins}m {elapsed.secs}s
    </span>
  )
}

function OrderCard({ order, onMarkPreparing, onMarkReady, onMarkServed }) {
  const isReceived = order.status === 'received'
  const isPreparing = order.status === 'preparing'
  const isReady = order.status === 'ready'

  const borderColor = isReceived ? 'border-blue-400' : isReady ? 'border-green-400' : 'border-amber-400'
  const headerColor = isReceived ? 'bg-blue-50' : isReady ? 'bg-green-50' : 'bg-amber-50'

  return (
    <div className={'rounded-xl border-2 bg-white overflow-hidden ' + borderColor}>
      <div className={'px-4 py-3 flex items-center justify-between ' + headerColor}>
        <div>
          <p className="text-sm font-bold text-slate-800">
            Table {order.tables ? order.tables.table_number : '?'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Order #{order.id.slice(-6).toUpperCase()}
          </p>
          {isReady && (
            <p className="text-xs text-green-600 font-semibold mt-0.5">Ready to serve</p>
          )}
        </div>
        <TimerBadge createdAt={order.created_at} />
      </div>

      <div className="px-4 py-3 space-y-2">
        {order.order_items.map(function(item) {
          return (
            <div key={item.id} className="flex items-start gap-2">
              <span className="text-sm font-bold text-slate-800 min-w-6">
                {item.quantity}x
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.item_name}</p>
                {item.variant && (
                  <p className="text-xs text-slate-400">{item.variant}</p>
                )}
                {Array.isArray(item.addons) && item.addons.length > 0 && (
                  <p className="text-xs text-slate-400">+ {item.addons.join(', ')}</p>
                )}
                {item.notes && (
                  <p className="text-xs text-amber-600 italic">Note: {item.notes}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 pb-4">
        {isReceived && (
          <button
            onClick={function() { onMarkPreparing(order.id) }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Start Preparing
          </button>
        )}
        {isPreparing && (
          <button
            onClick={function() { onMarkReady(order.id) }}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Mark as Ready
          </button>
        )}
        {isReady && (
          <button
            onClick={function() { onMarkServed(order.id) }}
            className="w-full bg-slate-500 hover:bg-slate-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Mark as Served
          </button>
        )}
      </div>
    </div>
  )
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, created_at, table_id, tables ( table_number ), order_items ( id, quantity, item_name, variant, addons, notes )')
      .in('status', ['received', 'preparing', 'ready'])
      .order('created_at', { ascending: true })

    if (!error) setOrders(data || [])
    setLoading(false)
  }

  useEffect(function() {
    fetchOrders()

    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        function() { fetchOrders() }
      )
      .subscribe()

    return function() { supabase.removeChannel(channel) }
  }, [])

  async function updateStatus(orderId, status) {
    await fetch(
      import.meta.env.VITE_API_URL + '/api/orders/' + orderId + '/status',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    )
    fetchOrders()
  }

  const handleMarkPreparing = function(orderId) { updateStatus(orderId, 'preparing') }
  const handleMarkReady = function(orderId) { updateStatus(orderId, 'ready') }
  const handleMarkServed = function(orderId) { updateStatus(orderId, 'served') }

  const receivedOrders = orders.filter(function(o) { return o.status === 'received' })
  const preparingOrders = orders.filter(function(o) { return o.status === 'preparing' })
  const readyOrders = orders.filter(function(o) { return o.status === 'ready' })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {receivedOrders.length} new, {preparingOrders.length} preparing, {readyOrders.length} ready
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            New ({receivedOrders.length})
          </span>
          <span className="flex items-center gap-1.5 text-xs text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Preparing ({preparingOrders.length})
          </span>
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            Ready ({readyOrders.length})
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-slate-500 text-lg">No active orders</p>
          <p className="text-slate-600 text-sm mt-1">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(function(order) {
            return (
              <OrderCard
                key={order.id}
                order={order}
                onMarkPreparing={handleMarkPreparing}
                onMarkReady={handleMarkReady}
                onMarkServed={handleMarkServed}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}