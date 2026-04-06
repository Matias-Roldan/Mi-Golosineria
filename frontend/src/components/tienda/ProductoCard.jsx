import { useCart } from '../../hooks/useCart';

export default function ProductoCard({ producto }) {
  const { agregar, carrito } = useCart();

  const itemEnCarrito = carrito.find(p => p.id === producto.id);
  const cantidadEnCarrito = itemEnCarrito?.cantidad || 0;
  const stockDisponible = producto.stock - cantidadEnCarrito;

  return (
    <div style={styles.card}>
      <div style={styles.imgWrapper}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} style={styles.img} />
        ) : (
          <div style={styles.imgPlaceholder}>🍬</div>
        )}
      </div>
      <div style={styles.body}>
        <span style={styles.categoria}>{producto.categoria}</span>
        <h3 style={styles.nombre}>{producto.nombre}</h3>
        {producto.descripcion && <p style={styles.descripcion}>{producto.descripcion}</p>}

        {/* Stock disponible */}
        <p style={{
          ...styles.stock,
          color: stockDisponible <= 3 ? '#ef4444' : '#6b7280'
        }}>
          {stockDisponible === 0 ? '❌ Sin stock' : `📦 Stock: ${stockDisponible}`}
        </p>

        <div style={styles.footer}>
          <span style={styles.precio}>${Number(producto.precio).toLocaleString('es-AR')}</span>
          <button
            style={{
              ...styles.btn,
              opacity: stockDisponible === 0 ? 0.5 : 1,
              cursor: stockDisponible === 0 ? 'not-allowed' : 'pointer'
            }}
            onClick={() => stockDisponible > 0 && agregar(producto)}
            disabled={stockDisponible === 0}
          >
            {stockDisponible === 0 ? 'Sin stock' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  imgWrapper: { height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { fontSize: '4rem' },
  body: { padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 },
  categoria: { fontSize: '0.75rem', color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.3rem' },
  nombre: { fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.4rem' },
  descripcion: { fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.5rem', flex: 1 },
  stock: { fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.6rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  precio: { fontSize: '1.1rem', fontWeight: '700', color: '#7c3aed' },
  btn: { background: '#7c3aed', color: 'white', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '7px', fontWeight: '600', fontSize: '0.85rem' },
};