import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import { getKpis, getVentasDiarias, getTopProductos, getHeatmap, getAnalisisPareto, getAnalisisRFM, getSaludStock, getCrossSelling } from '../../api/adminApi';

// ─── Skeleton ────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '18px', padding: '1.4rem 1.5rem', height: '88px', border: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(90deg, #f3e8ff 25%, #ede9fe 50%, #f3e8ff 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '10px', width: '60%', borderRadius: '4px', background: 'linear-gradient(90deg, #f3e8ff 25%, #ede9fe 50%, #f3e8ff 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite', marginBottom: '8px' }} />
              <div style={{ height: '22px', width: '80%', borderRadius: '4px', background: 'linear-gradient(90deg, #f3e8ff 25%, #ede9fe 50%, #f3e8ff 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [kpis, setKpis]               = useState(null);
  const [ventas, setVentas]           = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [heatmap, setHeatmap]         = useState([]);
  const [pareto, setPareto]           = useState([]);
  const [rfm, setRfm]                 = useState([]);
  const [stock, setStock]             = useState([]);
  const [crossSelling, setCrossSelling] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [hovBar, setHovBar]           = useState(null);

  useEffect(() => {
    Promise.all([
      getKpis(), getVentasDiarias(), getTopProductos(),
      getHeatmap(), getAnalisisPareto(), getAnalisisRFM(), getSaludStock(), getCrossSelling(),
    ])
      .then(([kpisRes, ventasRes, topRes, heatRes, paretoRes, rfmRes, stockRes, crossRes]) => {
        setKpis(kpisRes.data);
        setVentas(ventasRes.data);
        setTopProductos(topRes.data);
        setHeatmap(heatRes.data ?? []);
        setPareto(paretoRes.data ?? []);
        setRfm(rfmRes.data ?? []);
        setStock(stockRes.data ?? []);
        setCrossSelling(crossRes.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPeso = (n) => {
    const num = parseFloat(n);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);
  };

  const maxVenta = Math.max(...ventas.map((v) => parseFloat(v.ingresos) || 0), 1);
  const maxUnidades = Math.max(...topProductos.map((p) => parseFloat(p.unidades) || 0), 1);

  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const rankStyle = (i) => {
    if (i === 0) return { bg: '#fef3c7', color: '#d97706' };
    if (i === 1) return { bg: '#f3f4f6', color: '#6b7280' };
    if (i === 2) return { bg: '#fef9c3', color: '#92400e' };
    return { bg: '#f5f3ff', color: '#7c3aed' };
  };

  return (
    <div style={D.layout}>
      <Sidebar />
      <main style={D.main}>

        {/* ── Header ── */}
        <div style={D.header}>
          <div>
            <h1 style={D.title}>Dashboard</h1>
            <p style={D.subtitle}>{hoy} · Resumen del mes actual</p>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* ── KPIs ── */}
            <div style={D.kpiGrid}>
              <StatsCard icon="💰" label="Ventas del mes"       value={formatPeso(kpis?.total_ventas_mes)}  color="#10b981" />
              <StatsCard icon="🛒" label="Pedidos del mes"      value={kpis?.cantidad_pedidos_mes ?? '0'}   color="#7c3aed" />
              <StatsCard icon="🎯" label="Ticket promedio"      value={formatPeso(kpis?.ticket_promedio)}   color="#f59e0b" />
              <StatsCard icon="👥" label="Clientes únicos"      value={kpis?.clientes_unicos ?? '0'}        color="#3b82f6" />
              <StatsCard icon="🏆" label="Producto más vendido" value={kpis?.producto_mas_vendido ?? '—'}   color="#ef4444" />
              <StatsCard icon="💵" label="Mayor ingreso"        value={kpis?.producto_mas_ingresos ?? '—'}  color="#06b6d4" />
            </div>

            {/* ── Bar chart ── */}
            {ventas.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Ventas últimos 30 días</h2>
                    <p style={D.cardSub}>Ingresos diarios en ARS</p>
                  </div>
                  <div style={D.legend}>
                    <span style={D.legendDot} />
                    <span style={D.legendLabel}>Ingresos</span>
                  </div>
                </div>

                {/* Bars + grid */}
                <div style={{ position: 'relative' }}>
                  {/* Horizontal grid lines */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', pointerEvents: 'none' }}>
                    <div style={D.gridLine} />
                    <div style={D.gridLine} />
                    <div style={D.gridLine} />
                  </div>

                  {/* Bars */}
                  <div style={{ height: '190px', display: 'flex', alignItems: 'flex-end', gap: '3px', position: 'relative', zIndex: 1 }}>
                    {ventas.map((v, i) => {
                      const pct = (parseFloat(v.ingresos) / maxVenta) * 100;
                      const hov = hovBar === i;
                      return (
                        <div
                          key={i}
                          style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', position: 'relative', cursor: 'default' }}
                          onMouseEnter={() => setHovBar(i)}
                          onMouseLeave={() => setHovBar(null)}
                        >
                          {hov && (
                            <div style={D.tooltip}>
                              <span style={D.tooltipVal}>{formatPeso(v.ingresos)}</span>
                              <span style={D.tooltipDate}>
                                {new Date(v.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                          )}
                          <div style={{
                            width: '100%',
                            height: `${Math.max(pct, 2)}%`,
                            borderRadius: '5px 5px 0 0',
                            background: hov
                              ? 'linear-gradient(to top, #6d28d9, #e879f9)'
                              : 'linear-gradient(to top, #a855f7, #c084fc)',
                            boxShadow: hov ? '0 0 10px rgba(168,85,247,0.45)' : 'none',
                            transition: 'all 0.18s ease',
                          }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis labels */}
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {ventas.map((v, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.55rem', color: '#c4b5fd', fontWeight: '600' }}>
                        {new Date(v.fecha).getDate()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Salud de stock ── */}
            {stock.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Salud del Stock</h2>
                    <p style={D.cardSub}>Estado actual de inventario por producto</p>
                  </div>
                </div>
                <div style={D.topList}>
                  {stock.map((p, i) => {
                    const dias = parseFloat(p.dias_de_invetario_restante) || 0;
                    const statusColor = dias < 7 ? '#ef4444' : dias < 14 ? '#f59e0b' : '#10b981';
                    const statusLabel = dias < 7 ? 'crítico' : dias < 14 ? 'bajo' : 'ok';
                    const stockActual = parseFloat(p.stock_actual) || 0;
                    const maxStock = Math.max(...stock.map((s) => parseFloat(s.stock_actual) || 0), 1);
                    const barPct = Math.min((stockActual / maxStock) * 100, 100);
                    return (
                      <div key={i} style={D.topRow}>
                        <div style={{ ...D.rankBadge, background: `${statusColor}18`, color: statusColor, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                          {statusLabel}
                        </div>
                        <div style={D.topMeta}>
                          <div style={D.topName}>{p.nombre}</div>
                          <div style={D.topBarTrack}>
                            <div style={{ ...D.topBarFill, background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`, width: `${barPct}%` }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '500', marginTop: '0.25rem' }}>
                            Venta diaria promedio: <strong style={{ color: '#7c3aed' }}>{parseFloat(p.venta_diaria_promedio).toFixed(1)} ud.</strong>
                          </div>
                        </div>
                        <div style={D.topStats}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '900', color: statusColor, lineHeight: 1 }}>
                            {stockActual}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: statusColor, opacity: 0.75, whiteSpace: 'nowrap' }}>ud. en stock</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: statusColor, marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                            {dias.toFixed(0)} días
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Análisis Pareto ── */}
            {pareto.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Análisis Pareto</h2>
                    <p style={D.cardSub}>Productos que concentran el 80% de los ingresos</p>
                  </div>
                </div>
                <div style={D.topList}>
                  {pareto.map((p, i) => {
                    const pctAcum = parseFloat(p.porcentaje_acumulado) || 0;
                    const pctContrib = parseFloat(p.porcentaje_contribucion) || 0;
                    const cat = p.categoria_pareto ?? 'C';
                    const catColor = cat === 'A' ? '#7c3aed' : cat === 'B' ? '#f59e0b' : '#9ca3af';
                    return (
                      <div key={i} style={D.topRow}>
                        <div style={{ ...D.rankBadge, background: `${catColor}18`, color: catColor, fontSize: '0.9rem', fontWeight: '900' }}>
                          {cat}
                        </div>
                        <div style={D.topMeta}>
                          <div style={D.topName}>{p.nombre}</div>
                          <div style={D.topBarTrack}>
                            <div style={{ ...D.topBarFill, width: `${pctAcum}%`, background: cat === 'A' ? 'linear-gradient(90deg, #a855f7, #e879f9)' : cat === 'B' ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #d1d5db, #9ca3af)' }} />
                          </div>
                          <div style={{ fontSize: '0.68rem', fontWeight: '600', color: catColor, marginTop: '0.3rem', display: 'flex', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                            <span>{pctContrib.toFixed(1)}% propio</span>
                            <span>·</span>
                            <span>{pctAcum.toFixed(1)}% acum.</span>
                          </div>
                        </div>
                        <div style={D.topStats}>
                          <span style={D.topUnidades}>{formatPeso(p.ingresos_producto)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Segmentos RFM ── */}
            {rfm.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Segmentos de Clientes (RFM)</h2>
                    <p style={D.cardSub}>Clasificación por recencia, frecuencia y monto</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        {['Nombre', 'Teléfono', 'Recencia (días)', 'Frecuencia', 'Valor monetario', 'Segmento'].map((col) => (
                          <th key={col} style={{ padding: '0.5rem 0.75rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #ede9fe', whiteSpace: 'nowrap' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rfm.map((c, i) => {
                        const seg = c.segmento_cliente ?? '';
                        const segColor = seg === 'VIP' ? '#7c3aed' : seg === 'Leal' ? '#10b981' : seg === 'En riesgo' ? '#ef4444' : '#f59e0b';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f5f3ff' }}>
                            <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: '#1e1333' }}>{c.nombre ?? '—'}</td>
                            <td style={{ padding: '0.55rem 0.75rem', color: '#6b7280' }}>{c.telefono ?? '—'}</td>
                            <td style={{ padding: '0.55rem 0.75rem', color: '#6b7280', textAlign: 'center' }}>{c.recencia_dias ?? '—'}</td>
                            <td style={{ padding: '0.55rem 0.75rem', color: '#6b7280', textAlign: 'center' }}>{c.frecuencia_pedidos ?? '—'}</td>
                            <td style={{ padding: '0.55rem 0.75rem', fontWeight: '600', color: '#1e1333' }}>{formatPeso(c.valor_monetario)}</td>
                            <td style={{ padding: '0.55rem 0.75rem' }}>
                              <span style={{ background: `${segColor}18`, color: segColor, fontWeight: '800', fontSize: '0.68rem', textTransform: 'uppercase', borderRadius: '6px', padding: '3px 8px' }}>
                                {seg || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Cross-selling ── */}
            {crossSelling.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Cross-Selling</h2>
                    <p style={D.cardSub}>Productos que se compran juntos con frecuencia</p>
                  </div>
                </div>
                <div style={D.topList}>
                  {crossSelling.slice(0, 8).map((p, i) => (
                    <div key={i} style={{ ...D.topRow, gap: '0.75rem' }}>
                      <div style={{ ...D.rankBadge, background: '#f0fdf4', color: '#10b981' }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0, fontSize: '0.85rem', fontWeight: '600', color: '#1e1333', wordBreak: 'break-word', lineHeight: '1.4' }}>
                        {p.producto_a ?? p.producto1} <span style={{ color: '#a855f7', fontWeight: '800' }}>+</span> {p.producto_b ?? p.producto2}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#10b981', flexShrink: 0 }}>
                        {p.frecuencia} veces
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Heatmap de horarios ── */}
            {heatmap.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Actividad por Horario</h2>
                    <p style={D.cardSub}>Pedidos según día y hora</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                    <thead>
                      <tr>
                        {Object.keys(heatmap[0] ?? {}).map((k) => (
                          <th key={k} style={{ padding: '0.4rem 0.6rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #ede9fe', whiteSpace: 'nowrap' }}>
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f5f3ff' }}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{ padding: '0.45rem 0.6rem', color: '#1e1333', fontWeight: j === 0 ? '700' : '500' }}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Top productos ── */}
            {topProductos.length > 0 && (
              <div style={D.card}>
                <div style={D.cardHeader}>
                  <div>
                    <h2 style={D.cardTitle}>Top Productos</h2>
                    <p style={D.cardSub}>Ranking por unidades vendidas este mes</p>
                  </div>
                </div>
                <div style={D.topList}>
                  {topProductos.map((p, i) => {
                    const barPct = (parseFloat(p.unidades) / maxUnidades) * 100;
                    const rs = rankStyle(i);
                    return (
                      <div key={i} style={D.topRow}>
                        <div style={{ ...D.rankBadge, background: rs.bg, color: rs.color }}>
                          {i + 1}
                        </div>
                        <div style={D.topMeta}>
                          <div style={D.topName}>{p.nombre}</div>
                          <div style={D.topBarTrack}>
                            <div style={{ ...D.topBarFill, width: `${barPct}%` }} />
                          </div>
                        </div>
                        <div style={D.topStats}>
                          <span style={D.topUnidades}>{p.unidades} ud.</span>
                          <span style={D.topIngresos}>{formatPeso(p.ingresos)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────
const D = {
  layout: { display: 'flex' },
  main: {
    marginLeft: '240px',
    padding: '2rem 2.5rem',
    flex: 1,
    background: '#f5f4ff',
    minHeight: '100vh',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.85rem',
    fontWeight: '900',
    color: '#1e1333',
    letterSpacing: '-0.03em',
    margin: '0 0 0.25rem',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'capitalize',
    margin: 0,
  },

  // KPI grid
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  },

  // Card
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '1.5rem 1.75rem',
    border: '1px solid #ede9fe',
    boxShadow: '0 1px 6px rgba(109,40,217,0.06)',
    marginBottom: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#1e1333',
    letterSpacing: '-0.01em',
    margin: '0 0 0.2rem',
  },
  cardSub: {
    fontSize: '0.76rem',
    color: '#9ca3af',
    fontWeight: '500',
    margin: 0,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  legendDot: {
    width: '8px', height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7, #e879f9)',
    boxShadow: '0 0 6px rgba(168,85,247,0.5)',
  },
  legendLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#a78bfa',
  },

  // Chart
  gridLine: {
    height: '1px',
    background: 'rgba(109,40,217,0.07)',
    width: '100%',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '6px',
    background: '#1e1333',
    borderRadius: '8px',
    padding: '0.35rem 0.65rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    zIndex: 10,
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    pointerEvents: 'none',
  },
  tooltipVal: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'white',
    letterSpacing: '-0.01em',
  },
  tooltipDate: {
    fontSize: '0.58rem',
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },

  // Top productos
  topList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 1rem',
    background: '#faf9ff',
    borderRadius: '12px',
    border: '1px solid #f3f0ff',
    minWidth: 0,
  },
  rankBadge: {
    width: '32px', height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  topMeta: { flex: 1, minWidth: 0 },
  topName: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#1e1333',
    marginBottom: '0.4rem',
    wordBreak: 'break-word',
    lineHeight: '1.3',
  },
  topBarTrack: {
    height: '5px',
    background: '#ede9fe',
    borderRadius: '50px',
    overflow: 'hidden',
  },
  topBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a855f7, #e879f9)',
    borderRadius: '50px',
    transition: 'width 0.5s ease',
  },
  topStats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.15rem',
    flexShrink: 0,
    textAlign: 'right',
    maxWidth: '120px',
  },
  topUnidades: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#1e1333',
    whiteSpace: 'nowrap',
  },
  topIngresos: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#a78bfa',
    whiteSpace: 'nowrap',
  },
};
