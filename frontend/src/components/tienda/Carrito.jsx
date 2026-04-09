import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';

// ─── Item individual ─────────────────────────────────────────────────
function CartItem({ item, stockOriginal, onCambiar, onQuitar }) {
  const [hov, setHov] = useState(null);

  return (
    <motion.div
      style={S.item}
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0, paddingBlock: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      <div style={S.itemLeft}>
        <div style={S.itemNombre}>{item.nombre}</div>
        <div style={S.itemUnit}>${Number(item.precio).toLocaleString('es-AR')} c/u</div>
      </div>

      <div style={S.itemRight}>
        <div style={S.qtyControls}>
          <button
            style={{ ...S.qtyBtn, background: hov === 'minus' ? '#e9d5ff' : '#f3e8ff' }}
            onClick={() => onCambiar(item.id, item.cantidad - 1)}
            onMouseEnter={() => setHov('minus')}
            onMouseLeave={() => setHov(null)}
          >−</button>
          <span style={S.qtyNum}>{item.cantidad}</span>
          <button
            style={{
              ...S.qtyBtn,
              background: hov === 'plus' ? '#e9d5ff' : '#f3e8ff',
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
    </motion.div>
  );
}

// ─── Carrito vacío ───────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>🛒</div>
      <div style={S.emptyTitle}>Tu carrito está vacío</div>
      <div style={S.emptySub}>Explorá los productos y agregá tus favoritos</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
export default function Carrito({ isOpen, onClose, onConfirmar, productos }) {
  const { carrito, quitar, cambiarCantidad, total } = useCart();
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            style={S.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            style={S.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >

            {/* ── Cabecera del panel ── */}
            <div style={S.panelHeader}>
              <div style={S.panelHeaderLeft}>
                <span style={S.panelIcon}>🛒</span>
                <div>
                  <div style={S.panelTitle}>Tu pedido</div>
                  {totalItems > 0 && (
                    <div style={S.panelSub}>
                      {totalItems} producto{totalItems !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              <button style={S.closeBtn} onClick={onClose} title="Cerrar">
                ✕
              </button>
            </div>

            {/* ── Contenido ── */}
            {carrito.length === 0 ? (
              <EmptyCart />
            ) : (
              <>
                {/* Lista de items */}
                <div style={S.items}>
                  <AnimatePresence initial={false}>
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
                  </AnimatePresence>
                </div>

                {/* Totales */}
                <div style={S.totalArea}>
                  <div style={S.shippingRow}>
                    <span style={S.shippingLabel}>🚀 Envío en el día</span>
                    <span style={S.shippingFree}>Gratis</span>
                  </div>
                  <div style={S.totalRow}>
                    <span style={S.totalLabel}>Total</span>
                    <span style={S.totalValue}>${Number(total).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* CTA */}
                <div style={S.ctaArea}>
                  <motion.button
                    style={S.btnConfirmar}
                    onClick={() => { onClose(); onConfirmar(); }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <span>Confirmar pedido</span>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                  </motion.button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const S = {
  // Overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(30,19,51,0.45)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 900,
  },

  // Panel lateral
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: 'min(420px, 100vw)',
    background: '#fef9f0',
    zIndex: 901,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-16px 0 64px rgba(168,85,247,0.18)',
    fontFamily: "'Nunito', system-ui, sans-serif",
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },

  // Cabecera
  panelHeader: {
    background: 'linear-gradient(130deg, #7c3aed 0%, #a855f7 55%, #e879f9 100%)',
    padding: '1.5rem 1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  panelHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  panelIcon: { fontSize: '2rem', lineHeight: 1 },
  panelTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: '1.15rem',
    letterSpacing: '-0.02em',
  },
  panelSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.78rem',
    fontWeight: '600',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.18)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '700',
    transition: 'background 0.2s ease',
    fontFamily: 'inherit',
    flexShrink: 0,
  },

  // Lista items
  items: {
    flex: 1,
    padding: '0 1.5rem',
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: '1rem',
    borderBottom: '1px solid #f3e8ff',
    gap: '0.5rem',
    overflow: 'hidden',
  },
  itemLeft: { flex: 1, minWidth: 0, paddingRight: '0.5rem' },
  itemNombre: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#1e1333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemUnit: {
    fontSize: '0.72rem',
    color: '#a78bfa',
    marginTop: '3px',
    fontWeight: '600',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },

  // Controles qty
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: '#f3e8ff',
    borderRadius: '50px',
    padding: '3px',
    border: '1px solid #e9d5ff',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '1rem',
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
    minWidth: '24px',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: '0.9rem',
    color: '#1e1333',
  },
  itemSubtotal: {
    fontSize: '0.92rem',
    fontWeight: '900',
    color: '#7c3aed',
    minWidth: '62px',
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

  // Totales
  totalArea: {
    padding: '1.25rem 1.75rem',
    background: '#f3e8ff',
    borderTop: '1px solid #e9d5ff',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    flexShrink: 0,
  },
  shippingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingLabel: { fontSize: '0.8rem', color: '#7c6a9e', fontWeight: '600' },
  shippingFree: {
    fontSize: '0.7rem',
    fontWeight: '900',
    color: '#10b981',
    background: '#f0fdf4',
    padding: '0.22rem 0.7rem',
    borderRadius: '50px',
    border: '1px solid #bbf7d0',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  totalValue: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#1e1333',
    letterSpacing: '-0.04em',
    fontFamily: 'Georgia, serif',
  },

  // CTA
  ctaArea: {
    padding: '1.25rem 1.75rem 2rem',
    flexShrink: 0,
  },
  btnConfirmar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.65rem',
    width: '100%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%)',
    color: 'white',
    border: 'none',
    padding: '1.15rem 1.5rem',
    borderRadius: '18px',
    fontSize: '1.05rem',
    fontWeight: '900',
    cursor: 'pointer',
    fontFamily: "'Nunito', inherit",
    letterSpacing: '0.01em',
    boxShadow: '0 8px 28px rgba(168,85,247,0.42)',
  },

  // Vacío
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    textAlign: 'center',
    gap: '0.75rem',
  },
  emptyIcon: { fontSize: '3.5rem', opacity: 0.3, lineHeight: 1 },
  emptyTitle: { fontWeight: '900', color: '#1e1333', fontSize: '1.1rem', letterSpacing: '-0.02em' },
  emptySub: { color: '#a78bfa', fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.5 },
};
