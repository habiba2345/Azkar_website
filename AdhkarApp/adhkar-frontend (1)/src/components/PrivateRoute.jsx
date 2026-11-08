import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <div className="page container">
        <Loading />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
