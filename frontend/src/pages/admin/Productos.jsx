import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import {
  getProductosAdmin, crearProducto, editarProducto,
  eliminarProducto, toggleVisibilidad, subirImagen
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
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const cargar = () => getProductosAdmin().then(({ data }) => setProductos(data));

  useEffect(() => {
    cargar();
    getCategorias().then(({ data }) => setCategorias(data));
  }, []);

  const handleImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      const { data } = await subirImagen(formData);
      setForm((prev) => ({ ...prev, imagen_url: data.url }));
      setImagenPreview(data.url);
    } catch {
      alert('Error al subir la imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await editarProducto(editId, form);
    } else {
      await crearProducto(form);
    }
    setForm(emptyForm);
    setImagenPreview(null);
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
    setImagenPreview(p.imagenUrl || null);
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
          <button style={styles.btnPrimary} onClick={() => { setForm(emptyForm); setImagenPreview(null); setEditId(null); setShowForm(true); }}>
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
                <label style={styles.label}>Imagen del producto</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagen}
                  style={{ fontSize: '0.9rem', width: '100%' }}
                />
                {subiendoImagen && (
                  <p style={{ color: '#7c3aed', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                    Subiendo imagen...
                  </p>
                )}
                {(imagenPreview || form.imagen_url) && (
                  <img
                    src={imagenPreview || form.imagen_url}
                    alt="Preview"
                    style={{ marginTop: '0.75rem', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Descripción</label>
                <input style={styles.input} value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>

              <div style={styles.formActions}>
                <button style={styles.btnPrimary} type="submit" disabled={subiendoImagen}>
                  {subiendoImagen ? 'Subiendo imagen...' : 'Guardar'}
                </button>
                <button style={styles.btnSecondary} type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>

            </form>
          </div>
        )}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Imagen</th>
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
                  <td style={styles.td}>
                    {p.imagenUrl
                      ? <img src={p.imagenUrl} alt={p.nombre} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                      : <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🍬</div>
                    }
                  </td>
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
  main: { marginLeft: '240px', padding: '2rem 2.5rem', flex: 1, background: '#f5f4ff', minHeight: '100vh', fontFamily: "'Nunito', system-ui, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '1.85rem', fontWeight: '900', color: '#1e1333', letterSpacing: '-0.03em', margin: 0 },
  btnPrimary: { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', fontFamily: 'inherit' },
  btnSecondary: { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe', padding: '0.65rem 1.2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginRight: '0.25rem' },
  formCard: { background: 'white', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.75rem', border: '1px solid #ede9fe', boxShadow: '0 1px 6px rgba(109,40,217,0.06)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formActions: { gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #ede9fe', fontSize: '0.9rem', boxSizing: 'border-box', background: 'white', fontFamily: 'inherit', outline: 'none' },
  tableWrapper: { background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #ede9fe', boxShadow: '0 1px 6px rgba(109,40,217,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#faf9ff' },
  th: { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '700', color: '#9ca3af', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #ede9fe' },
  tr: { borderBottom: '1px solid #f5f3ff' },
  td: { padding: '0.875rem 1.25rem', fontSize: '0.88rem', color: '#1e1333', fontWeight: '500' },
  categoriaBadge: { background: '#ede9fe', color: '#7c3aed', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
};