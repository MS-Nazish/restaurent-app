import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function RoleRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />
  }

  return children
}

export default RoleRoute