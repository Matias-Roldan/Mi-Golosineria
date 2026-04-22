import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductoCard from './ProductoCard';
import CategoryTabs from './CategoryTabs';
import { T } from './tiendaStyles';

// ─── Staggered reveal ─────────────────────────────────────────────────
const useStaggeredVisible = (count) => {
  const [visibles, setVisibles] = useState([]);
  useEffect(() => {
    setVisibles([]); // eslint-disable-line react-hooks/set-state-in-effect
    Array.from({ length: count }).forEach((_, i) => {
      setTimeout(() => setVisibles((prev) => [...prev, i]), i * 55);
    });
  }, [count]);
  return visibles;
};

// ─── Skeleton card ────────────────────────────────────────────────────
const skeletonS = {
  card: { background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f3e8ff' },
  img: { height: '250px', background: 'linear-gradient(90deg,#f3e8ff 25%,#e9d5ff 50%,#f3e8ff 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite' },
  body: { padding: '1.2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' },
  line: { borderRadius: '8px', background: 'linear-gradient(90deg,#f3e8ff 25%,#e9d5ff 50%,#f3e8ff 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.4s ease infinite' },
};

const SkeletonCard = () => (
  <div style={skeletonS.card}>
    <div style={skeletonS.img} />
    <div style={skeletonS.body}>
      <div style={{ ...skeletonS.line, width: '40%', height: '9px' }} />
      <div style={{ ...skeletonS.line, width: '80%', height: '15px', marginTop: '10px' }} />
      <div style={{ ...skeletonS.line, width: '55%', height: '9px', marginTop: '6px' }} />
      <div style={{ ...skeletonS.line, width: '100%', height: '38px', marginTop: '18px', borderRadius: '14px' }} />
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 1rem', gap: '1rem' }}>
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="48" fill="#f3e8ff" />
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="38">🍬</text>
      </svg>
      <p style={{ color: '#1e1333', fontWeight: '900', fontSize: '1.15rem', margin: 0, letterSpacing: '-0.02em' }}>
        Sin productos aquí
      </p>
      <p style={{ color: '#7c6a9e', fontSize: '0.875rem', margin: 0 }}>
        Esta categoría no tiene productos disponibles.
      </p>
      <motion.button
        style={{
          marginTop: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '50px',
          border: '1.5px solid #e9d5ff', background: 'white', color: '#7c3aed',
          fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
        }}
        onClick={onReset}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
      >
        ✦ Ver todos los productos
      </motion.button>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 1rem', gap: '1rem' }}>
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="48" fill="#ffe4e6" />
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="38">😵</text>
      </svg>
      <p style={{ color: '#be123c', fontWeight: '900', fontSize: '1.15rem', margin: 0, letterSpacing: '-0.02em' }}>
        No pudimos cargar los productos
      </p>
      <p style={{ color: '#7c6a9e', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
        Hubo un problema al conectarse con el servidor.<br />Verificá tu conexión e intentá de nuevo.
      </p>
      <motion.button
        style={{
          marginTop: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '50px',
          border: 'none', background: 'linear-gradient(135deg,#be123c,#e11d48)',
          color: 'white', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
        }}
        onClick={onRetry}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
      >
        Reintentar
      </motion.button>
    </div>
  );
}

export default function ProductosGrid({
  loading,
  error,
  filtrados,
  categorias,
  categoriaActiva,
  onCategoriaChange,
  onResetCategoria,
  isMobile,
}) {
  const visibles = useStaggeredVisible(filtrados.length);

  return (
    <div style={T.productosBg}>
      <div style={{ ...T.container, padding: isMobile ? '0 1rem 5rem' : '0 2.5rem 4rem' }}>

        <div style={T.sectionHeader}>
          <h2 style={T.sectionTitle}>Nuestros productos</h2>
          <p style={T.sectionSub}>Seleccioná tus favoritos y armá tu pedido</p>
        </div>

        <CategoryTabs
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          onCategoriaChange={onCategoriaChange}
          isMobile={isMobile}
        />

        {!loading && !error && (
          <div style={T.sep}>
            <span style={T.sepLine} />
            <span style={T.sepChip}>
              {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
            </span>
            <span style={T.sepLine} />
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fill,minmax(158px,1fr))'
            : 'repeat(auto-fill,minmax(280px,1fr))',
          gap: isMobile ? '1rem' : '1.5rem',
          width: '100%',
        }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : error
              ? <ErrorState onRetry={() => window.location.reload()} />
              : filtrados.length === 0
              ? <EmptyState onReset={onResetCategoria} />
              : filtrados.map((p, i) => (
                  <div key={p.id} style={{
                    animation: visibles.includes(i) ? 'fadeUp 0.42s ease both' : 'none',
                    opacity: visibles.includes(i) ? 1 : 0,
                  }}>
                    <ProductoCard producto={p} />
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  );
}
