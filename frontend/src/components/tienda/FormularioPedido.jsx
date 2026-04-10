import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { registrarPedido, validarCupon } from '../../api/pedidosApi';
import { useNavigate } from 'react-router-dom';

export default function FormularioPedido({ onCancelar }) {
  const { carrito, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre_cliente: '', telefono: '', notas: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cupon, setCupon] = useState(null);
  const [cuponError, setCuponError] = useState('');
  const [validandoCupon, setValidandoCupon] = useState(false);

  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setValidandoCupon(true);
    setCuponError('');
    setCupon(null);
    try {
      const { data } = await validarCupon(codigoCupon.trim(), total);
      setCupon(data);
    } catch (err) {
      setCuponError(err.response?.data?.error || 'Cupón inválido o vencido');
    } finally {
      setValidandoCupon(false);
    }
  };

  const quitarCupon = () => {
    setCupon(null);
    setCodigoCupon('');
    setCuponError('');
  };

  const totalFinal = cupon ? Math.max(0, total - (cupon.descuento_calculado ?? 0)) : total;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nombreTrim = form.nombre_cliente.trim();
    const telefonoTrim = form.telefono.trim();

    if (nombreTrim.length < 2 || nombreTrim.length > 100) {
      setError('El nombre debe tener entre 2 y 100 caracteres.');
      return;
    }
    if (!/^\d{7,20}$/.test(telefonoTrim)) {
      setError('El teléfono debe contener solo dígitos (7-20 caracteres).');
      return;
    }
    if (form.notas && form.notas.length > 500) {
      setError('Las notas no pueden superar los 500 caracteres.');
      return;
    }
    if (carrito.length === 0) {
      setError('El carrito está vacío.');
      return;
    }

    setLoading(true);
    try {
      const items = carrito.map((p) => ({ id: p.id, cant: p.cantidad }));
      const payload = { ...form, nombre_cliente: nombreTrim, telefono: telefonoTrim, items };
      if (cupon) payload.cupon = codigoCupon.trim();
      const { data } = await registrarPedido(payload);
      vaciar();
      navigate('/confirmacion', { state: { pedido_id: data.pedido_id, nombre: nombreTrim } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.titulo}>📋 Completá tu pedido</h3>
        <div style={styles.resumen}>
          {carrito.map((p) => (
            <div key={p.id} style={styles.resumenItem}>
              <span>{p.nombre} x{p.cantidad}</span>
              <span>${Number(p.precio * p.cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))}
          {cupon && (
            <div style={{ ...styles.resumenItem, color: '#16a34a' }}>
              <span>Descuento ({cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `$${cupon.valor}`})</span>
              <span>-${Number(cupon.descuento_calculado).toLocaleString('es-AR')}</span>
            </div>
          )}
          <div style={styles.resumenTotal}>
            <span>Total</span>
            <span>${Number(totalFinal).toLocaleString('es-AR')}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Tu nombre *</label>
            <input style={styles.input} value={form.nombre_cliente} onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })} placeholder="Ej: Juan Pérez" required maxLength={100} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>WhatsApp / Teléfono *</label>
            <input style={styles.input} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })} placeholder="Ej: 1155556666" required maxLength={20} inputMode="numeric" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Notas (opcional)</label>
            <textarea style={{ ...styles.input, resize: 'vertical', minHeight: '70px' }} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Dirección de entrega, aclaraciones..." maxLength={500} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Cupón de descuento</label>
            {cupon ? (
              <div style={styles.cuponAplicado}>
                <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '0.9rem' }}>
                  ✅ {codigoCupon.toUpperCase()} aplicado
                </span>
                <button type="button" style={styles.btnQuitarCupon} onClick={quitarCupon}>Quitar</button>
              </div>
            ) : (
              <div style={styles.cuponRow}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={codigoCupon}
                  onChange={(e) => { setCodigoCupon(e.target.value.toUpperCase()); setCuponError(''); }}
                  placeholder="Ej: GOLOSINAS10"
                />
                <button type="button" style={styles.btnAplicarCupon} onClick={aplicarCupon} disabled={validandoCupon || !codigoCupon.trim()}>
                  {validandoCupon ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
            {cuponError && <p style={{ ...styles.error, marginTop: '0.3rem' }}>{cuponError}</p>}
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.acciones}>
            <button style={styles.btnCancelar} type="button" onClick={onCancelar}>Volver</button>
            <button style={styles.btnEnviar} type="submit" disabled={loading}>
              {loading ? 'Enviando...' : '✅ Enviar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { background: 'white', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
  titulo: { fontSize: '1.3rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.25rem' },
  resumen: { background: '#f9fafb', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' },
  resumenItem: { display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#374151', padding: '0.3rem 0' },
  resumenTotal: { display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.6rem', marginTop: '0.4rem', color: '#7c3aed' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' },
  input: { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', boxSizing: 'border-box' },
  error: { color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' },
  acciones: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  btnCancelar: { flex: 1, padding: '0.75rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnEnviar: { flex: 2, padding: '0.75rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
  cuponRow: { display: 'flex', gap: '0.5rem' },
  btnAplicarCupon: { padding: '0.65rem 1rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap' },
  cuponAplicado: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' },
  btnQuitarCupon: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
};