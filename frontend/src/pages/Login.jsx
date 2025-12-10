import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (pin.length !== 4) {
      setError('El PIN debe tener dígitos')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // ✅ CORREGIDO: URL con backticks y respuesta simplificada
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { pin })
      
      // ✅ CORREGIDO: Guardar flag simple en lugar de token
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true')
        navigate('/admin')
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔐 Admin Login
          </h1>
          <p className="text-green-100">
            Ingrese su PIN dígitos
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PIN Input */}
            <div>
              <label 
                htmlFor="pin" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="\d*"
                maxLength="4"
                value={pin}
                onChange={handlePinChange}
                className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition tracking-widest"
                placeholder="••••"
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-green-100 text-sm">
            Contacta al administrador si olvidaste tu PIN
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
