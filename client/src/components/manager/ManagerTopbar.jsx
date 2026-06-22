import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/manager/tables':  'Table Management',
  '/manager/menu':    'Menu Management',
  '/manager/reports': 'Sales Reports',
  '/manager/staff':   'Staff Management',
  '/manager/qr':      'QR Codes',
  '/kitchen':         'Kitchen Display',
}

export default function ManagerTopbar({ onMenuClick }) {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Manager'

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 fixed top-0 left-0 lg:left-56 right-0 z-10">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex flex-col gap-1 p-1"
      >
        <span className="w-5 h-0.5 bg-slate-600 block" />
        <span className="w-5 h-0.5 bg-slate-600 block" />
        <span className="w-5 h-0.5 bg-slate-600 block" />
      </button>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
    </div>
  )
}
