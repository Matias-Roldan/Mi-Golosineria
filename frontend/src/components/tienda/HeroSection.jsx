import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { T } from './tiendaStyles';

function FloatingCandy({ emoji, style }) {
  const duration = useMemo(() => 5 + Math.random() * 3, []); // eslint-disable-line react-hooks/purity
  return (
    <motion.span
      style={{ position: 'absolute', fontSize: '2.5rem', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', ...style }}
      animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.span>
  );
}

export default function HeroSection({ isMobile, totalItems, onScrollToProductos, onOpenCarrito }) {
  return (
    <section style={T.hero}>
      {/* Blobs de fondo */}
      <div style={{ ...T.blob, top: '-80px', right: '-60px', width: '380px', height: '380px', background: 'radial-gradient(circle,#e9d5ff 0%,transparent 70%)' }} />
      <div style={{ ...T.blob, bottom: '-60px', left: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle,#fce7f3 0%,transparent 70%)' }} />
      <div style={{ ...T.blob, top: '30%', left: '40%', width: '200px', height: '200px', background: 'radial-gradient(circle,#f3e8ff 0%,transparent 70%)' }} />

      {/* Candies flotantes */}
      <FloatingCandy emoji="🍫" style={{ top: '12%', right: isMobile ? '5%' : '12%' }} />
      <FloatingCandy emoji="🍭" style={{ top: '55%', right: isMobile ? '8%' : '20%' }} />
      <FloatingCandy emoji="🍪" style={{ bottom: '18%', left: isMobile ? '5%' : '10%' }} />
      <FloatingCandy emoji="🧁" style={{ top: '20%', left: isMobile ? '80%' : '30%' }} />

      {/* Contenido */}
      <div style={{ ...T.heroContent, padding: isMobile ? '0 1.25rem' : '0 2.5rem' }}>
        <motion.div
          style={T.heroEyebrow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        >
          <span style={T.heroEyebrowDot} />
          Tienda Online · Mondelez &amp; más
        </motion.div>

        <motion.h1
          style={{ ...T.heroTitle, fontSize: isMobile ? 'clamp(2.4rem,11vw,3.2rem)' : 'clamp(3rem,6vw,5rem)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
        >
          La mejor<br />
          <span style={T.heroTitleAccent}>golosinería</span>
        </motion.h1>

        <motion.p
          style={{ ...T.heroSub, fontSize: isMobile ? '0.95rem' : '1.1rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
        >
          Más de 50 sabores · chocolates importados · caramelos sin TACC<br />
          Envíos en el día a todo el país 🚀
        </motion.p>

        <motion.div
          style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.button
            style={T.heroCta}
            onClick={onScrollToProductos}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          >
            Ver productos ↓
          </motion.button>
          <motion.button
            style={T.heroCtaSecundario}
            onClick={onOpenCarrito}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          >
            🛒 Mi carrito
            {totalItems > 0 && <span style={T.heroCartCount}>{totalItems}</span>}
          </motion.button>
        </motion.div>

        {/* Stats rápidos */}
        <motion.div
          style={{ ...T.heroStats, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.75rem' : '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {[['50+', 'Productos'], ['⚡', 'Envío express'], ['💜', 'Sin TACC']].map(([val, lbl]) => (
            <div key={lbl} style={T.heroStat}>
              <span style={T.heroStatVal}>{val}</span>
              <span style={T.heroStatLbl}>{lbl}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
