import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import {
  getProductosAdmin, crearProducto, editarProducto,
  eliminarProducto, toggleVisibilidad
} from '../../api/productosApi';
import { getCategorias } from '../../api/adminApi';

const emptyForm = {
  nombre: '', descripcion: '', precio: '',
  precio_costo: '', categoria: '', stock: '', imagen_url: ''
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const cargar = () => getProductosAdmin().then(({ data }) => setProductos(data));

  useEffect(() => {
    cargar();
    getCategorias().then(({ data }) => setCategorias(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await editarProducto(editId, form);
    } else {
      await crearProducto(form);
    }
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    cargar();
  };

  const handleEditar = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: '',
      precio: p.precio,
      precio_costo: p.precio_costo,
      categoria: p.categoria,
      stock: p.stock,
      imagen_url: p.imagenUrl || ''
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este producto?')) {
      await eliminarProducto(id);
      cargar();
    }
  };

  const handleToggle = async (id) => {
    await toggleVisibilidad(id);
    cargar();
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🍬 Productos</h1>
          <button style={styles.btnPrimary} onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
            + Nuevo producto
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{ marginBottom: '1rem' }}>{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <form onSubmit={handleSubmit} style={styles.formGrid}>

              <div>
                <label style={styles.label}>Nombre *</label>
                <input style={styles.input} value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>

              <div>
                <label style={styles.label}>Categoría *</label>
                <select
                  style={styles.input}
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  required
                >
                  <option value="">— Seleccioná una categoría —</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Precio venta *</label>
                <input style={styles.input} type="number" value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
              </div>

              <div>
                <label style={styles.label}>Precio costo *</label>
                <input style={styles.input} type="number" value={form.precio_costo}
                  onChange={(e) => setForm({ ...form, precio_costo: e.target.value })} required />
              </div>

              <div>
                <label style={styles.label}>Stock *</label>
                <input style={styles.input} type="number" value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              </div>

              <div>
                <label style={styles.label}>URL Imagen</label>
                <input style={styles.input} value={form.imagen_url}
                  onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Descripción</label>
                <input style={styles.input} value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} type="submit">Guardar</button>
                <button style={styles.btnSecondary} type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>

            </form>
          </div>
        )}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Costo</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Visible</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.nombre}</td>
                  <td style={styles.td}>
                    <span style={styles.categoriaBadge}>{p.categoria}</span>
                  </td>
                  <td style={styles.td}>${p.precio}</td>
                  <td style={styles.td}>${p.precio_costo}</td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <span style={{ color: p.visible ? '#10b981' : '#ef4444' }}>
                      {p.visible ? '✅' : '❌'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnSmall} onClick={() => handleEditar(p)}>✏️</button>
                    <button style={styles.btnSmall} onClick={() => handleToggle(p.id)}>👁️</button>
                    <button style={{ ...styles.btnSmall, color: '#ef4444' }} onClick={() => handleEliminar(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', color: '#1f2937' },
  btnPrimary: { background: '#7c3aed', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnSecondary: { background: '#e5e7eb', color: '#374151', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginRight: '0.25rem' },
  formCard: { background: 'white', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formActions: { gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' },
  input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '0.95rem', boxSizing: 'border-box', background: 'white' },
  tableWrapper: { background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  categoriaBadge: { background: '#ede9fe', color: '#7c3aed', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
};