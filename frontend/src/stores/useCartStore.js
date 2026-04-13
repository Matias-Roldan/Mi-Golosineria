import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      carrito: [],

      agregar: (producto) => {
        set((state) => {
          const existe = state.carrito.find((p) => p.id === producto.id);
          if (existe) {
            return {
              carrito: state.carrito.map((p) =>
                p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
              ),
            };
          }
          return { carrito: [...state.carrito, { ...producto, cantidad: 1 }] };
        });
      },

      quitar: (id) => {
        set((state) => ({
          carrito: state.carrito.filter((p) => p.id !== id),
        }));
      },

      cambiarCantidad: (id, cantidad) => {
        if (cantidad <= 0) return get().quitar(id);
        set((state) => ({
          carrito: state.carrito.map((p) => (p.id === id ? { ...p, cantidad } : p)),
        }));
      },

      vaciar: () => set({ carrito: [] }),
    }),
    {
      name: 'carrito',
    }
  )
);

export default useCartStore;
