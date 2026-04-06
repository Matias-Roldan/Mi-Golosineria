import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '◻', label: 'Dashboard'  },
  { to: '/admin/productos', icon: '◻', label: 'Productos'  },
  { to: '/admin/pedidos',   icon: '◻', label: 'Pedidos'    },
  { to: '/admin/clientes',  icon: '◻', label: 'Clientes'   },
]

// Íconos SVG simples inline
const ICONS = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  productos: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  pedidos: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 8h6M5 5h3M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  clientes: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 14c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const ICON_MAP = {
  '/admin/dashboard': ICONS.dashboard,
  '/admin/productos': ICONS.productos,
  '/admin/pedidos':   ICONS.pedidos,
  '/admin/clientes':  ICONS.clientes,
}

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-pastel-blue flex flex-col border-r border-pastel-blueBorder shrink-0">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-pastel-blueBorder">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-white shadow-soft flex items-center justify-center text-base">
              🍬
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-text leading-none">Mi Golosinería</p>
              <p className="text-xs text-brand-muted mt-0.5">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ` +
                (isActive
                  ? 'bg-brand-white text-brand-text shadow-soft'
                  : 'text-brand-muted hover:bg-pastel-blueHover hover:text-brand-text')
              }
            >
              <span className="shrink-0">{ICON_MAP[to]}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario + logout */}
        <div className="px-3 py-4 border-t border-pastel-blueBorder space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-brand-text truncate">{admin?.nombre}</p>
            <p className="text-xs text-brand-muted truncate">{admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                       text-brand-muted hover:bg-pastel-rose hover:text-pastel-roseText transition-colors duration-150"
          >
            <span className="shrink-0">{ICONS.logout}</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="flex-1 overflow-y-auto bg-pastel-cream">
        <Outlet />
      </main>

    </div>
  )
}
