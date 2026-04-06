import { useCart } from '../../hooks/useCart';

export default function Carrito({ onConfirmar, productos }) {
  const { carrito, quitar, cambiarCantidad, total } = useCart();

  if (carrito.length === 0) {
    return (
      <div style={styles.vacio}>
        <p style={styles.vacioText}>🛒 Tu carrito está vacío</p>
        <p style={styles.vacioSub}>Agregá productos para comenzar</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.titulo}>🛒 Tu pedido</h3>
      <div style={styles.items}>
        {carrito.map((p) => {
          const stockOriginal = productos?.find(prod => prod.id === p.id)?.stock ?? p.stock ?? 99;
          return (
            <div key={p.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <span style={styles.itemNombre}>{p.nombre}</span>
                <span style={styles.itemPrecio}>${Number(p.precio).toLocaleString('es-AR')} c/u</span>
              </div>
              <div style={styles.itemControles}>
                <button style={styles.btnCant} onClick={() => cambiarCantidad(p.id, p.cantidad - 1)}>−</button>
                <span style={styles.cantidad}>{p.cantidad}</span>
                <button
                  style={{
                    ...styles.btnCant,
                    opacity: p.cantidad >= stockOriginal ? 0.4 : 1,
                    cursor: p.cantidad >= stockOriginal ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => p.cantidad < stockOriginal && cambiarCantidad(p.id, p.cantidad + 1)}
                  disabled={p.cantidad >= stockOriginal}
                >+</button>
                <button style={styles.btnQuitar} onClick={() => quitar(p.id)}>✕</button>
              </div>
              <span style={styles.subtotal}>${Number(p.precio * p.cantidad).toLocaleString('es-AR')}</span>
            </div>
          );
        })}
      </div>
      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Total</span>
        <span style={styles.totalValue}>${Number(total).toLocaleString('es-AR')}</span>
      </div>
      <button style={styles.btnConfirmar} onClick={onConfirmar}>
        Confirmar pedido →
      </button>
    </div>
  );
}

const styles = {
  wrapper: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  titulo: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' },
  items: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' },
  item: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  itemNombre: { fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' },
  itemPrecio: { fontSize: '0.78rem', color: '#6b7280' },
  itemControles: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  btnCant: { width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontWeight: '700' },
  cantidad: { minWidth: '20px', textAlign: 'center', fontWeight: '600' },
  btnQuitar: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '0.25rem' },
  subtotal: { fontSize: '0.9rem', fontWeight: '700', color: '#7c3aed', minWidth: '70px', textAlign: 'right' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid #f3f4f6', marginBottom: '1rem' },
  totalLabel: { fontWeight: '700', fontSize: '1rem' },
  totalValue: { fontWeight: '700', fontSize: '1.2rem', color: '#7c3aed' },
  btnConfirmar: { width: '100%', background: '#7c3aed', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '9px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' },
  vacio: { background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  vacioText: { fontSize: '1rem', fontWeight: '600', color: '#374151' },
  vacioSub: { fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.3rem' },
};