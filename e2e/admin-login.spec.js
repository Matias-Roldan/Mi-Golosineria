const { test, expect } = require('@playwright/test');

test.describe('Admin – Login', () => {
  test('login exitoso redirige a /admin/dashboard', async ({ page }) => {
    // Arrange
    await page.goto('/admin/login');

    // Act
    await page.getByLabel('Email').fill('admin@migolosineria.com');
    await page.getByLabel('Contraseña').fill('admin1234');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Assert
    await expect(page).toHaveURL(/\/admin/);
  });

  test('credenciales incorrectas muestran mensaje de error', async ({ page }) => {
    // Arrange
    await page.goto('/admin/login');

    // Act
    await page.getByLabel('Email').fill('malo@ejemplo.com');
    await page.getByLabel('Contraseña').fill('claveincorrecta');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Assert
    await expect(
      page.getByText('Email o contraseña incorrectos')
    ).toBeVisible();
  });
});
