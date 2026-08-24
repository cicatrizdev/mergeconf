import { expect, test } from '@playwright/test'

test('grade mostra as sessões do dia', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Grade — 24 de outubro/ })).toBeVisible()
  await expect(page.getByText('O Deploy de Sexta: Ao Vivo')).toBeVisible()
  await expect(page.getByText('useEffect: Uma História de Terror')).toBeVisible()
})

test('navega para o detalhe de uma palestra', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Escalando o Monólito com Fé').click()
  await expect(page.getByRole('heading', { name: /Escalando o Monólito/ })).toBeVisible()
  await expect(page.getByText('Garanta sua vaga')).toBeVisible()
})
