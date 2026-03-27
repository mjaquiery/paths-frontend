import { test } from '@playwright/test';
test('check HomeView Default story console', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (msg) => messages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => messages.push(`[ERROR] ${err.message}`));
  await page.goto(
    'http://localhost:6006/iframe.html?id=views-homeview--default&viewMode=story',
  );
  await page.waitForTimeout(6000);
  for (const msg of messages) {
    console.log(msg);
  }
  console.log('--- PAGE HTML SNIPPET ---');
  const html = await page.content();
  console.log(html.substring(0, 2000));
});
