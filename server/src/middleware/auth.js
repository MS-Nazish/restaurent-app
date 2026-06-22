import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get user role from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, restaurant_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ error: 'Profile not found' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      restaurant_id: profile.restaurant_id,
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' })
  }
}