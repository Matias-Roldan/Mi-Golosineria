import { Button } from '@/components/ui/button';
import S from './carritoStyles';

export default function CartHeader({ totalItems, onClose }) {
  return (
    <div style={S.panelHeader}>
      <div style={S.panelHeaderLeft}>
        <span style={S.panelIcon}>🛒</span>
        <div>
          <div style={S.panelTitle}>Tu pedido</div>
          {totalItems > 0 && (
            <div style={S.panelSub}>
              {totalItems} producto{totalItems !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        style={S.closeBtn}
        onClick={onClose}
        title="Cerrar"
      >
        ✕
      </Button>
    </div>
  );
}
