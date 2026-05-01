import type { TestRunnerConfig } from '@storybook/test-runner';
import { waitForPageReady } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const a11yStoryIds = new Set([
  'views-pathcreateview--default',
  'views-pathview--empty',
]);

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },

  async postVisit(page, context) {
    await waitForPageReady(page);

    if (!a11yStoryIds.has(context.id)) {
      return;
    }

    await checkA11y(page, 'body', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    });
  },
};

export default config;
