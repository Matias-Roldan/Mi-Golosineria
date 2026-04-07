import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import { getKpis, getVentasDiarias, getTopProductos } from '../../api/adminApi';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getKpis(),
      getVentasDiarias(),
      getTopProductos(),
    ]).then(([kpisRes, ventasRes, topRes]) => {
      setKpis(kpisRes.data);
      setVentas(ventasRes.data);
      setTopProductos(topRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const formatPeso = (n) => {
    const num = parseFloat(n);
    if (isNaN(num)) return '$ 0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
  };

  const maxVenta = Math.max(...ventas.map(v => parseFloat(v.ingresos) || 0), 1);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>📊 Dashboard</h1>
        <p style={styles.subtitle}>Resumen del mes actual</p>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        ) : (
          <>
            {/* KPIs */}
            <div style={styles.grid}>
              <StatsCard icon="💰" label="Ventas del mes"       value={formatPeso(kpis?.total_ventas_mes)}  color="#10b981" />
              <StatsCard icon="🛒" label="Pedidos del mes"      value={kpis?.cantidad_pedidos_mes ?? '0'}   color="#7c3aed" />
              <StatsCard icon="🎯" label="Ticket promedio"      value={formatPeso(kpis?.ticket_promedio)}   color="#f59e0b" />
              <StatsCard icon="👥" label="Clientes únicos"      value={kpis?.clientes_unicos ?? '0'}        color="#3b82f6" />
              <StatsCard icon="🏆" label="Producto más vendido" value={kpis?.producto_mas_vendido ?? '—'}   color="#ef4444" />
              <StatsCard icon="💵" label="Mayor ingreso"        value={kpis?.producto_mas_ingresos ?? '—'}  color="#06b6d4" />
            </div>

            {/* Gráfico ventas diarias */}
            {ventas.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>📈 Ventas últimos 30 días</h2>
                <div style={styles.chartWrap}>
                  {ventas.map((v, i) => {
                    const pct = (parseFloat(v.ingresos) / maxVenta) * 100;
                    return (
                      <div key={i} style={styles.barWrap} title={`${v.fecha}: ${formatPeso(v.ingresos)}`}>
                        <div style={{ ...styles.bar, height: `${pct}%`, background: pct > 70 ? '#7c3aed' : pct > 40 ? '#a78bfa' : '#c4b5fd' }} />
                        <span style={styles.barLabel}>{new Date(v.fecha).getDate()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top productos */}
            {topProductos.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🏅 Top productos</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Unidades</th>
                      <th style={styles.th}>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.rank}>{i + 1}</span>
                        </td>
                        <td style={styles.td}>{p.nombre}</td>
                        <td style={styles.td}>{p.unidades}</td>
                        <td style={styles.td}>{formatPeso(p.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  title: { fontSize: '1.75rem', color: '#1f2937', marginBottom: '0.25rem' },
  subtitle: { color: '#6b7280', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.25rem' },
  chartWrap: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '180px', padding: '0 0.5rem' },
  barWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '4px' },
  bar: { width: '100%', borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s ease' },
  barLabel: { fontSize: '0.6rem', color: '#9ca3af' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.85rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  rank: { background: '#ede9fe', color: '#7c3aed', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' },
};