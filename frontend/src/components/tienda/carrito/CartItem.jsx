import { useState } from 'react';
import { motion } from 'framer-motion';
import S from './carritoStyles';

export default function CartItem({ item, stockOriginal, onCambiar, onQuitar }) {
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

        <div style={S.itemSubtotal}>
          ${Number(item.precio * item.cantidad).toLocaleString('es-AR')}
        </div>

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
