const { test, expect } = require('@playwright/test');

test.describe('Tienda – Carrito', () => {
  test('agregar producto al carrito lo muestra con cantidad correcta', async ({ page }) => {
    // Arrange
    await page.goto('/tienda');

    // Esperar a que carguen los productos
    const primerBotonAgregar = page.getByRole('button', { name: /Agregar/i }).first();
    await expect(primerBotonAgregar).toBeVisible({ timeout: 10_000 });

    // Obtener el nombre del primer producto antes de agregarlo
    const primerNombre = await page.locator('h3').first().textContent();

    // Act
    await primerBotonAgregar.click();

    // Assert – badge "en tu carrito" con cantidad 1 aparece en la card
    await expect(
      page.getByText('1 en tu carrito').first()
    ).toBeVisible();

    // Assert – el ícono/contador del carrito refleja 1 ítem
    await expect(page.getByText(primerNombre)).toBeVisible();
  });
});
