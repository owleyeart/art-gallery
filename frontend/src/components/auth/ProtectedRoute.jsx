import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children, requireSystem = false }) {
  const { user, loading, isAdmin, isSystem } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
    </div>
  )

  if (!user || !isAdmin) return <Navigate to="/login" replace />
  if (requireSystem && !isSystem) return <Navigate to="/admin" replace />

  return children
}
