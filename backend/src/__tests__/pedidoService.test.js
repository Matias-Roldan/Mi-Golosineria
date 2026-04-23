jest.mock('../repositories/pedidoRepository');

const pedidoRepo = require('../repositories/pedidoRepository');
const pedidoService = require('../services/pedidoService');

const DATOS_VALIDOS = {
  nombre_cliente: 'Juan Perez',
  telefono: '1134567890',
  notas: null,
  items: [{ id: 1, cant: 2 }],
  cupon: null,
};

describe('pedidoService.registrar', () => {
  beforeEach(() => {
    pedidoRepo.registrar.mockResolvedValue(42);
  });

  // ── Caso feliz ──────────────────────────────────────────────────────

  it('llama al repositorio y devuelve el id cuando los datos son válidos', async () => {
    // Arrange: datos ya definidos en DATOS_VALIDOS

    // Act
    const resultado = await pedidoService.registrar(DATOS_VALIDOS);

    // Assert
    expect(pedidoRepo.registrar).toHaveBeenCalledTimes(1);
    expect(pedidoRepo.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre_cliente: 'Juan Perez',
        telefono: '1134567890',
        itemsJson: JSON.stringify(DATOS_VALIDOS.items),
      })
    );
    expect(resultado).toBe(42);
  });

  // ── Items vacíos ────────────────────────────────────────────────────

  it('lanza AppError 400 cuando items está vacío', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, items: [] };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      message: 'Items inválidos',
      status: 400,
    });
    expect(pedidoRepo.registrar).not.toHaveBeenCalled();
  });

  it('lanza AppError 400 cuando items no es un array', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, items: null };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      status: 400,
    });
  });

  // ── Cantidad inválida ───────────────────────────────────────────────

  it('lanza AppError 400 cuando la cantidad de un item es 0', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, items: [{ id: 1, cant: 0 }] };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      message: 'Cantidad inválida en items',
      status: 400,
    });
  });

  it('lanza AppError 400 cuando la cantidad de un item es negativa', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, items: [{ id: 1, cant: -5 }] };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      message: 'Cantidad inválida en items',
      status: 400,
    });
  });

  // ── Teléfono inválido ───────────────────────────────────────────────

  it('lanza AppError 400 cuando el teléfono tiene letras', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, telefono: 'hola123' };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      message: expect.stringContaining('Teléfono inválido'),
      status: 400,
    });
  });

  it('lanza AppError 400 cuando el teléfono tiene menos de 7 dígitos', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, telefono: '12345' };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      message: expect.stringContaining('Teléfono inválido'),
      status: 400,
    });
  });

  it('lanza AppError 400 cuando el teléfono está vacío', async () => {
    // Arrange
    const datos = { ...DATOS_VALIDOS, telefono: '' };

    // Act & Assert
    await expect(pedidoService.registrar(datos)).rejects.toMatchObject({
      status: 400,
    });
  });

  // ── Errores del repositorio ─────────────────────────────────────────

  it('convierte errores MySQL SQLSTATE 45000 a AppError 400', async () => {
    // Arrange
    const dbError = Object.assign(new Error('Stock insuficiente'), {
      sqlState: '45000',
      sqlMessage: 'Stock insuficiente',
    });
    pedidoRepo.registrar.mockRejectedValue(dbError);

    // Act & Assert
    await expect(pedidoService.registrar(DATOS_VALIDOS)).rejects.toMatchObject({
      message: 'Stock insuficiente',
      status: 400,
    });
  });

  it('relanza errores desconocidos del repositorio sin modificarlos', async () => {
    // Arrange
    const dbError = new Error('connection refused');
    pedidoRepo.registrar.mockRejectedValue(dbError);

    // Act & Assert
    await expect(pedidoService.registrar(DATOS_VALIDOS)).rejects.toThrow('connection refused');
  });
});
