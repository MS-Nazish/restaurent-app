import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import OrderStatusTracker from '../../components/customer/OrderStatusTracker'
import { Skeleton } from '../../components/ui/skeleton'
import { Separator } from '../../components/ui/separator'
import { Button } from '../../components/ui/button'
import { ShoppingBag, ChevronLeft, Receipt } from 'lucide-react'

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const STATUS_BADGE = {
  received: { label: 'Received', className: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Preparing', className: 'bg-amber-100 text-amber-700' },
  ready:     { label: 'Ready!',    className: 'bg-green-100 text-green-700' },
  served:    { label: 'Served',    className: 'bg-slate-100 text-slate-500' },
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.received
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

export default function OrderStatusPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          created_at,
          order_items (
            id,
            quantity,
            item_price,
            notes,
            variant,
            addons,
            menu_items ( name )
          )
        `)
        .eq('customer_session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError('Could not load your orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Realtime — listen for status changes on this session's orders
    const channel = supabase
      .channel(`orders-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_session_id=eq.${sessionId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, status: payload.new.status } : o
            )
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  // Active order = first non-served order, or most recent
  const activeOrder = orders.find((o) => o.status !== 'served') ?? orders[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto px-4 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 text-sm text-center">{error}</p>
        <Button onClick={fetchOrders} className="bg-amber-500 hover:bg-amber-600 text-white">
          Try Again
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag className="text-slate-300" size={52} />
        <h2 className="text-lg font-semibold text-slate-800">No orders yet</h2>
        <p className="text-sm text-slate-400">Your orders will appear here once placed.</p>
        <Button onClick={() => navigate(-1)} className="bg-amber-500 hover:bg-amber-600 text-white">
          Browse Menu
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[480px] mx-auto">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-semibold text-slate-900">My Orders</h1>
      </div>

      <div className="px-4 py-6 space-y-4">

        {/* Status tracker — shows active order only */}
        {activeOrder && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Current Status
              </p>
              <StatusBadge status={activeOrder.status} />
            </div>

            <OrderStatusTracker status={activeOrder.status} />

            {/* Contextual messages */}
            {activeOrder.status === 'received' && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Your order has been sent to the kitchen
              </p>
            )}
            {activeOrder.status === 'preparing' && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Estimated wait: 15–20 minutes
              </p>
            )}
            {activeOrder.status === 'ready' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 font-medium text-center">
                🍽️ Your food is ready! A waiter is bringing it over.
              </div>
            )}
          </div>
        )}

        {/* All orders */}
        {orders.map((order, index) => (
          <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">

            {/* Order header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Order #{orders.length - index}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed at {formatTime(order.created_at)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Items */}
            <div className="px-4 py-3 space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {item.quantity}× {item.menu_items?.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.variant}</p>
                    )}
                    {Array.isArray(item.addons) && item.addons.length > 0 && (
                      <p className="text-xs text-slate-400">+ {item.addons.join(', ')}</p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-slate-400 italic">"{item.notes}"</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {formatPrice(item.item_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total + bill button */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-base font-bold text-slate-900">
                  {formatPrice(order.total)}
                </p>
              </div>
              {order.status === 'served' && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/bill/${sessionId}`)}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                >
                  <Receipt size={14} />
                  Request Bill
                </Button>
              )}
            </div>

          </div>
        ))}

        {/* Add more items */}
        <button
          onClick={() => navigate(-1)}
          className="w-full text-center text-sm text-amber-600 font-medium py-3 hover:text-amber-700 transition-colors"
        >
          + Add more items
        </button>

      </div>
    </div>
  )
}