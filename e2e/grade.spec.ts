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

test.describe('grade no mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('não tem overflow horizontal e card é clicável', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Grade — 24 de outubro/ })).toBeVisible()

    const semOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    )
    expect(semOverflow).toBe(true)

    const card = page.getByText('Escalando o Monólito com Fé')
    await expect(card).toBeVisible()
    await card.click()
    await expect(page.getByRole('heading', { name: /Escalando o Monólito/ })).toBeVisible()
  })
})
