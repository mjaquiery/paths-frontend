import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

// Generous timeout: CI runners are typically far less resource-contended than a local dev
// machine, but this keeps a slow story render from flaking the suite either way.
const config: TestRunnerConfig = {
  setup() {
    jest.setTimeout(60000);
  },
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    // Scan the whole document, not just #storybook-root — ion-modal content
    // (PathFormModal, PathShareModal, PathDeleteModal, ...) teleports outside
    // the story root via Vue's <Teleport>, so scoping to the root would skip it.
    // skipFailures: false — a11y violations fail the test-storybook run
    // instead of only showing as warnings in the addon-a11y panel.
    await checkA11y(page, undefined, {
      // Matches addon-a11y's own default (it disables 'region' in the panel) —
      // an isolated component/page story is never wrapped in page landmarks,
      // so this rule is a structural false positive at the story level.
      axeOptions: { rules: { region: { enabled: false } } },
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
