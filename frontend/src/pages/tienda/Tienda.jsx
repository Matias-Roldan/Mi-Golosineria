import { useEffect, useState } from 'react';
import { getProductosDisponibles } from '../../api/productosApi';
import ProductoCard from '../../components/tienda/ProductoCard';
import Carrito from '../../components/tienda/Carrito';
import FormularioPedido from '../../components/tienda/FormularioPedido';
import { useCart } from '../../hooks/useCart';

export default function Tienda() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const { carrito } = useCart();

  useEffect(() => {
    getProductosDisponibles().then(({ data }) => {
      setProductos(data);
      const cats = ['Todas', ...new Set(data.map((p) => p.categoria))];
      setCategorias(cats);
    });
  }, []);

  const productosFiltrados = categoriaActiva === 'Todas'
    ? productos
    : productos.filter((p) => p.categoria === categoriaActiva);

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.headerTitle}>🍬 Mi Golosinería</h1>
            <p style={styles.headerSub}>Productos Mondelez y más</p>
          </div>
          <div style={styles.cartBadge}>
            🛒 <span style={styles.cartCount}>{carrito.reduce((a, p) => a + p.cantidad, 0)}</span>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        {/* Filtros por categoría */}
        <div style={styles.filtros}>
          {categorias.map((cat) => (
            <button
              key={cat}
              style={{ ...styles.filtroBtn, ...(categoriaActiva === cat ? styles.filtroActivo : {}) }}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={styles.layout}>
          {/* Grid de productos */}
          <div style={styles.grid}>
            {productosFiltrados.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>No hay productos disponibles</p>
            ) : (
              productosFiltrados.map((p) => <ProductoCard key={p.id} producto={p} />)
            )}
          </div>

          {/* Carrito lateral */}
          <aside style={styles.aside}>
            <Carrito onConfirmar={() => setMostrarForm(true)} productos={productos} />
          </aside>
        </div>
      </div>

      {/* Modal formulario pedido */}
      {mostrarForm && <FormularioPedido onCancelar={() => setMostrarForm(false)} />}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f3f4f6' },
  header: { background: '#1e1b4b', color: 'white', padding: '1rem 0', marginBottom: '2rem' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '1.6rem', fontWeight: '800', margin: 0 },
  headerSub: { fontSize: '0.85rem', color: '#a5b4fc', margin: 0 },
  cartBadge: { fontSize: '1.4rem', position: 'relative' },
  cartCount: { background: '#7c3aed', color: 'white', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.8rem', fontWeight: '700' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem' },
  filtros: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filtroBtn: { padding: '0.45rem 1rem', borderRadius: '20px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' },
  filtroActivo: { background: '#7c3aed', color: 'white', border: '1px solid #7c3aed', fontWeight: '600' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' },
  aside: { position: 'sticky', top: '1.5rem' },
};