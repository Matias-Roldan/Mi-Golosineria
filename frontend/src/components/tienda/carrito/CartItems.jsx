import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import CartItem from './CartItem';
import S from './carritoStyles';

function EmptyCart() {
  return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>🛒</div>
      <div style={S.emptyTitle}>Tu carrito está vacío</div>
      <div style={S.emptySub}>Explorá los productos y agregá tus favoritos</div>
    </div>
  );
}

export default function CartItems({ carrito, productos, onCambiar, onQuitar }) {
  if (carrito.length === 0) return <EmptyCart />;

  return (
    <ScrollArea style={S.items}>
      <AnimatePresence initial={false}>
        {carrito.map((p) => {
          const stockOriginal = productos?.find((prod) => prod.id === p.id)?.stock ?? p.stock ?? 99;
          return (
            <CartItem
              key={p.id}
              item={p}
              stockOriginal={stockOriginal}
              onCambiar={onCambiar}
              onQuitar={onQuitar}
            />
          );
        })}
      </AnimatePresence>
    </ScrollArea>
  );
}
