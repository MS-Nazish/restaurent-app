import { useState } from 'react'
import useManagerAlerts from '../../hooks/useManagerAlerts'

function AlertBell() {
  const { alerts, unreadCount, markAllRead, clearAlerts } = useManagerAlerts()
  const [open, setOpen] = useState(false)

  function handleOpen() {
    setOpen(!open)
    if (!open) markAllRead()
  }

  function getAlertIcon(type) {
    if (type === 'bill') return 'B'
    if (type === 'feedback') return 'F'
    return 'O'
  }

  function getAlertColor(type) {
    if (type === 'bill') return 'bg-purple-100 text-purple-600'
    if (type === 'feedback') return 'bg-red-100 text-red-600'
    return 'bg-blue-100 text-blue-600'
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
      >
        <span className="text-gray-600 text-lg">N</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={clearAlerts}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              alerts.map(function(alert) {
                return (
                  <div
                    key={alert.id}
                    className={alert.read ? 'flex items-start gap-3 px-4 py-3 border-b border-gray-50' : 'flex items-start gap-3 px-4 py-3 border-b border-gray-50 bg-amber-50'}
                  >
                    <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' + getAlertColor(alert.type)}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                    </div>
                    {!alert.read && (
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 flex-shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertBell