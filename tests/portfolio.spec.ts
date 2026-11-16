import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paths = [
  '',
  'about/',
  'experience/',
  'projects/',
  'projects/centurion/',
  'projects/fly-table-game/',
  'projects/neural-foundations/',
  'projects/tv-price-analysis/',
];

for (const path of paths) {
  test(`direct page access and accessibility: /${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(path ? `./${path}` : './');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const link of await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) {
      expect(link).not.toMatch(/^(undefined|null|#)$/);
      if (!link.startsWith('http') && !link.startsWith('#'))
        expect(link).toMatch(/^\/Portfolio_Website\//);
    }
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('interest explorer and persistent motion preference', async ({ page }) => {
  await page.goto('./');
  const ai = page.locator('[data-interest="1"]');
  await ai.click();
  await expect(ai).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#interest-description')).toContainText('Looking beneath the output');
  const motion = page.getByRole('button', { name: 'Motion: on', exact: true });
  await motion.click();
  await expect(page.locator('html')).toHaveClass(/reduce-motion/);
  await page.goto('./about/');
  await expect(page.getByRole('button', { name: 'Motion: off', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('project filters and detail navigation', async ({ page }) => {
  await page.goto('./projects/');
  await page.getByRole('button', { name: 'AI / ML', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(1);
  await expect(page.locator('[data-filter-count]')).toHaveText('1 project');
  await page.getByRole('link', { name: 'Neural Foundations', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Neural Foundations');
  await expect(page.locator('.scope-note')).toContainText('not a trained model');
  await page.getByRole('link', { name: 'ALL PROJECTS', exact: false }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(4);
});

test('keyboard navigation and small-screen menu', async ({ page }, testInfo) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  if (testInfo.project.name === 'mobile') {
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    await menu.click();
    await page.getByRole('navigation').getByRole('link', { name: 'My story' }).click();
    await expect(page.locator('h1')).toContainText('A curious mind.');
  }
});

test('reduced motion and JavaScript-free content', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await reduced.newPage();
  await page.goto(
    new URL('./', test.info().project.use.baseURL || 'http://localhost:4321/Portfolio_Website/')
      .href,
  );
  await expect(page.getByRole('button', { name: 'Motion: off', exact: true })).toBeVisible();
  await reduced.close();
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await noJS.newPage();
  await staticPage.goto('http://localhost:4321/Portfolio_Website/');
  await expect(staticPage.locator('h1')).toBeVisible();
  await expect(staticPage.getByRole('link', { name: 'Explore my work' })).toBeVisible();
  await expect(
    staticPage.getByRole('navigation').getByRole('link', { name: 'My story' }),
  ).toBeVisible();
  await noJS.close();
});
