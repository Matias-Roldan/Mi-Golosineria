import { Badge } from '@/components/ui/badge';
import S from './carritoStyles';

export default function CartTotal({ total }) {
  return (
    <div style={S.totalArea}>
      <div style={S.shippingRow}>
        <span style={S.shippingLabel}>🚀 Envío en el día</span>
        <Badge style={S.shippingFree}>Gratis</Badge>
      </div>
      <div style={S.totalRow}>
        <span style={S.totalLabel}>Total</span>
        <span style={S.totalValue}>${Number(total).toLocaleString('es-AR')}</span>
      </div>
    </div>
  );
}
