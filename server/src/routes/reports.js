import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { verifyToken } from '../middleware/auth.js'
import { roleCheck } from '../middleware/roleCheck.js'

const router = express.Router()

// GET summary
router.get('/summary', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { from, to } = req.query
    const restaurantId = req.user.restaurant_id

    let query = supabaseAdmin
      .from('orders')
      .select('total, created_at, table_id')

    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    const { data: orders, error } = await query
    if (error) throw error

    const revenue = orders.reduce(function(sum, o) { return sum + parseFloat(o.total) }, 0)
    const count = orders.length
    const avg = count > 0 ? revenue / count : 0

    res.json({
      revenue: revenue.toFixed(2),
      order_count: count,
      avg_order_value: avg.toFixed(2),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET top items
router.get('/top-items', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { from, to } = req.query

    let query = supabaseAdmin
      .from('order_items')
      .select('item_name, quantity')

    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    const { data, error } = await query
    if (error) throw error

    const totals = {}
    data.forEach(function(item) {
      if (!totals[item.item_name]) totals[item.item_name] = 0
      totals[item.item_name] += item.quantity
    })

    const ranked = Object.entries(totals)
      .map(function(entry) { return { name: entry[0], total: entry[1] } })
      .sort(function(a, b) { return b.total - a.total })
      .slice(0, 5)

    res.json(ranked)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET peak hours
router.get('/peak-hours', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('created_at')
    if (error) throw error

    const hourCounts = {}
    data.forEach(function(order) {
      const hour = new Date(order.created_at).getHours()
      if (!hourCounts[hour]) hourCounts[hour] = 0
      hourCounts[hour]++
    })

    const result = Object.entries(hourCounts).map(function(entry) {
      return { hour: parseInt(entry[0]), count: entry[1] }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET paginated orders
router.get('/orders', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { from, to, page = 1 } = req.query
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    const { data, error, count } = await query
    if (error) throw error

    res.json({ orders: data, total: count, page: parseInt(page) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET feedback
router.get('/feedback', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router