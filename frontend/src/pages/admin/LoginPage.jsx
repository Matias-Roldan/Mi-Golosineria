import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-pastel-blue flex-col justify-between p-12">
        <div>
          <div className="w-10 h-10 rounded-xl bg-brand-white shadow-soft flex items-center justify-center">
            <span className="text-lg">🍬</span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-semibold text-brand-text leading-tight mb-4">
            Mi<br />Golosinería
          </h1>
          <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
            Panel de administración. Gestioná tus productos, pedidos y clientes desde un solo lugar.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-pastel-blueBorder" />
          <div className="w-2 h-2 rounded-full bg-pastel-blueBorder opacity-50" />
          <div className="w-2 h-2 rounded-full bg-pastel-blueBorder opacity-30" />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 bg-pastel-cream flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Header mobile */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-3xl">🍬</span>
            <h2 className="text-xl font-semibold text-brand-text mt-2">Mi Golosinería</h2>
          </div>

          <h2 className="text-2xl font-semibold text-brand-text mb-1">Bienvenido</h2>
          <p className="text-brand-muted text-sm mb-8">Ingresá tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-pastel-rose text-pastel-roseText text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
