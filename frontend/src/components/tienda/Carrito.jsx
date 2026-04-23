import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import CartHeader from './carrito/CartHeader';
import CartItems from './carrito/CartItems';
import CartTotal from './carrito/CartTotal';
import CartCheckout from './carrito/CartCheckout';
import S from './carrito/carritoStyles';

export default function Carrito({ isOpen, onClose, onConfirmar, productos }) {
  const { carrito, quitar, cambiarCantidad, total } = useCart();
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);
  const hasItems = carrito.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            style={S.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.aside
            key="panel"
            style={S.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <CartHeader totalItems={totalItems} onClose={onClose} />
            <CartItems
              carrito={carrito}
              productos={productos}
              onCambiar={cambiarCantidad}
              onQuitar={quitar}
            />
            {hasItems && (
              <>
                <CartTotal total={total} />
                <CartCheckout onClose={onClose} onConfirmar={onConfirmar} />
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
