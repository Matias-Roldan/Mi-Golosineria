import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProductoCard from '../components/tienda/ProductoCard';

// ── Mocks ────────────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style }) => <div style={style}>{children}</div>,
    img: ({ style, alt, src, onError }) => (
      <img style={style} alt={alt} src={src} onError={onError} />
    ),
    button: ({ children, style, onClick, disabled }) => (
      <button style={style} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
  },
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, style }) => <div style={style}>{children}</div>,
  CardContent: ({ children, style }) => <div style={style}>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, style }) => <span style={style}>{children}</span>,
}));

const mockAgregar = vi.hoisted(() => vi.fn());

vi.mock('../hooks/useCart', () => ({
  useCart: () => ({
    agregar: mockAgregar,
    carrito: [],
  }),
}));

// ── Fixtures ─────────────────────────────────────────────────────────

const productoBase = {
  id: 1,
  nombre: 'Alfajor Triple',
  precio: 1500,
  stock: 10,
  categoria: 'Chocolates',
  descripcion: 'Relleno de dulce de leche',
  imagen_url: null,
};

// ── Tests ─────────────────────────────────────────────────────────────

describe('ProductoCard', () => {
  beforeEach(() => {
    mockAgregar.mockClear();
  });

  it('renderiza el nombre del producto', () => {
    // Arrange & Act
    render(<ProductoCard producto={productoBase} />);

    // Assert
    expect(screen.getByText('Alfajor Triple')).toBeInTheDocument();
  });

  it('renderiza el precio formateado en pesos argentinos', () => {
    // Arrange & Act
    render(<ProductoCard producto={productoBase} />);

    // Assert — 1500 en es-AR se formatea como "1.500"
    expect(screen.getByText(/1\.500/)).toBeInTheDocument();
  });

  it('el botón Agregar llama a agregar() con el producto correcto', () => {
    // Arrange
    render(<ProductoCard producto={productoBase} />);
    const btn = screen.getByRole('button');

    // Act
    fireEvent.click(btn);

    // Assert
    expect(mockAgregar).toHaveBeenCalledTimes(1);
    expect(mockAgregar).toHaveBeenCalledWith(productoBase);
  });

  it('el botón está deshabilitado cuando stock es 0', () => {
    // Arrange
    render(<ProductoCard producto={{ ...productoBase, stock: 0 }} />);

    // Assert
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('no llama a agregar() al hacer click cuando no hay stock', () => {
    // Arrange
    render(<ProductoCard producto={{ ...productoBase, stock: 0 }} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(mockAgregar).not.toHaveBeenCalled();
  });
});
