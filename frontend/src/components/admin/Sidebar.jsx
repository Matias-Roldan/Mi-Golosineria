import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/pedidos', label: '🛒 Pedidos' },
  { to: '/admin/productos', label: '🍬 Productos' },
  { to: '/admin/clientes', label: '👥 Clientes' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div>
        <h2 style={styles.logo}>🍬 Mi Golosinería</h2>
        <p style={styles.adminName}>{admin?.nombre}</p>
        <p style={styles.adminRol}>{admin?.rol}</p>
        <nav style={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 Cerrar sesión
      </button>
    </aside>
  );
}

const styles = {
  sidebar: { width: '240px', minHeight: '100vh', background: '#1e1b4b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem 1rem', position: 'fixed', top: 0, left: 0 },
  logo: { color: 'white', fontSize: '1.2rem', marginBottom: '0.25rem' },
  adminName: { color: '#c4b5fd', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.1rem' },
  adminRol: { color: '#7c3aed', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  link: { color: '#a5b4fc', textDecoration: 'none', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.95rem', display: 'block' },
  linkActive: { background: '#7c3aed', color: 'white', fontWeight: '600' },
  logoutBtn: { background: 'transparent', border: '1px solid #4c1d95', color: '#a5b4fc', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
};