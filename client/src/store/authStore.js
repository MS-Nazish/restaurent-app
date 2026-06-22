import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set) => ({
  // State
  user: null,
  role: null,
  session: null,
  loading: true,

  // Set user and role
  setUser: (user, role, session) => set({ user, role, session }),

  // Clear user on logout
  clearUser: () => set({ user: null, role: null, session: null }),

  // Set loading
  setLoading: (loading) => set({ loading }),

  // Login action
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Get role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    set({
      user: data.user,
      role: profile.role,
      session: data.session,
    })

    return profile.role
  },

  // Logout action
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: null, session: null })
  },

  // Initialize — check if user is already logged in
  initialize: async () => {
    set({ loading: true })

    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      set({
        user: session.user,
        role: profile?.role || null,
        session: session,
        loading: false,
      })
    } else {
      set({ loading: false })
    }
  },
}))

export default useAuthStore