import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'

function StaffManagementPage() {
  const { user } = useAuthStore()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [restaurantId, setRestaurantId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(function() {
    if (user) fetchStaff()
  }, [user])

  async function fetchStaff() {
    setLoading(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single()

      if (!profile) return
      setRestaurantId(profile.restaurant_id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .order('created_at')

      setStaff(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(member) {
    await supabase
      .from('profiles')
      .update({ is_active: !member.is_active })
      .eq('id', member.id)
    fetchStaff()
  }

  async function handleChangeRole(member, newRole) {
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', member.id)
    fetchStaff()
  }

  function getRoleBadgeClass(role) {
    if (role === 'owner') return 'bg-purple-100 text-purple-600'
    if (role === 'manager') return 'bg-blue-100 text-blue-600'
    if (role === 'kitchen') return 'bg-orange-100 text-orange-600'
    return 'bg-green-100 text-green-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading staff...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your restaurant staff and roles</p>
        </div>
        <button
          onClick={function() { setShowModal(true) }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          + Invite Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Staff Member</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(function(member) {
              return (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-sm">
                          {member.name ? member.name[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-400">ID: {member.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={'px-3 py-1 rounded-full text-xs font-medium ' + getRoleBadgeClass(member.role)}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={member.is_active ? 'px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600' : 'px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={function(e) { handleChangeRole(member, e.target.value) }}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="waiter">Waiter</option>
                      </select>
                      <button
                        onClick={function() { handleToggleActive(member) }}
                        className={member.is_active ? 'px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100' : 'px-3 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-500 hover:bg-green-100'}
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {staff.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No staff members yet.</p>
            <button
              onClick={function() { setShowModal(true) }}
              className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg font-medium"
            >
              Invite First Staff Member
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <InviteStaffModal
          restaurantId={restaurantId}
          onClose={function() { setShowModal(false) }}
          onSaved={function() {
            setShowModal(false)
            fetchStaff()
          }}
        />
      )}
    </div>
  )
}

function InviteStaffModal({ restaurantId, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('waiter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleInvite() {
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            restaurant_id: restaurantId,
            name,
            role,
            is_active: true,
          })
        if (profileError) throw profileError
      }

      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Invite Staff Member</h2>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none">x</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={function(e) { setName(e.target.value) }}
                placeholder="e.g. John Smith"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value) }}
                placeholder="staff@restaurant.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={function(e) { setPassword(e.target.value) }}
                placeholder="minimum 6 characters"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={function(e) { setRole(e.target.value) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Invite Staff'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffManagementPage