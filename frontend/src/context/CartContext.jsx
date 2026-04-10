import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    try {
      const saved = localStorage.getItem('carrito');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregar = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitar = (id) => setCarrito((prev) => prev.filter((p) => p.id !== id));

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) return quitar(id);
    setCarrito((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad } : p))
    );
  };

  const vaciar = () => setCarrito([]);

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return (
    <CartContext.Provider value={{ carrito, agregar, quitar, cambiarCantidad, vaciar, total }}>
      {children}
    </CartContext.Provider>
  );
}
