import { expect, test, type Page } from '@playwright/test'

async function openFormEditor(page: Page) {
  const workspaceToggle = page.getByRole('button', { name: /^Form$/ })
  if (await workspaceToggle.count()) {
    await workspaceToggle.click()
  }
  await expect(page.locator('[data-testid="action-type-select"]')).toBeVisible()
}

test('processes the default access token request from the JSON editor', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Asgardeo Actions Playground')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'JSON Editor' })).toBeVisible()

  await page.getByRole('button', { name: 'Run' }).click()

  await expect(page.getByTestId('response-status')).toHaveText('SUCCESS')
  await expect(page.getByText('Access Token Breakdown')).toBeVisible()
  await expect(page.getByTestId('response-json')).toContainText('"actionStatus": "SUCCESS"')
  await expect(page.getByTestId('response-json')).toContainText('"accessToken"')
})

test('processes a password update request from the form editor', async ({ page }) => {
  await page.goto('/')
  await openFormEditor(page)

  await page.locator('[data-testid="action-type-select"]').selectOption('PRE_UPDATE_PASSWORD')
  await expect(page.getByRole('heading', { name: 'Password Update' })).toBeVisible()

  await page.getByRole('button', { name: 'Process' }).click()

  await expect(page.getByTestId('response-status')).toHaveText('SUCCESS')
  await expect(page.getByText('Password Update Details')).toBeVisible()
  await expect(page.getByTestId('response-json')).toContainText('"format": "PLAIN_TEXT"')
})

test('processes a profile update request from the form editor', async ({ page }) => {
  await page.goto('/')
  await openFormEditor(page)

  await page.locator('[data-testid="action-type-select"]').selectOption('PRE_UPDATE_PROFILE')
  await expect(page.getByRole('heading', { name: 'Profile Update' })).toBeVisible()

  await page.getByRole('button', { name: 'Process' }).click()

  await expect(page.getByTestId('response-status')).toHaveText('SUCCESS')
  await expect(page.getByText('Profile Update Details')).toBeVisible()
  await expect(page.getByTestId('response-json')).toContainText('"updatingValue": "Johnny"')
})

test('shows a JSON editor validation error for invalid payloads', async ({ page }) => {
  await page.goto('/')

  const editor = page.locator('textarea')
  await editor.fill('{ invalid json')

  await page.getByRole('button', { name: 'Run' }).click()

  await expect(page.getByText('Invalid JSON - please check syntax before sending.')).toBeVisible()
  await expect(page.getByTestId('response-status')).toHaveCount(0)
})
