import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authed = sessionStorage.getItem('switch_admin') === 'true'
  if (!authed) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
