import { test, expect } from '@playwright/test'

test('landing has pricing', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Tek sayfalık akıllı notlar')).toBeVisible()
  await expect(page.getByText('Monthly')).toBeVisible()
})
