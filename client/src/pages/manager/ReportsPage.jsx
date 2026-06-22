import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    avgOrderValue: 0,
    totalItemsSold: 0,
  })
  const [chartData, setChartData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [topItems, setTopItems] = useState([])

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    setLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchChartData(),
        fetchRecentOrders(),
        fetchTopItems(),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', todayStart.toISOString())

    const todayRevenue = (todayOrders || []).reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
    const todayCount = (todayOrders || []).length
    const avg = todayCount > 0 ? todayRevenue / todayCount : 0

    const { data: allItems } = await supabase
      .from('order_items')
      .select('quantity')
      .gte('created_at', todayStart.toISOString())

    const totalItemsSold = (allItems || []).reduce((sum, i) => sum + (i.quantity || 0), 0)

    setStats({
      todayRevenue,
      todayOrders: todayCount,
      avgOrderValue: avg,
      totalItemsSold,
    })
  }

  async function fetchChartData() {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }

    const chartRows = await Promise.all(
      days.map(async (date) => {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)

        const { data } = await supabase
          .from('orders')
          .select('total')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        const revenue = (data || []).reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
        const label = date.toLocaleDateString('en-US', { weekday: 'short' })

        return { day: label, revenue: parseFloat(revenue.toFixed(2)) }
      })
    )

    setChartData(chartRows)
  }

  async function fetchRecentOrders() {
    const { data } = await supabase
      .from('orders')
      .select('id, total, status, created_at, order_items(item_name, quantity)')
      .order('created_at', { ascending: false })
      .limit(8)

    setRecentOrders(data || [])
  }

  async function fetchTopItems() {
    const { data } = await supabase
      .from('order_items')
      .select('item_name, quantity')

    if (!data) return

    const counts = {}
    data.forEach((item) => {
      counts[item.item_name] = (counts[item.item_name] || 0) + item.quantity
    })

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setTopItems(sorted)
  }

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const STATUS_COLORS = {
    received:  'bg-blue-100 text-blue-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready:     'bg-green-100 text-green-700',
    served:    'bg-slate-100 text-slate-600',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Today Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(stats.todayRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Today Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.todayOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Avg Order Value</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(stats.avgOrderValue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Items Sold Today</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalItemsSold}</p>
          </div>
        </div>

        {/* Chart + Top Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Revenue Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatPrice(value), 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Top Selling Items</h2>
            {topItems.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{item.name}</p>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1">
                        <div
                          className="h-1.5 bg-amber-400 rounded-full"
                          style={{ width: (item.count / topItems[0].count * 100) + '%' }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3 uppercase tracking-wide">Order</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3 uppercase tracking-wide">Items</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3 uppercase tracking-wide">Total</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3 uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-4 py-3 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 text-sm py-8">No orders yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {order.order_items.map((i) => i.quantity + 'x ' + i.item_name).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' + (STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600')}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {formatDate(order.created_at)} {formatTime(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}