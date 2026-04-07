import { useState } from 'react';
import { useCart } from '../../hooks/useCart';

// ─── Item individual ─────────────────────────────────────────────────
function CartItem({ item, stockOriginal, onCambiar, onQuitar }) {
  const [hov, setHov] = useState(null); // 'minus' | 'plus' | 'remove'

  return (
    <div style={S.item}>
      <div style={S.itemLeft}>
        <div style={S.itemNombre}>{item.nombre}</div>
        <div style={S.itemUnit}>${Number(item.precio).toLocaleString('es-AR')} c/u</div>
      </div>
      <div style={S.itemRight}>
        <div style={S.qtyControls}>
          <button
            style={{ ...S.qtyBtn, background: hov === 'minus' ? '#ede9fe' : '#f5f3ff' }}
            onClick={() => onCambiar(item.id, item.cantidad - 1)}
            onMouseEnter={() => setHov('minus')}
            onMouseLeave={() => setHov(null)}
          >−</button>
          <span style={S.qtyNum}>{item.cantidad}</span>
          <button
            style={{
              ...S.qtyBtn,
              background: hov === 'plus' ? '#ede9fe' : '#f5f3ff',
              opacity: item.cantidad >= stockOriginal ? 0.35 : 1,
              cursor: item.cantidad >= stockOriginal ? 'not-allowed' : 'pointer',
            }}
            onClick={() => item.cantidad < stockOriginal && onCambiar(item.id, item.cantidad + 1)}
            disabled={item.cantidad >= stockOriginal}
            onMouseEnter={() => setHov('plus')}
            onMouseLeave={() => setHov(null)}
          >+</button>
        </div>
        <div style={S.itemSubtotal}>${Number(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
        <button
          style={{ ...S.removeBtn, color: hov === 'remove' ? '#ef4444' : '#d1d5db' }}
          onClick={() => onQuitar(item.id)}
          onMouseEnter={() => setHov('remove')}
          onMouseLeave={() => setHov(null)}
          title="Quitar"
        >✕</button>
      </div>
    </div>
  );
}

// ─── Carrito vacío ───────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>🛒</div>
      <div style={S.emptyTitle}>Carrito vacío</div>
      <div style={S.emptySub}>Agregá golosinas para armar tu pedido</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
export default function Carrito({ onConfirmar, productos }) {
  const { carrito, quitar, cambiarCantidad, total } = useCart();
  const [hovBtn, setHovBtn] = useState(false);
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);

  if (carrito.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div style={S.wrapper}>
      {/* ── Header ── */}
      <div style={S.header}>
        <span style={S.headerIcon}>🛒</span>
        <div>
          <div style={S.headerTitle}>Tu pedido</div>
          <div style={S.headerSub}>
            {totalItems} producto{totalItems !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── Items ── */}
      <div style={S.items}>
        {carrito.map((p) => {
          const stockOriginal = productos?.find((prod) => prod.id === p.id)?.stock ?? p.stock ?? 99;
          return (
            <CartItem
              key={p.id}
              item={p}
              stockOriginal={stockOriginal}
              onCambiar={cambiarCantidad}
              onQuitar={quitar}
            />
          );
        })}
      </div>

      {/* ── Totales ── */}
      <div style={S.totalArea}>
        <div style={S.totalRow}>
          <span style={S.totalLabel}>Subtotal</span>
          <span style={S.totalValue}>${Number(total).toLocaleString('es-AR')}</span>
        </div>
        <div style={S.shippingRow}>
          <span style={S.shippingLabel}>🚀 Envío en el día</span>
          <span style={S.shippingFree}>Gratis</span>
        </div>
      </div>

      {/* ── CTA ── */}
      <button
        style={{
          ...S.btnConfirmar,
          transform: hovBtn ? 'translateY(-2px)' : 'none',
          boxShadow: hovBtn
            ? '0 14px 36px rgba(168,85,247,0.5)'
            : '0 6px 20px rgba(168,85,247,0.3)',
        }}
        onClick={onConfirmar}
        onMouseEnter={() => setHovBtn(true)}
        onMouseLeave={() => setHovBtn(false)}
      >
        <span>Confirmar pedido</span>
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>→</span>
      </button>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const S = {
  wrapper: {
    background: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(168,85,247,0.12), 0 0 0 1px #ede9fe',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },

  // Header
  header: {
    background: 'linear-gradient(130deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  headerIcon: { fontSize: '1.75rem', lineHeight: 1 },
  headerTitle: {
    color: 'white',
    fontWeight: '800',
    fontSize: '1rem',
    letterSpacing: '-0.01em',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginTop: '1px',
  },

  // Lista de items
  items: {
    padding: '0 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '320px',
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 0',
    borderBottom: '1px solid #faf5ff',
    gap: '0.5rem',
  },
  itemLeft: { flex: 1, minWidth: 0, paddingRight: '0.5rem' },
  itemNombre: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1e1333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemUnit: {
    fontSize: '0.72rem',
    color: '#a78bfa',
    marginTop: '2px',
    fontWeight: '600',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },

  // Controles de cantidad
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: '#f5f3ff',
    borderRadius: '50px',
    padding: '3px',
    border: '1px solid #ede9fe',
  },
  qtyBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '0.95rem',
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
    lineHeight: 1,
    flexShrink: 0,
    fontFamily: 'inherit',
  },
  qtyNum: {
    minWidth: '22px',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '0.875rem',
    color: '#1e1333',
  },
  itemSubtotal: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#7c3aed',
    minWidth: '58px',
    textAlign: 'right',
    letterSpacing: '-0.01em',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.72rem',
    padding: '4px',
    transition: 'color 0.15s ease',
    lineHeight: 1,
    flexShrink: 0,
    fontFamily: 'inherit',
  },

  // Área totales
  totalArea: {
    padding: '1rem 1.5rem',
    background: '#faf5ff',
    borderTop: '1px solid #ede9fe',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#7c6a9e',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '900',
    color: '#1e1333',
    letterSpacing: '-0.03em',
    fontFamily: 'Georgia, serif',
  },
  shippingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingLabel: {
    fontSize: '0.78rem',
    color: '#7c6a9e',
    fontWeight: '600',
  },
  shippingFree: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#10b981',
    background: '#f0fdf4',
    padding: '0.2rem 0.65rem',
    borderRadius: '50px',
    border: '1px solid #bbf7d0',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  // Botón confirmar
  btnConfirmar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    width: '100%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%)',
    color: 'white',
    border: 'none',
    padding: '1.1rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
    fontFamily: "'Nunito', inherit",
    letterSpacing: '0.01em',
  },

  // Carrito vacío
  empty: {
    background: 'white',
    borderRadius: '24px',
    padding: '2.75rem 1.5rem',
    textAlign: 'center',
    border: '1px solid #ede9fe',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '0.75rem',
    opacity: 0.35,
    lineHeight: 1,
  },
  emptyTitle: {
    fontWeight: '800',
    color: '#1e1333',
    fontSize: '1rem',
  },
  emptySub: {
    color: '#a78bfa',
    fontSize: '0.82rem',
    marginTop: '0.3rem',
    fontWeight: '600',
  },
};
