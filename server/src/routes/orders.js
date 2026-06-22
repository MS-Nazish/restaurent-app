import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

// POST /api/orders — Place a new order
router.post('/', async (req, res) => {
  const { table_id, customer_session_id, items, total } = req.body

  // Basic validation
  if (!table_id || !customer_session_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Insert the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        table_id,
        customer_session_id,
        total,
        status: 'received',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Insert all order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      item_id: item.item_id,
      item_name: item.item_name,
      item_price: item.item_price,
      quantity: item.quantity,
      variant: item.variant || null,
      addons: item.addons || [],
      notes: item.notes || null,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // 3. Update table status to 'ordering'
    await supabaseAdmin
      .from('tables')
      .update({ status: 'ordering' })
      .eq('id', table_id)

    res.status(201).json({
      success: true,
      order_id: order.id,
      session_id: customer_session_id,
    })

  } catch (err) {
    console.error('Place order error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders/:id — Get single order details
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        total,
        created_at,
        table_id,
        order_items (
          id,
          quantity,
          item_price,
          notes,
          variant,
          addons,
          menu_items ( name, image_url )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    res.json(data)

  } catch (err) {
    console.error('Get order error:', err)
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/orders/:id/status — Update order status (kitchen/manager)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ['received', 'preparing', 'ready', 'served']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, order: data })

  } catch (err) {
    console.error('Update status error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/orders/:id/bill — Submit bill request
router.post('/:id/bill', async (req, res) => {
  const { id } = req.params
  const { split_count, tip_amount, email } = req.body

  try {
    const { data, error } = await supabaseAdmin
      .from('bill_requests')
      .insert({
        order_id: id,
        split_count: split_count || 1,
        tip_amount: tip_amount || 0,
        email: email || null,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, bill_request: data })

  } catch (err) {
    console.error('Bill request error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router