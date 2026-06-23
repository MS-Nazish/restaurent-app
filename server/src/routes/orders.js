import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { table_id, customer_session_id, items, total } = req.body

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

    const orderItems = items.map(function(item) {
      return {
        order_id: order.id,
        item_id: item.item_id,
        item_name: item.item_name,
        item_price: item.item_price,
        quantity: item.quantity,
        variant: item.variant || null,
        addons: item.addons || [],
        notes: item.notes || null,
      }
    })

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    await supabaseAdmin
      .from('tables')
      .update({ status: 'order_placed' })
      .eq('id', table_id)

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router