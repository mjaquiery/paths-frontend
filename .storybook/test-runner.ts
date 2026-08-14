import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe } from 'axe-playwright';

// Ionic's ion-checkbox/ion-toggle/ion-radio render a native <input> inside their own
// shadow DOM, nested inside a host that itself carries role="checkbox"/"switch" +
// tabindex — Ionic's own accessible implementation, not an app-level bug. Axe's
// nested-interactive check crosses the shadow boundary and flags it regardless.
// Overriding the rule's `matches` via axe.configure() discards its default
// candidate-matching (interactive elements only) entirely, making it check nearly
// every element on the page — so the exemption is applied here instead, by
// dropping just the Ionic-host nodes from the violation before asserting.
const IONIC_FORM_CONTROLS = ['ION-CHECKBOX', 'ION-TOGGLE', 'ION-RADIO'];

// Timeout is set via --testTimeout on the CLI (see package.json) — this version of
// @storybook/test-runner runs on Playwright Test, which has no `jest` global to call
// jest.setTimeout() on.
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    // Ionic overlay enter/exit transitions are disabled for Storybook (see preview.ts —
    // `animated: false`), so there's no in-flight transition to wait out here anymore.
    // This is just a small buffer for the resulting DOM/style updates to flush.
    await page.waitForTimeout(100);
    // Scan the whole document, not just #storybook-root — ion-modal content
    // (PathFormModal, PathShareModal, PathDeleteModal, ...) teleports outside
    // the story root via Vue's <Teleport>, so scoping to the root would skip it.
    const results = await page.evaluate(async (ionicFormControls) => {
      // @ts-expect-error injected by axe-playwright
      const raw = await window.axe.run(document, {
        rules: { region: { enabled: false } },
      });
      return raw.violations
        .map((violation: { id: string; nodes: { html: string }[] }) => ({
          ...violation,
          nodes: violation.nodes.filter((node) => {
            if (violation.id !== 'nested-interactive') return true;
            return !ionicFormControls.some((tag: string) =>
              node.html.toUpperCase().startsWith(`<${tag}`),
            );
          }),
        }))
        .filter(
          (violation: { nodes: unknown[] }) => violation.nodes.length > 0,
        );
    }, IONIC_FORM_CONTROLS);

    if (results.length > 0) {
      const summary = results
        .map(
          (v: {
            id: string;
            impact: string;
            nodes: { target: unknown; failureSummary?: string }[];
          }) =>
            `${v.id} (${v.impact}): ${v.nodes
              .map((n) => `${JSON.stringify(n.target)} :: ${n.failureSummary}`)
              .join(', ')}`,
        )
        .join('\n');
      throw new Error(`Accessibility violations detected:\n${summary}`);
    }
  },
};

export default config;
