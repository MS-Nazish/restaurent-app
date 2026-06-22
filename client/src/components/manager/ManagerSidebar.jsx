import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const NAV_ITEMS = [
  { label: 'Tables',   path: '/manager/tables',  roles: ['manager', 'owner', 'waiter'] },
  { label: 'Menu',     path: '/manager/menu',    roles: ['manager', 'owner'] },
  { label: 'Reports',  path: '/manager/reports', roles: ['owner'] },
  { label: 'Staff',    path: '/manager/staff',   roles: ['owner'] },
  { label: 'QR Codes', path: '/manager/qr',      roles: ['manager', 'owner'] },
  { label: 'Kitchen',  path: '/kitchen',         roles: ['kitchen', 'manager', 'owner'] },
]

export default function ManagerSidebar({ open, onClose }) {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleNav(path) {
    navigate(path)
    if (onClose) onClose()
  }

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={
        'fixed top-0 left-0 h-screen w-56 bg-white border-r border-slate-200 flex flex-col z-30 transition-transform duration-300 ' +
        (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      }>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900">Restaurant</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manager Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            x
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                }
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-700 text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{user?.email}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
