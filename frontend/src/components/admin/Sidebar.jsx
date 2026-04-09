import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/admin',           icon: '▣',  label: 'Dashboard',  end: true },
  { to: '/admin/pedidos',   icon: '🛒', label: 'Pedidos' },
  { to: '/admin/productos', icon: '🍬', label: 'Productos' },
  { to: '/admin/clientes',  icon: '👥', label: 'Clientes' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside style={S.sidebar}>
      {/* ── Brand ── */}
      <div>
        <div style={S.brand}>
          <div style={S.brandIcon}>🍬</div>
          <div>
            <div style={S.brandName}>Mi Golosinería</div>
            <div style={S.brandTag}>Panel Admin</div>
          </div>
        </div>

        <div style={S.divider} />

        {/* ── Admin info ── */}
        <div style={S.adminInfo}>
          <div style={S.adminAvatar}>
            {admin?.nombre?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <div style={S.adminName}>{admin?.nombre ?? 'Administrador'}</div>
            <div style={S.adminRol}>{admin?.rol ?? 'admin'}</div>
          </div>
        </div>

        <div style={S.divider} />

        {/* ── Nav ── */}
        <nav style={S.nav}>
          <p style={S.navSection}>Gestión</p>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({ ...S.link, ...(isActive ? S.linkActive : {}) })}
            >
              <span style={S.linkIcon}>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Logout ── */}
      <button style={S.logoutBtn} onClick={handleLogout}>
        <span>🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

const S = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#13131d',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.75rem 1rem',
    position: 'fixed',
    top: 0, left: 0,
    borderRight: '1px solid #1e1e2e',
    fontFamily: "'Nunito', system-ui, sans-serif",
    zIndex: 100,
  },

  // Brand
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 0.5rem',
    marginBottom: '1.5rem',
  },
  brandIcon: {
    width: '40px', height: '40px',
    background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
  },
  brandName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.95rem',
    letterSpacing: '-0.01em',
  },
  brandTag: {
    color: 'rgba(192,132,252,0.6)',
    fontSize: '0.62rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },

  divider: {
    height: '1px',
    background: '#1e1e2e',
    margin: '0.5rem 0.5rem 1rem',
  },

  // Admin info
  adminInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.25rem 0.5rem 1rem',
  },
  adminAvatar: {
    width: '34px', height: '34px',
    background: 'rgba(168,85,247,0.15)',
    border: '1.5px solid rgba(168,85,247,0.3)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#c084fc',
    fontWeight: '900',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  adminName: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: '0.82rem',
  },
  adminRol: {
    color: 'rgba(192,132,252,0.5)',
    fontSize: '0.62rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },

  // Nav
  nav: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  navSection: {
    fontSize: '0.58rem',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.22)',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    padding: '0.5rem 0.75rem 0.35rem',
    margin: 0,
  },
  link: {
    color: 'rgba(139,139,158,0.85)',
    textDecoration: 'none',
    padding: '0.65rem 0.9rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    transition: 'all 0.15s ease',
  },
  linkActive: {
    background: '#a855f7',
    color: '#ffffff',
    fontWeight: '800',
    boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
  },
  linkIcon: {
    fontSize: '1rem',
    lineHeight: 1,
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },

  // Logout
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'transparent',
    border: '1px solid #2a2a3a',
    color: 'rgba(139,139,158,0.7)',
    padding: '0.65rem 0.9rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
};
