import { expect, waitFor, within } from '@storybook/test';

import { storybookRouter } from './storySupport';

function normalizeText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

export function withinStoryDocument(canvasElement: HTMLElement) {
  return within(canvasElement.ownerDocument.body);
}

export function findElementsByText(
  root: ParentNode,
  selector: string,
  text: string,
) {
  const expected = normalizeText(text);
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => normalizeText(element.textContent) === expected,
  );
}

export function findElementByText(
  root: ParentNode,
  selector: string,
  text: string,
) {
  const element = findElementsByText(root, selector, text)[0] ?? null;

  if (!element) {
    throw new Error(`Could not find ${selector} with text "${text}".`);
  }

  return element;
}

export async function expectRoute(path: string) {
  await waitFor(() => {
    expect(storybookRouter.currentRoute.value.fullPath).toBe(path);
  });
}
