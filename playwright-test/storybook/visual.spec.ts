import { test, expect } from 'playwright/test';

const stories = [
  {
    name: 'home logged out',
    id: 'views-homeview--logged-out',
    screenshot: 'home-logged-out.png',
  },
  {
    name: 'path empty',
    id: 'views-pathview--empty',
    screenshot: 'path-empty.png',
  },
  {
    name: 'paths new default',
    id: 'views-pathcreateview--default',
    screenshot: 'paths-new-default.png',
  },
];

test.describe('storybook visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; }',
    });
  });

  for (const story of stories) {
    test(story.name, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForLoadState('networkidle');

      const root = page.locator('#storybook-root');
      await expect(root).toBeVisible();
      await expect(root).toHaveScreenshot(story.screenshot, {
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
});
