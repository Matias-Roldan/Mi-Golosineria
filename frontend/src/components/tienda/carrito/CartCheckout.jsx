import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import S from './carritoStyles';

export default function CartCheckout({ onClose, onConfirmar }) {
  return (
    <div style={S.ctaArea}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Button
          style={S.btnConfirmar}
          onClick={() => { onClose(); onConfirmar(); }}
        >
          <span>Confirmar pedido</span>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
        </Button>
      </motion.div>
    </div>
  );
}
