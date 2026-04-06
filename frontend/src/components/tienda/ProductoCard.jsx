import { useCart } from '../../hooks/useCart';

export default function ProductoCard({ producto }) {
  const { agregar } = useCart();

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
        <div style={styles.footer}>
          <span style={styles.precio}>${Number(producto.precio).toLocaleString('es-AR')}</span>
          <button
            style={styles.btn}
            onClick={() => agregar(producto)}
            disabled={producto.stock === 0}
          >
            {producto.stock === 0 ? 'Sin stock' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' },
  imgWrapper: { height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { fontSize: '4rem' },
  body: { padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 },
  categoria: { fontSize: '0.75rem', color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.3rem' },
  nombre: { fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.4rem' },
  descripcion: { fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.75rem', flex: 1 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  precio: { fontSize: '1.1rem', fontWeight: '700', color: '#7c3aed' },
  btn: { background: '#7c3aed', color: 'white', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
};