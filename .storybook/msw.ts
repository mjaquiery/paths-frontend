import type { RequestHandler } from 'msw';

import { handlers as defaultHandlers } from '../src/mocks/handlers';

/**
 * msw-storybook-addon replaces (not merges) `parameters.msw.handlers` between
 * stories, so a bare array literal silently drops every default route it
 * doesn't repeat. Put story-specific handlers first (msw matches first-wins)
 * so anything not overridden still falls through to the project defaults.
 */
export function withDefaultHandlers(...overrides: RequestHandler[]): RequestHandler[] {
  return [...overrides, ...defaultHandlers];
}
