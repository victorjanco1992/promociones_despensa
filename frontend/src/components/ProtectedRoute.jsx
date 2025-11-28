import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  // ✅ CORREGIDO: Verificar 'isAuthenticated' en lugar de 'token'
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  
  if (!isAuthenticated || isAuthenticated !== 'true') {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute
