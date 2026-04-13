import useCartStore from '../stores/useCartStore';

export const useCart = () => {
  const carrito = useCartStore((s) => s.carrito);
  const agregar = useCartStore((s) => s.agregar);
  const quitar = useCartStore((s) => s.quitar);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  return { carrito, agregar, quitar, cambiarCantidad, vaciar, total };
};
