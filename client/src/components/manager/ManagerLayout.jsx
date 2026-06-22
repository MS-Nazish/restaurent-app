import { useState } from 'react'
import ManagerSidebar from './ManagerSidebar'
import ManagerTopbar from './ManagerTopbar'

export default function ManagerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-56">
        <ManagerTopbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="pt-14">
          {children}
        </div>
      </div>
    </div>
  )
}
