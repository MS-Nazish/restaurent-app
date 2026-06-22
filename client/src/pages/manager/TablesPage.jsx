import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const STATUS_STYLES = {
  empty:     { label: 'Empty',     bg: 'bg-white',       border: 'border-slate-200', text: 'text-slate-400' },
  ordering:  { label: 'Ordering',  bg: 'bg-amber-50',    border: 'border-amber-400', text: 'text-amber-600' },
  received:  { label: 'Received',  bg: 'bg-blue-50',     border: 'border-blue-400',  text: 'text-blue-600'  },
  preparing: { label: 'Preparing', bg: 'bg-orange-50',   border: 'border-orange-400',text: 'text-orange-600'},
  ready:     { label: 'Ready',     bg: 'bg-green-50',    border: 'border-green-400', text: 'text-green-600' },
  billed:    { label: 'Billed',    bg: 'bg-purple-50',   border: 'border-purple-400',text: 'text-purple-600'},
}

export default function TablesPage() {
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [waiters, setWaiters] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newSeats, setNewSeats] = useState(4)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [mergeMode, setMergeMode] = useState(false)
  const [mergeTarget, setMergeTarget] = useState(null)

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('tables-manager')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_assignments' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchData() {
    const [
      { data: tablesData },
      { data: ordersData },
      { data: waitersData },
      { data: assignmentsData },
    ] = await Promise.all([
      supabase.from('tables').select('*').order('table_number'),
      supabase.from('orders').select('*, order_items(*)').in('status', ['received', 'preparing', 'ready']),
      supabase.from('profiles').select('id, name, role').in('role', ['waiter', 'manager']),
      supabase.from('table_assignments').select('*'),
    ])
    setTables(tablesData || [])
    setOrders(ordersData || [])
    setWaiters(waitersData || [])
    setAssignments(assignmentsData || [])
    setLoading(false)
  }

  function getTableOrders(tableId) {
    return orders.filter((o) => o.table_id === tableId)
  }

  function getTableStatus(table) {
    const tableOrders = getTableOrders(table.id)
    if (tableOrders.some((o) => o.status === 'ready')) return 'ready'
    if (tableOrders.some((o) => o.status === 'preparing')) return 'preparing'
    if (tableOrders.some((o) => o.status === 'received')) return 'received'
    return table.status === 'ordering' ? 'ordering' : 'empty'
  }

  function getAssignedWaiter(tableId) {
    const assignment = assignments.find((a) => a.table_id === tableId)
    if (!assignment) return null
    return waiters.find((w) => w.id === assignment.profile_id) || null
  }

  async function assignWaiter(tableId, profileId) {
    // Remove existing assignment
    await supabase.from('table_assignments').delete().eq('table_id', tableId)
    if (profileId) {
      await supabase.from('table_assignments').insert({ table_id: tableId, profile_id: profileId })
    }
    fetchData()
  }

  async function resetTable(tableId) {
    if (!confirm('Reset this table? This will mark it as empty.')) return
    await supabase.from('tables').update({ status: 'empty' }).eq('id', tableId)
    await supabase.from('table_assignments').delete().eq('table_id', tableId)
    setSelected(null)
    fetchData()
  }

  async function addTable() {
    setSaving(true)
    setError(null)
    try {
      const { data: profile } = await supabase.from('profiles').select('restaurant_id').single()
      const maxNum = tables.length > 0 ? Math.max(...tables.map((t) => t.table_number)) : 0
      const { error } = await supabase.from('tables').insert({
        table_number: maxNum + 1,
        restaurant_id: profile.restaurant_id,
        seats: newSeats,
        status: 'empty',
      })
      if (error) throw error
      setShowAdd(false)
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleTableClick(table) {
    if (mergeMode) {
      if (!mergeTarget) {
        setMergeTarget(table)
      } else if (mergeTarget.id !== table.id) {
        handleMerge(mergeTarget, table)
      }
      return
    }
    setSelected(selected?.id === table.id ? null : table)
  }

  async function handleMerge(tableA, tableB) {
    if (!confirm('Merge Table ' + tableA.table_number + ' with Table ' + tableB.table_number + '? Orders from Table ' + tableB.table_number + ' will move to Table ' + tableA.table_number + '.')) {
      setMergeMode(false)
      setMergeTarget(null)
      return
    }
    await supabase.from('orders').update({ table_id: tableA.id }).eq('table_id', tableB.id)
    await supabase.from('tables').update({ status: 'empty' }).eq('id', tableB.id)
    setMergeMode(false)
    setMergeTarget(null)
    setSelected(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading tables...</p>
      </div>
    )
  }

  const selectedTableOrders = selected ? getTableOrders(selected.id) : []
  const assignedWaiter = selected ? getAssignedWaiter(selected.id) : null

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Main floor plan */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Table Management</h1>
            <p className="text-slate-500 text-sm mt-1">{tables.length} tables total</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setMergeMode(!mergeMode); setMergeTarget(null) }}
              className={'text-sm font-medium px-4 py-2 rounded-lg transition-colors ' +
                (mergeMode ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')}
            >
              {mergeMode ? 'Cancel Merge' : 'Merge Tables'}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Add Table
            </button>
          </div>
        </div>

        {mergeMode && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg">
            {mergeTarget
              ? 'Now click the table to merge WITH Table ' + mergeTarget.table_number
              : 'Click the FIRST table to merge'}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Status legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(STATUS_STYLES).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={'w-3 h-3 rounded-full border-2 ' + val.border} />
              {val.label}
            </span>
          ))}
        </div>

        {/* Table grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => {
            const status = getTableStatus(table)
            const style = STATUS_STYLES[status] || STATUS_STYLES.empty
            const isSelected = selected?.id === table.id
            const isMergeTarget = mergeTarget?.id === table.id
            const tableOrders = getTableOrders(table.id)
            const waiter = getAssignedWaiter(table.id)

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={'rounded-xl border-2 p-4 text-left transition-all ' +
                  style.bg + ' ' + style.border +
                  (isSelected ? ' ring-2 ring-amber-400 ring-offset-2' : '') +
                  (isMergeTarget ? ' ring-2 ring-blue-400 ring-offset-2' : '')}
              >
                <p className="text-lg font-bold text-slate-800">Table {table.table_number}</p>
                <p className="text-xs text-slate-400 mt-0.5">{table.seats} seats</p>
                <p className={'text-xs font-semibold mt-2 ' + style.text}>{style.label}</p>
                {tableOrders.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">{tableOrders.length} order{tableOrders.length > 1 ? 's' : ''}</p>
                )}
                {waiter && (
                  <p className="text-xs text-slate-400 mt-1">Waiter: {waiter.name}</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Side panel */}
      {selected && !mergeMode && (
        <div className="w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Table {selected.table_number}</h2>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">x</button>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-slate-500">Seats: <span className="font-medium text-slate-800">{selected.seats}</span></p>
            <p className="text-sm text-slate-500">Status: <span className="font-medium text-slate-800 capitalize">{getTableStatus(selected)}</span></p>
          </div>

          {/* Waiter Assignment */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Assign Waiter</p>
            <select
              value={assignedWaiter?.id || ''}
              onChange={(e) => assignWaiter(selected.id, e.target.value || null)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">No waiter assigned</option>
              {waiters.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
              ))}
            </select>
          </div>

          {/* Active Orders */}
          {selectedTableOrders.length > 0 ? (
            <div className="space-y-3 mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Orders</p>
              {selectedTableOrders.map((order) => (
                <div key={order.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700">#{order.id.slice(-6).toUpperCase()}</p>
                    <span className={'text-xs font-medium px-2 py-0.5 rounded-full ' +
                      (order.status === 'ready' ? 'bg-green-100 text-green-700' :
                       order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                       'bg-blue-100 text-blue-700')}>
                      {order.status}
                    </span>
                  </div>
                  {order.order_items.map((item) => (
                    <p key={item.id} className="text-xs text-slate-500">{item.quantity}x {item.item_name}</p>
                  ))}
                  <p className="text-xs font-semibold text-slate-700 mt-2">Total: ${order.total}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-4">No active orders</p>
          )}

          <button
            onClick={() => resetTable(selected.id)}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Reset Table
          </button>
        </div>
      )}

      {/* Add Table Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add New Table</h3>
            <div className="mb-4">
              <label className="text-sm text-slate-600 block mb-1">Number of Seats</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newSeats}
                onChange={(e) => setNewSeats(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addTable}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg"
              >
                {saving ? 'Adding...' : 'Add Table'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
