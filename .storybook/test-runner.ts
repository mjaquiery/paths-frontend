import type { TestRunnerConfig } from '@storybook/test-runner';

// Generous timeout: CI runners are typically far less resource-contended than a local dev
// machine, but this keeps a slow story render from flaking the suite either way.
const config: TestRunnerConfig = {
  setup() {
    jest.setTimeout(60000);
  },
};

export default config;
