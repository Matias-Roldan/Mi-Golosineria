import { beforeEach, describe, expect, it } from 'vitest';
import useCartStore from '../stores/useCartStore';

const P1 = { id: 1, nombre: 'Alfajor Triple', precio: 1500, stock: 10 };
const P2 = { id: 2, nombre: 'Chicle Bola', precio: 200, stock: 5 };

beforeEach(() => {
  useCartStore.setState({ carrito: [] });
});

describe('useCartStore – agregar', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    // Arrange: carrito vacío (reset en beforeEach)

    // Act
    useCartStore.getState().agregar(P1);

    // Assert
    const { carrito } = useCartStore.getState();
    expect(carrito).toHaveLength(1);
    expect(carrito[0]).toMatchObject({ id: 1, cantidad: 1 });
  });

  it('incrementa la cantidad si el producto ya existe en el carrito', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 1 }] });

    // Act
    useCartStore.getState().agregar(P1);

    // Assert
    const { carrito } = useCartStore.getState();
    expect(carrito).toHaveLength(1);
    expect(carrito[0].cantidad).toBe(2);
  });

  it('agrega un segundo producto distinto sin afectar el primero', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 1 }] });

    // Act
    useCartStore.getState().agregar(P2);

    // Assert
    const { carrito } = useCartStore.getState();
    expect(carrito).toHaveLength(2);
    expect(carrito.find((p) => p.id === 2)).toMatchObject({ cantidad: 1 });
  });
});

describe('useCartStore – quitar', () => {
  it('elimina el producto del carrito por id', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 2 }, { ...P2, cantidad: 1 }] });

    // Act
    useCartStore.getState().quitar(1);

    // Assert
    const { carrito } = useCartStore.getState();
    expect(carrito).toHaveLength(1);
    expect(carrito[0].id).toBe(2);
  });

  it('no lanza error si el id no existe en el carrito', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 1 }] });

    // Act & Assert
    expect(() => useCartStore.getState().quitar(999)).not.toThrow();
    expect(useCartStore.getState().carrito).toHaveLength(1);
  });
});

describe('useCartStore – cambiarCantidad', () => {
  it('actualiza la cantidad del producto indicado', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 1 }] });

    // Act
    useCartStore.getState().cambiarCantidad(1, 4);

    // Assert
    expect(useCartStore.getState().carrito[0].cantidad).toBe(4);
  });

  it('quita el producto cuando la nueva cantidad es 0', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 3 }] });

    // Act
    useCartStore.getState().cambiarCantidad(1, 0);

    // Assert
    expect(useCartStore.getState().carrito).toHaveLength(0);
  });

  it('quita el producto cuando la nueva cantidad es negativa', () => {
    // Arrange
    useCartStore.setState({ carrito: [{ ...P1, cantidad: 2 }] });

    // Act
    useCartStore.getState().cambiarCantidad(1, -1);

    // Assert
    expect(useCartStore.getState().carrito).toHaveLength(0);
  });
});

describe('useCartStore – vaciar', () => {
  it('elimina todos los productos del carrito', () => {
    // Arrange
    useCartStore.setState({
      carrito: [{ ...P1, cantidad: 2 }, { ...P2, cantidad: 1 }],
    });

    // Act
    useCartStore.getState().vaciar();

    // Assert
    expect(useCartStore.getState().carrito).toHaveLength(0);
  });
});
