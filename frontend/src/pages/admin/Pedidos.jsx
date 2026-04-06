import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getPedidosAdmin, getDetallePedido, cambiarEstado } from '../../api/pedidosApi';

const ESTADOS = ['pendiente', 'confirmado', 'entregado', 'cancelado'];
const colorEstado = { pendiente: '#f59e0b', confirmado: '#3b82f6', entregado: '#10b981', cancelado: '#ef4444' };

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [pedidoSel, setPedidoSel] = useState(null);

  const cargar = () => getPedidosAdmin().then(({ data }) => setPedidos(data));
  useEffect(() => { cargar(); }, []);

  const verDetalle = async (pedido) => {
    const { data } = await getDetallePedido(pedido.id);
    setDetalle(data);
    setPedidoSel(pedido);
  };

  const handleEstado = async (id, estado) => {
    await cambiarEstado(id, estado);
    cargar();
    if (pedidoSel?.id === id) setPedidoSel({ ...pedidoSel, estado });
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>🛒 Pedidos</h1>

        <div style={styles.content}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th>#</th><th>Cliente</th><th>Teléfono</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>#{p.id}</td>
                    <td style={styles.td}>{p.nombreCliente}</td>
                    <td style={styles.td}>{p.telefono}</td>
                    <td style={styles.td}>${p.total}</td>
                    <td style={styles.td}>
                      <select
                        value={p.estado}
                        onChange={(e) => handleEstado(p.id, e.target.value)}
                        style={{ ...styles.badge, background: colorEstado[p.estado], color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
                      >
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td style={styles.td}>{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                    <td style={styles.td}>
                      <button style={styles.btnSmall} onClick={() => verDetalle(p)}>🔍</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pedidoSel && (
            <div style={styles.detalle}>
              <h3>Pedido #{pedidoSel.id}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{pedidoSel.nombreCliente} · {pedidoSel.telefono}</p>
              <table style={{ ...styles.table, marginTop: '1rem' }}>
                <thead>
                  <tr style={styles.thead}>
                    <th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle?.map((item, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{item.producto_nombre}</td>
                      <td style={styles.td}>{item.cantidad}</td>
                      <td style={styles.td}>${item.precioUnitario}</td>
                      <td style={styles.td}>${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={styles.totalDetalle}>Total: ${pedidoSel.total}</p>
              <button style={styles.btnCerrar} onClick={() => { setDetalle(null); setPedidoSel(null); }}>Cerrar</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  title: { fontSize: '1.75rem', color: '#1f2937', marginBottom: '1.5rem' },
  content: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  tableWrapper: { flex: 1, background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb', fontWeight: '600', color: '#374151', fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  badge: { fontSize: '0.8rem', fontWeight: '600' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' },
  detalle: { width: '320px', background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  totalDetalle: { fontWeight: '700', fontSize: '1.1rem', marginTop: '1rem', textAlign: 'right' },
  btnCerrar: { marginTop: '1rem', background: '#e5e7eb', border: 'none', padding: '0.5rem 1rem', borderRadius: '7px', cursor: 'pointer', width: '100%' },
};