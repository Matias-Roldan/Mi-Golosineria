import { useState } from 'react';
import { T } from './tiendaStyles';

const CAT_EMOJI = { Todas: '✦', Chocolates: '🍫', Caramelos: '🍬', Chicles: '🫧', Galletas: '🍪', Snacks: '🍿', Bebidas: '🥤' };
const catEmoji = (c) => CAT_EMOJI[c] ?? '🏷';

export default function CategoryTabs({ categorias, categoriaActiva, onCategoriaChange, isMobile }) {
  const [hoveredCat, setHoveredCat] = useState(null);

  return (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
        {categorias.map((cat) => {
          const active = cat === categoriaActiva;
          const hov    = hoveredCat === cat;
          return (
            <button
              key={cat}
              style={{
                ...T.pill,
                ...(active ? T.pillActive : hov ? T.pillHover : {}),
                flexShrink: isMobile ? 0 : undefined,
              }}
              onClick={() => onCategoriaChange(cat)}
              onMouseEnter={() => setHoveredCat(cat)}
              onMouseLeave={() => setHoveredCat(null)}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{catEmoji(cat)}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
