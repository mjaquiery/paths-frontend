import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const messages = [];
page.on('console', (msg) =>
  messages.push('[' + msg.type() + '] ' + msg.text()),
);
page.on('pageerror', (err) => messages.push('[PAGEERROR] ' + err.message));
page.on('requestfailed', (req) =>
  messages.push(
    '[REQ_FAILED] ' +
      req.method() +
      ' ' +
      req.url() +
      ' ' +
      req.failure()?.errorText,
  ),
);

await page
  .goto(
    'http://localhost:6006/iframe.html?id=views-homeview--default&viewMode=story',
    {
      waitUntil: 'networkidle',
      timeout: 20000,
    },
  )
  .catch((e) => messages.push('[NAV_ERR] ' + e.message));

await page.waitForTimeout(3000);

console.log('=== CONSOLE MESSAGES ===');
for (const msg of messages) {
  console.log(msg);
}

await browser.close();
