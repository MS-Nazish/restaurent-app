import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { verifyToken } from '../middleware/auth.js'
import { roleCheck } from '../middleware/roleCheck.js'

const router = express.Router()

// GET full menu (public)
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params

    const { data: categories, error: catError } = await supabaseAdmin
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order')

    if (catError) throw catError

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .select('*, item_variants(*), item_addons(*)')
      .in('category_id', categories.map(function(c) { return c.id }))
      .order('display_order')

    if (itemsError) throw itemsError

    res.json({ categories, items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add category
router.post('/categories', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { name, restaurant_id, display_order } = req.body
    const { data, error } = await supabaseAdmin
      .from('menu_categories')
      .insert({ name, restaurant_id, display_order: display_order || 0 })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH edit/reorder category
router.patch('/categories/:id', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, display_order } = req.body
    const { data, error } = await supabaseAdmin
      .from('menu_categories')
      .update({ name, display_order })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE category
router.delete('/categories/:id', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('menu_categories')
      .delete()
      .eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add item
router.post('/items', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { name, description, price, category_id, is_available, is_special, dietary_tags } = req.body
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .insert({ name, description, price, category_id, is_available, is_special, dietary_tags })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH edit item
router.patch('/items/:id', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, category_id, is_available, is_special, dietary_tags } = req.body
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update({ name, description, price, category_id, is_available, is_special, dietary_tags })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE item
router.delete('/items/:id', verifyToken, roleCheck('owner', 'manager'), async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: