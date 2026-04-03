import { IonicVue, IonApp } from '@ionic/vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { createRouter } from '@ionic/vue-router';
import { createMemoryHistory } from 'vue-router';
import { HttpResponse, http } from 'msw';
import { setup } from '@storybook/vue3';
import { computed, watchEffect } from 'vue';

import type {
  BlocklistEntryResponse,
  DownloadURLResponse,
  DraftImageResponse,
  DraftImageSlotResponse,
  EntryContentResponse,
  EntryDraftResponse,
  EntryResponse,
  ExportJobResponse,
  ImageDownloadResponse,
  ImageResponse,
  InvitationResponse,
  OAuthCallbackResponse,
  PathResponse,
  SubscriberResponse,
} from '../generated/types';
import {
  getGetEntryQueryKey,
  getListBlocklistQueryKey,
  getListEntriesQueryKey,
  getListEntryImagesQueryKey,
  getListInvitationsQueryKey,
  getListPathsQueryKey,
  getListSubscriptionsQueryKey,
} from '../generated/apiClient';
import type { PathEntries } from '../composables/useMultiPathEntries';
import type { EntryDetailData } from '../components/EntryDetailModal.vue';
import { db } from '../lib/db';

const STORYBOOK_NOW_ISO = '2025-03-15T12:00:00.000Z';
const STORYBOOK_NOW = new Date(STORYBOOK_NOW_ISO);
const STORYBOOK_TOKEN = 'storybook-session-token';
const ZIP_DATA_URL =
  'data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==';
const STORYBOOK_DARK_MODE_KEY = 'darkModePreference';

type StoryColorMode = 'light' | 'dark' | 'system';
type StoryNetworkMode = 'online' | 'offline';
type StoryRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL';

export interface StoryEntryRecord {
  summary: EntryResponse;
  content: string;
  images: ImageResponse[];
}

export interface StoryState {
  currentUser: OAuthCallbackResponse | null;
  paths: PathResponse[];
  entriesByPath: Record<string, StoryEntryRecord[]>;
  invitations: InvitationResponse[];
  blocklist: BlocklistEntryResponse[];
  subscriptionsByPath: Record<string, SubscriberResponse[]>;
  authLoginUrl: string;
  deletionRequest?: {
    state: 'requested' | 'running' | 'complete' | 'failed';
    error_message?: string | null;
  } | null;
}

export interface StoryRequestOverride {
  method?: StoryRequestMethod;
  path: string;
  status?: number;
  body?: unknown;
  networkError?: boolean;
}

const DummyRoute = { template: '<div />' };

export const storybookUser: OAuthCallbackResponse = {
  token: STORYBOOK_TOKEN,
  user_id: 'user-alpha',
  display_name: 'Alex Rivers',
};

export const storybookPaths = {
  daily: createStoryPath({
    path_id: 'daily-river',
    owner_user_id: storybookUser.user_id,
    title: 'Daily River',
    description: 'The ordinary details: weather, meals, conversations.',
    color: '#2B6CB0',
  }),
  studio: createStoryPath({
    path_id: 'studio-notes',
    owner_user_id: storybookUser.user_id,
    title: 'Studio Notes',
    description: 'Product work, release prep, and half-finished ideas.',
    color: '#D97706',
  }),
  shared: createStoryPath({
    path_id: 'family-trip',
    owner_user_id: 'user-bravo',
    title: 'Family Trip',
    description: 'Shared plans, tickets, and travel photos.',
    color: '#15803D',
  }),
};

const sunriseImage = createImage({
  id: 'img-sunrise-river',
  entry_id: 'entry-daily-today',
  filename: 'sunrise-river.jpg',
  content_type: 'image/jpeg',
  byte_size: 310_442,
});

const whiteboardImage = createImage({
  id: 'img-whiteboard',
  entry_id: 'entry-studio-today',
  filename: 'whiteboard-plan.png',
  content_type: 'image/png',
  byte_size: 198_204,
});

const ticketImage = createImage({
  id: 'img-train-ticket',
  entry_id: 'entry-shared-yesterday',
  filename: 'train-ticket.webp',
  content_type: 'image/webp',
  byte_size: 144_120,
});

const defaultEntriesByPath: Record<string, StoryEntryRecord[]> = {
  [storybookPaths.daily.path_id]: [
    createStoryEntry({
      id: 'entry-daily-today',
      path_id: storybookPaths.daily.path_id,
      day: storyDateOffset(0),
      edit_id: 41,
      content: [
        'Swam before sunrise and the river was glassy quiet.',
        '',
        '![Sunrise over the river](sunrise-river.jpg)',
        '',
        'Picked up oranges on the walk back and cooked lentil soup for dinner.',
      ].join('\n'),
      images: [sunriseImage],
    }),
    createStoryEntry({
      id: 'entry-daily-yesterday',
      path_id: storybookPaths.daily.path_id,
      day: storyDateOffset(-1),
      edit_id: 40,
      content:
        'Heavy rain all afternoon. Stayed in, finished a chapter, and answered old messages.',
    }),
    createStoryEntry({
      id: 'entry-daily-last-year',
      path_id: storybookPaths.daily.path_id,
      day: storyDateYearsAgo(1),
      edit_id: 32,
      content:
        'Same date, different weather. The first daffodils finally opened along the fence.',
    }),
    createStoryEntry({
      id: 'entry-daily-two-years',
      path_id: storybookPaths.daily.path_id,
      day: storyDateYearsAgo(2),
      edit_id: 19,
      content: 'Cleaned the kitchen radio and played Nina Simone all evening.',
    }),
  ],
  [storybookPaths.studio.path_id]: [
    createStoryEntry({
      id: 'entry-studio-today',
      path_id: storybookPaths.studio.path_id,
      day: storyDateOffset(0),
      edit_id: 14,
      content: [
        'Closed the export polling loop and cut a beta build.',
        '',
        'Need one more pass on the failure copy before release.',
        '',
        '![Release checklist](whiteboard-plan.png)',
      ].join('\n'),
      images: [whiteboardImage],
    }),
    createStoryEntry({
      id: 'entry-studio-thursday',
      path_id: storybookPaths.studio.path_id,
      day: storyDateOffset(-2),
      edit_id: 12,
      content:
        'Reviewed the onboarding copy with support and trimmed the empty states.',
    }),
    createStoryEntry({
      id: 'entry-studio-last-year',
      path_id: storybookPaths.studio.path_id,
      day: storyDateYearsAgo(1),
      edit_id: 4,
      content:
        'Sketched the first Paths wireframes on paper and kept the container model to a single Path.',
    }),
  ],
  [storybookPaths.shared.path_id]: [
    createStoryEntry({
      id: 'entry-shared-yesterday',
      path_id: storybookPaths.shared.path_id,
      day: storyDateOffset(-1),
      edit_id: 7,
      content: [
        'Uploaded the train tickets and shared the arrival window with Eli.',
        '',
        '![Train ticket](train-ticket.webp)',
      ].join('\n'),
      images: [ticketImage],
    }),
    createStoryEntry({
      id: 'entry-shared-last-year',
      path_id: storybookPaths.shared.path_id,
      day: storyDateYearsAgo(1),
      edit_id: 2,
      content: 'Booked the apartment with the tiny balcony near the station.',
    }),
  ],
};

const defaultInvitations: InvitationResponse[] = [
  {
    id: 'invitation-pending-1',
    path_id: 'path-invite-1',
    path_code: 'book-club',
    path_title: 'Book Club Notes',
    inviter_user_id: 'user-charlie',
    inviter_email: 'charlie@example.com',
    invited_email: 'alex@example.com',
    invited_user_id: null,
    status: 'invited',
    created_at: storyTimestampOffset(-3),
    updated_at: storyTimestampOffset(-3),
  },
  {
    id: 'invitation-ignored-1',
    path_id: 'path-invite-2',
    path_code: 'garden-log',
    path_title: 'Garden Log',
    inviter_user_id: 'user-delta',
    inviter_email: 'delta@example.com',
    invited_email: 'alex@example.com',
    invited_user_id: null,
    status: 'ignored',
    created_at: storyTimestampOffset(-10),
    updated_at: storyTimestampOffset(-2),
  },
];

const defaultBlocklist: BlocklistEntryResponse[] = [
  {
    id: 'blocked-1',
    blocked_user_id: 'user-echo',
    created_at: storyTimestampOffset(-20),
  },
];

const defaultSubscriptionsByPath: Record<string, SubscriberResponse[]> = {
  [storybookPaths.daily.path_id]: [
    {
      user_id: 'user-foxtrot',
      email: 'foxtrot@example.com',
      display_name: 'Morgan Lee',
    },
    {
      user_id: 'user-golf',
      email: 'golf@example.com',
      display_name: 'Priya Shah',
    },
  ],
  [storybookPaths.studio.path_id]: [],
};

export const storybookQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const storybookRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: DummyRoute },
    { path: '/auth/callback', component: DummyRoute },
    { path: '/export', component: DummyRoute },
    { path: '/delete', component: DummyRoute },
    { path: '/invitations', component: DummyRoute },
    { path: '/date/:date', component: DummyRoute },
    { path: '/path/:pathId', component: DummyRoute },
    { path: '/entry/new', component: DummyRoute },
    { path: '/entry/:pathId/new', component: DummyRoute },
    { path: '/entry/:pathId/:entryId', component: DummyRoute },
    { path: '/entry/:pathId/:entryId/edit', component: DummyRoute },
    { path: '/paths/new', component: DummyRoute },
  ],
});

installDeterministicDate();
installMatchMediaStub();
installNavigatorOnlineStub();

setup((app) => {
  app.use(IonicVue, { mode: 'md' });
  app.use(VueQueryPlugin, { queryClient: storybookQueryClient });
  app.use(storybookRouter);
});

export function createPopulatedState(
  overrides: Partial<StoryState> = {},
): StoryState {
  return {
    currentUser: storybookUser,
    paths: [storybookPaths.daily, storybookPaths.studio, storybookPaths.shared],
    entriesByPath: cloneEntriesByPath(defaultEntriesByPath),
    invitations: clone(defaultInvitations),
    blocklist: clone(defaultBlocklist),
    subscriptionsByPath: clone(defaultSubscriptionsByPath),
    authLoginUrl:
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=storybook&state=storybook',
    ...overrides,
  };
}

export function createEmptyState(
  overrides: Partial<StoryState> = {},
): StoryState {
  const base = createPopulatedState({
    invitations: [],
    blocklist: [],
    subscriptionsByPath: {
      [storybookPaths.daily.path_id]: [],
      [storybookPaths.studio.path_id]: [],
    },
  });

  return {
    ...base,
    entriesByPath: Object.fromEntries(
      base.paths.map((path) => [path.path_id, [] as StoryEntryRecord[]]),
    ),
    ...overrides,
  };
}

export function buildPathEntries(
  state: StoryState,
  pathIds: string[] = state.paths.map((path) => path.path_id),
): PathEntries[] {
  return pathIds.map((pathId) => ({
    pathId,
    entries: (state.entriesByPath[pathId] ?? []).map((record) => ({
      ...record.summary,
      content: record.content,
      image_filenames: record.images.map((image) => image.filename),
      images: record.images,
    })),
  }));
}

export function buildEntryDetail(
  state: StoryState,
  entryId: string,
): EntryDetailData {
  const match = findEntryRecord(state, entryId);
  if (!match) {
    throw new Error(`Story entry "${entryId}" was not found.`);
  }

  const path = state.paths.find((item) => item.path_id === match.pathId);
  if (!path) {
    throw new Error(`Story path "${match.pathId}" was not found.`);
  }

  const canEdit =
    !!state.currentUser && path.owner_user_id === state.currentUser.user_id;

  return {
    pathId: match.pathId,
    entryId: match.record.summary.id,
    pathTitle: path.title,
    color: path.color,
    day: match.record.summary.day,
    content: match.record.content,
    hasImages: match.record.images.length > 0,
    images: match.record.images,
    edit_id: match.record.summary.edit_id,
    canEdit,
  };
}

export function buildEntryDetailsForPath(
  state: StoryState,
  pathId: string,
): EntryDetailData[] {
  return (state.entriesByPath[pathId] ?? []).map((record) =>
    buildEntryDetail(state, record.summary.id),
  );
}

export function createStoryParameters(
  options: {
    state?: StoryState;
    route?: string;
    sessionUser?: OAuthCallbackResponse | null;
    hiddenPathIds?: string[];
    pathOrder?: string[];
    networkMode?: StoryNetworkMode;
    seedCacheFromState?: boolean;
    requestOverrides?: StoryRequestOverride[];
  } = {},
) {
  const state = options.state ?? createPopulatedState();

  return {
    route: options.route ?? '/',
    sessionUser: options.sessionUser ?? state.currentUser,
    hiddenPathIds: options.hiddenPathIds ?? [],
    pathOrder: options.pathOrder ?? state.paths.map((path) => path.path_id),
    networkMode: options.networkMode ?? 'online',
    seedCacheFromState: options.seedCacheFromState ?? false,
    requestOverrides: options.requestOverrides ?? [],
    storyState: state,
    msw: {
      handlers: createMockHandlers(state, options.requestOverrides ?? []),
    },
  };
}

export async function prepareStoryEnvironment(context: {
  parameters?: Record<string, unknown>;
  globals?: Record<string, unknown>;
}) {
  const params = context.parameters ?? {};
  const globals = context.globals ?? {};
  const route = typeof params.route === 'string' ? params.route : '/';
  const sessionUser =
    (params.sessionUser as OAuthCallbackResponse | null | undefined) ?? null;
  const hiddenPathIds = Array.isArray(params.hiddenPathIds)
    ? (params.hiddenPathIds as string[])
    : [];
  const pathOrder = Array.isArray(params.pathOrder)
    ? (params.pathOrder as string[])
    : [];
  const networkMode =
    params.networkMode === 'offline' ? 'offline' : ('online' as const);
  const seedCacheFromState = Boolean(params.seedCacheFromState);
  const colorMode = normalizeStoryColorMode(globals.colorMode);
  const state = (params.storyState as StoryState | undefined) ?? null;

  storybookQueryClient.clear();
  clearSessionStorage();
  await clearStoryDatabase();

  if (pathOrder.length > 0) {
    localStorage.setItem('pathOrder', JSON.stringify(pathOrder));
  }

  if (seedCacheFromState && state) {
    await seedStoryCache(state);
  }

  for (const pathId of hiddenPathIds) {
    await db.pathPreferences.put({ pathId, hidden: true });
  }

  if (sessionUser) {
    localStorage.setItem(
      'user',
      JSON.stringify({
        user_id: sessionUser.user_id,
        display_name: sessionUser.display_name,
      }),
    );
    localStorage.setItem('session_token', sessionUser.token);
  }

  applyStorybookColorMode(colorMode);
  applyStorybookNetworkMode(networkMode);

  // Wait for the router's initial navigation to finish before navigating.
  // Without this, isReady() hangs if the current route already matches the
  // target route and the initial navigation has not yet been completed.
  await Promise.race([
    storybookRouter.isReady(),
    new Promise<void>((resolve) => setTimeout(resolve, 500)),
  ]);

  if (storybookRouter.currentRoute.value.fullPath !== route) {
    await storybookRouter.replace(route);
  }

  return {};
}

export const withStorybookChrome = (
  story: () => unknown,
  context: { title?: string; globals?: Record<string, unknown> },
) => {
  ensureStorybookChromeStyles();
  const isViewStory = context.title?.startsWith('Views/') ?? false;

  return {
    components: { StoryComponent: story(), IonApp },
    setup() {
      const colorMode = computed(() =>
        normalizeStoryColorMode(context.globals?.colorMode),
      );

      watchEffect(() => {
        applyStorybookColorMode(colorMode.value);
      });

      return { isViewStory, colorMode };
    },
    template: isViewStory
      ? `
        <ion-app class="sb-story-root" :data-color-mode="colorMode">
          <div class="sb-phone-stage">
            <div class="sb-phone-frame" :data-color-mode="colorMode">
              <div class="sb-phone-speaker" aria-hidden="true"></div>
              <div class="sb-phone-screen">
                <StoryComponent />
              </div>
            </div>
          </div>
        </ion-app>
      `
      : '<ion-app class="sb-story-root" :data-color-mode="colorMode"><StoryComponent /></ion-app>',
  };
};

function createMockHandlers(
  inputState: StoryState,
  requestOverrides: StoryRequestOverride[] = [],
) {
  const state = clone(inputState);
  const exportPolls: Record<string, number> = {};
  const exportRequests: Record<string, string[]> = {};

  // ─── Draft store ────────────────────────────────────────────────────────
  // Keyed by draft id string. Tracks in-progress draft state for both create
  // and edit flows.
  interface StorybookDraft {
    id: string;
    mode: 'create' | 'edit';
    pathId: string;
    entryId: string | null;
    day: string;
    content: string;
    based_on_edit_id: number | null;
    images: DraftImageResponse[];
    state: 'open' | 'committed';
  }

  // Index: `create:${pathId}:${day}` or `edit:${pathId}:${entryId}` → draftId
  const draftIndex = new Map<string, string>();
  const drafts = new Map<string, StorybookDraft>();

  // Pending draft image uploads: draftImageId → slot info
  interface PendingDraftUpload {
    draftId: string;
    filename: string;
    contentType: string | null;
    stripMetadata: boolean;
    clientImageId: string | null;
  }
  const pendingDraftUploads = new Map<string, PendingDraftUpload>();
  let draftCounter = 0;
  let draftImageCounter = 0;

  function makeDraftResponse(draft: StorybookDraft): EntryDraftResponse {
    return {
      id: draft.id,
      mode: draft.mode,
      state: draft.state,
      path_id: draft.pathId,
      entry_id: draft.entryId,
      day: draft.day,
      content: draft.content,
      based_on_edit_id: draft.based_on_edit_id,
      images: draft.images,
      expires_at: storyTimestampOffset(1),
    };
  }

  function getOrCreateDraft(
    key: string,
    init: () => StorybookDraft,
  ): StorybookDraft {
    const existingId = draftIndex.get(key);
    if (existingId) {
      const existing = drafts.get(existingId);
      if (existing && existing.state === 'open') return existing;
    }
    const draft = init();
    drafts.set(draft.id, draft);
    draftIndex.set(key, draft.id);
    return draft;
  }

  return [
    ...createOverrideHandlers(requestOverrides),
    http.get('*/v1/paths', () =>
      HttpResponse.json(state.paths, { status: 200 }),
    ),
    http.post('*/v1/paths', async ({ request }) => {
      const body = (await request.json()) as {
        title: string;
        description: string | null;
        color: string;
      };
      const created = createStoryPath({
        path_id: slugify(body.title),
        owner_user_id: state.currentUser?.user_id ?? storybookUser.user_id,
        title: body.title,
        description: body.description,
        color: body.color || '#3949AB',
      });
      state.paths.push(created);
      state.entriesByPath[created.path_id] = [];
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put('*/v1/paths/:pathCode', async ({ params, request }) => {
      const body = (await request.json()) as {
        title: string;
        description: string | null;
        color: string;
      };
      const path = state.paths.find((item) => item.path_id === params.pathCode);
      if (!path) {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      }
      path.title = body.title;
      path.description = body.description;
      path.color = body.color;
      path.updated_at = storyTimestampOffset(0);
      return HttpResponse.json(path, { status: 200 });
    }),
    http.delete('*/v1/paths/:pathCode', ({ params }) => {
      state.paths = state.paths.filter(
        (item) => item.path_id !== params.pathCode,
      );
      delete state.entriesByPath[String(params.pathCode)];
      delete state.subscriptionsByPath[String(params.pathCode)];
      return new HttpResponse(null, { status: 204 });
    }),
    http.get('*/v1/paths/:pathCode/entries', ({ params }) => {
      const entries = state.entriesByPath[String(params.pathCode)] ?? [];
      return HttpResponse.json(
        entries.map((record) => record.summary),
        { status: 200 },
      );
    }),
    // ─── Get-or-create create draft ────────────────────────────────────────
    http.get('*/v1/paths/:pathCode/entries/drafts', ({ params, request }) => {
      const pathId = String(params.pathCode);
      const url = new URL(request.url);
      const day = url.searchParams.get('day') ?? storyDateOffset(0);
      const key = `create:${pathId}:${day}`;
      draftCounter += 1;
      const draft = getOrCreateDraft(key, () => ({
        id: `draft-create-${draftCounter}`,
        mode: 'create',
        pathId,
        entryId: null,
        day,
        content: '',
        based_on_edit_id: null,
        images: [],
        state: 'open',
      }));
      return HttpResponse.json(makeDraftResponse(draft), { status: 200 });
    }),
    http.get('*/v1/paths/:pathCode/entries/:entrySlug', ({ params }) => {
      const entry = findEntryRecord(
        state,
        String(params.entrySlug),
        String(params.pathCode),
      );
      if (!entry) {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      }
      return HttpResponse.json(toEntryContent(entry.record), { status: 200 });
    }),
    // ─── Get-or-create edit draft ───────────────────────────────────────────
    http.get(
      '*/v1/paths/:pathCode/entries/:entrySlug/draft',
      ({ params, request }) => {
        const pathId = String(params.pathCode);
        const entrySlug = String(params.entrySlug);
        const url = new URL(request.url);
        const basedOnEditId = parseInt(
          url.searchParams.get('based_on_edit_id') ?? '0',
          10,
        );

        const entry = findEntryRecord(state, entrySlug, pathId);
        if (!entry) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }

        // Check for edit_id mismatch (simulate 409 if stale)
        if (
          basedOnEditId !== 0 &&
          basedOnEditId !== entry.record.summary.edit_id
        ) {
          return HttpResponse.json(
            { detail: 'Edit ID mismatch.' },
            { status: 409 },
          );
        }

        const key = `edit:${pathId}:${entrySlug}`;
        draftCounter += 1;
        const draft = getOrCreateDraft(key, () => ({
          id: `draft-edit-${draftCounter}`,
          mode: 'edit',
          pathId,
          entryId: entrySlug,
          day: entry.record.summary.day,
          content: entry.record.content,
          based_on_edit_id: entry.record.summary.edit_id,
          images: entry.record.images.map((img) =>
            createDraftImageFromEntryImage(img),
          ),
          state: 'open',
        }));
        return HttpResponse.json(makeDraftResponse(draft), { status: 200 });
      },
    ),
    http.delete('*/v1/paths/:pathCode/entries/:entrySlug', ({ params }) => {
      const pathId = String(params.pathCode);
      state.entriesByPath[pathId] = (state.entriesByPath[pathId] ?? []).filter(
        (record) => record.summary.id !== params.entrySlug,
      );
      return new HttpResponse(null, { status: 204 });
    }),
    http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', ({ params }) => {
      const entry = findEntryRecord(
        state,
        String(params.entrySlug),
        String(params.pathCode),
      );
      if (!entry) {
        return HttpResponse.json([], { status: 200 });
      }
      return HttpResponse.json(entry.record.images, { status: 200 });
    }),
    // ─── Get / patch / abandon draft ───────────────────────────────────────
    http.get('*/v1/entry-drafts/:draftId', ({ params }) => {
      const draft = drafts.get(String(params.draftId));
      if (!draft) {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      }
      return HttpResponse.json(makeDraftResponse(draft), { status: 200 });
    }),
    http.patch('*/v1/entry-drafts/:draftId', async ({ params, request }) => {
      const draft = drafts.get(String(params.draftId));
      if (!draft) {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      }
      const body = (await request.json()) as {
        day?: string;
        content?: string;
      };
      if (body.day !== undefined) draft.day = body.day;
      if (body.content !== undefined) draft.content = body.content;
      return HttpResponse.json(makeDraftResponse(draft), { status: 200 });
    }),
    http.delete('*/v1/entry-drafts/:draftId', ({ params }) => {
      const draftId = String(params.draftId);
      const draft = drafts.get(draftId);
      if (draft) {
        // Remove from index so a fresh draft can be created next time
        const key =
          draft.mode === 'create'
            ? `create:${draft.pathId}:${draft.day}`
            : `edit:${draft.pathId}:${draft.entryId}`;
        draftIndex.delete(key);
        drafts.delete(draftId);
      }
      return new HttpResponse(null, { status: 204 });
    }),
    // ─── Draft image upload (3-step) ───────────────────────────────────────
    http.post(
      '*/v1/entry-drafts/:draftId/images',
      async ({ params, request }) => {
        const draftId = String(params.draftId);
        const draft = drafts.get(draftId);
        if (!draft) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        const body = (await request.json()) as {
          filename: string;
          content_type?: string;
          strip_metadata?: boolean;
          client_image_id?: string;
        };
        draftImageCounter += 1;
        const draftImageId = `dimg-${draftImageCounter}`;
        pendingDraftUploads.set(draftImageId, {
          draftId,
          filename: body.filename,
          contentType: body.content_type ?? 'image/jpeg',
          stripMetadata: body.strip_metadata ?? false,
          clientImageId: body.client_image_id ?? null,
        });
        const slot: DraftImageSlotResponse = {
          id: draftImageId,
          draft_id: draftId,
          source: 'upload',
          filename: body.filename,
          status: 'pending',
          content_type: body.content_type ?? 'image/jpeg',
          strip_metadata: body.strip_metadata ?? false,
          client_image_id: body.client_image_id ?? null,
          upload_url: `https://storybook.paths.local/uploads/${draftImageId}`,
          expires_in_seconds: 600,
        };
        return HttpResponse.json(slot, { status: 201 });
      },
    ),
    http.put('https://storybook.paths.local/uploads/:imageId', () => {
      return new HttpResponse(null, { status: 200 });
    }),
    http.post(
      '*/v1/entry-drafts/:draftId/images/:draftImageId/complete',
      async ({ params, request }) => {
        const draftId = String(params.draftId);
        const draftImageId = String(params.draftImageId);
        const pending = pendingDraftUploads.get(draftImageId);
        if (!pending) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        const draft = drafts.get(draftId);
        if (!draft) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        const body = (await request.json()) as { byte_size?: number };
        const draftImage: DraftImageResponse = {
          id: draftImageId,
          draft_id: draftId,
          source: 'upload',
          live_image_id: null,
          filename: pending.filename,
          status: 'ready',
          content_type: pending.contentType,
          strip_metadata: pending.stripMetadata,
          byte_size: body.byte_size ?? null,
          client_image_id: pending.clientImageId,
        };
        draft.images = [
          ...draft.images.filter((img) => img.id !== draftImageId),
          draftImage,
        ];
        pendingDraftUploads.delete(draftImageId);
        return HttpResponse.json(draftImage, { status: 200 });
      },
    ),
    http.post(
      '*/v1/entry-drafts/:draftId/images/:draftImageId/retry-upload',
      ({ params }) => {
        const draftId = String(params.draftId);
        const draftImageId = String(params.draftImageId);
        const draft = drafts.get(draftId);
        const existing = draft?.images.find((img) => img.id === draftImageId);
        if (!existing) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        const slot: DraftImageSlotResponse = {
          id: draftImageId,
          draft_id: draftId,
          source: 'upload',
          filename: existing.filename,
          status: 'pending',
          content_type: existing.content_type,
          strip_metadata: existing.strip_metadata,
          client_image_id: existing.client_image_id,
          upload_url: `https://storybook.paths.local/uploads/${draftImageId}`,
          expires_in_seconds: 600,
        };
        return HttpResponse.json(slot, { status: 200 });
      },
    ),
    http.delete(
      '*/v1/entry-drafts/:draftId/images/:draftImageId',
      ({ params }) => {
        const draftId = String(params.draftId);
        const draftImageId = String(params.draftImageId);
        const draft = drafts.get(draftId);
        if (!draft) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        const removed = draft.images.find((img) => img.id === draftImageId);
        if (!removed) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        draft.images = draft.images.filter((img) => img.id !== draftImageId);
        return HttpResponse.json(removed, { status: 200 });
      },
    ),
    // ─── Commit draft ───────────────────────────────────────────────────────
    http.post('*/v1/entry-drafts/:draftId/commit', ({ params }) => {
      const draftId = String(params.draftId);
      const draft = drafts.get(draftId);
      if (!draft) {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      }

      const pathId = draft.pathId;

      if (draft.mode === 'create') {
        // Create a new entry in state
        const existing = state.entriesByPath[pathId] ?? [];
        const entryId = `entry-${pathId}-${existing.length + 1}`;
        const created = createStoryEntry({
          id: entryId,
          path_id: pathId,
          day: draft.day,
          edit_id: 1,
          content: draft.content,
          images: draft.images.map((dimg) =>
            createImage({
              id: dimg.id,
              entry_id: entryId,
              filename: dimg.filename,
              content_type: dimg.content_type,
              byte_size: dimg.byte_size,
            }),
          ),
        });
        state.entriesByPath[pathId] = [created, ...existing];
        draft.state = 'committed';
        const key = `create:${pathId}:${draft.day}`;
        draftIndex.delete(key);
        return HttpResponse.json(toEntryContent(created), { status: 200 });
      } else {
        // Update existing entry
        const entryRecord = findEntryRecord(state, draft.entryId ?? '', pathId);
        if (!entryRecord) {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }
        entryRecord.record.content = draft.content;
        entryRecord.record.summary.edit_id += 1;
        entryRecord.record.images = draft.images.map((dimg) =>
          createImage({
            id: dimg.id,
            entry_id: entryRecord.record.summary.id,
            filename: dimg.filename,
            content_type: dimg.content_type,
            byte_size: dimg.byte_size,
          }),
        );
        draft.state = 'committed';
        const key = `edit:${pathId}:${draft.entryId}`;
        draftIndex.delete(key);
        return HttpResponse.json(toEntryContent(entryRecord.record), {
          status: 200,
        });
      }
    }),
    http.get('*/v1/images/:imageId/download-url', ({ params }) => {
      const imageId = String(params.imageId);
      if (imageId === 'missing-image') {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      }
      const download = createImageDownload(imageId);
      return HttpResponse.json(download, { status: 200 });
    }),
    http.get('*/storybook-images/:imageId/:variant', ({ params }) => {
      const imageId = String(params.imageId);
      const variant = String(params.variant);
      return createStoryImageAssetResponse(imageId, variant === 'thumbnail');
    }),
    http.get('*/v1/paths/:pathCode/subscriptions', ({ params }) => {
      const subscribers =
        state.subscriptionsByPath[String(params.pathCode)] ?? [];
      return HttpResponse.json(subscribers, { status: 200 });
    }),
    http.post(
      '*/v1/paths/:pathCode/subscriptions',
      async ({ params, request }) => {
        const body = (await request.json()) as { email: string };
        const subscribers =
          state.subscriptionsByPath[String(params.pathCode)] ?? [];
        state.subscriptionsByPath[String(params.pathCode)] = subscribers;
        return HttpResponse.json(
          {
            invitation_id: `invite-${slugify(body.email)}`,
            status: 'sent',
          },
          { status: 201 },
        );
      },
    ),
    http.delete(
      '*/v1/paths/:pathCode/subscriptions/:targetUserId',
      ({ params }) => {
        const pathId = String(params.pathCode);
        state.subscriptionsByPath[pathId] = (
          state.subscriptionsByPath[pathId] ?? []
        ).filter((subscriber) => subscriber.user_id !== params.targetUserId);
        return new HttpResponse(null, { status: 204 });
      },
    ),
    http.get('*/v1/invitations', () =>
      HttpResponse.json(state.invitations, { status: 200 }),
    ),
    http.post('*/v1/invitations/:invitationId/accept', ({ params }) => {
      const invitation = state.invitations.find(
        (item) => item.id === params.invitationId,
      );
      if (invitation) {
        invitation.status = 'accepted';
        invitation.updated_at = storyTimestampOffset(0);
      }
      return new HttpResponse(null, { status: 204 });
    }),
    http.post('*/v1/invitations/:invitationId/ignore', ({ params }) => {
      const invitation = state.invitations.find(
        (item) => item.id === params.invitationId,
      );
      if (invitation) {
        invitation.status = 'ignored';
        invitation.updated_at = storyTimestampOffset(0);
      }
      return new HttpResponse(null, { status: 204 });
    }),
    http.get('*/v1/invitations/blocklist', () =>
      HttpResponse.json(state.blocklist, { status: 200 }),
    ),
    http.post('*/v1/invitations/blocklist', async ({ request }) => {
      const body = (await request.json()) as { user_id: string };
      state.blocklist.push({
        id: `blocked-${slugify(body.user_id)}`,
        blocked_user_id: body.user_id,
        created_at: storyTimestampOffset(0),
      });
      return new HttpResponse(null, { status: 204 });
    }),
    http.delete('*/v1/invitations/blocklist/:blockedUserId', ({ params }) => {
      state.blocklist = state.blocklist.filter(
        (item) => item.blocked_user_id !== params.blockedUserId,
      );
      return new HttpResponse(null, { status: 204 });
    }),
    http.get('*/v1/auth/login', () =>
      HttpResponse.json(
        { authorization_url: state.authLoginUrl },
        { status: 200 },
      ),
    ),
    http.post('*/v1/auth/callback', async ({ request }) => {
      const body = (await request.json()) as {
        code?: string;
        state?: string;
        callback_uri?: string;
      };
      if (!body.code || !body.state) {
        return HttpResponse.json(
          { detail: 'Missing code or state parameter.' },
          { status: 422 },
        );
      }
      return HttpResponse.json(state.currentUser ?? storybookUser, {
        status: 200,
      });
    }),
    http.get('*/v1/auth/callback', ({ request }) => {
      const url = new URL(request.url);
      if (!url.searchParams.get('code') || !url.searchParams.get('state')) {
        return HttpResponse.json(
          { detail: 'Missing code or state parameter.' },
          { status: 422 },
        );
      }
      return HttpResponse.json(state.currentUser ?? storybookUser, {
        status: 200,
      });
    }),
    http.post('*/v1/exports', async ({ request }) => {
      const body = (await request.json()) as { path_ids: string[] };
      const exportId = `export-${Object.keys(exportRequests).length + 1}`;
      exportPolls[exportId] = 0;
      exportRequests[exportId] = body.path_ids;
      return HttpResponse.json(
        createExportJob(exportId, 'queued', body.path_ids),
        { status: 202 },
      );
    }),
    http.get('*/v1/exports/:exportId', ({ params }) => {
      const exportId = String(params.exportId);
      exportPolls[exportId] = (exportPolls[exportId] ?? 0) + 1;
      const requestedPathIds = exportRequests[exportId] ?? [];
      const stateName = exportPolls[exportId] > 1 ? 'ready' : 'running';
      return HttpResponse.json(
        createExportJob(exportId, stateName, requestedPathIds),
        { status: 200 },
      );
    }),
    http.get('*/v1/exports/:exportId/download/json', ({ params }) => {
      const exportId = String(params.exportId);
      const requestedPathIds = exportRequests[exportId] ?? [];
      const url = createJsonDataUrl(
        buildExportPayload(state, requestedPathIds),
      );
      const response: DownloadURLResponse = {
        url,
        expires_in_seconds: 900,
      };
      return HttpResponse.json(response, { status: 200 });
    }),
    http.get('*/v1/exports/:exportId/download/images', () => {
      const response: DownloadURLResponse = {
        url: ZIP_DATA_URL,
        expires_in_seconds: 900,
      };
      return HttpResponse.json(response, { status: 200 });
    }),
    http.post('*/v1/account/deletion-requests', () => {
      const req = {
        id: 'del-req-1',
        state: 'requested' as const,
        error_message: null,
        failure_code: null,
        attempt_count: 0,
        created_at: storyTimestampOffset(0),
        updated_at: storyTimestampOffset(0),
      };
      state.deletionRequest = req;
      return HttpResponse.json(req, { status: 200 });
    }),
    http.get('*/v1/account/deletion-requests/latest', () => {
      if (!state.deletionRequest) {
        return HttpResponse.json(
          { detail: 'No deletion request found.' },
          { status: 404 },
        );
      }
      return HttpResponse.json(
        {
          id: 'del-req-1',
          ...state.deletionRequest,
          failure_code: null,
          attempt_count: 1,
          created_at: storyTimestampOffset(-1),
          updated_at: storyTimestampOffset(0),
        },
        { status: 200 },
      );
    }),
    http.all('*/v1/*', ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json(
        {
          detail: `No Storybook handler for ${request.method} ${url.pathname}`,
        },
        { status: 501 },
      );
    }),
  ];
}

export function createStoryPath(input: {
  path_id: string;
  owner_user_id: string;
  title: string;
  description: string | null;
  color: string;
}): PathResponse {
  return {
    ...input,
    uuid: `uuid-${input.path_id}`,
    is_public: false,
    created_at: storyTimestampOffset(-30),
    updated_at: storyTimestampOffset(-1),
  };
}

export function createStoryEntry(input: {
  id: string;
  path_id: string;
  day: string;
  edit_id: number;
  content: string;
  images?: ImageResponse[];
}): StoryEntryRecord {
  return {
    summary: {
      id: input.id,
      path_id: input.path_id,
      day: input.day,
      edit_id: input.edit_id,
    },
    content: input.content,
    images: input.images ?? [],
  };
}

function createImage(input: {
  id: string;
  entry_id: string;
  filename: string;
  content_type: string | null;
  byte_size: number | null;
}): ImageResponse {
  return {
    ...input,
    status: 'ready',
    strip_metadata: true,
  };
}

function createDraftImageFromEntryImage(
  image: ImageResponse,
): DraftImageResponse {
  return {
    id: image.id,
    draft_id: '',
    source: 'live',
    live_image_id: image.id,
    filename: image.filename,
    status: 'ready',
    content_type: image.content_type,
    strip_metadata: image.strip_metadata,
    byte_size: image.byte_size,
    client_image_id: null,
  };
}

function createExportJob(
  exportId: string,
  state: ExportJobResponse['state'],
  requested_path_ids: string[],
): ExportJobResponse {
  return {
    id: exportId,
    state,
    requested_path_ids,
    created_at: storyTimestampOffset(0),
    updated_at: storyTimestampOffset(0),
    expires_at: state === 'ready' ? storyTimestampOffset(1) : null,
    failure_code: null,
    attempt_count: state === 'ready' ? 2 : 1,
  };
}

function createImageDownload(imageId: string): ImageDownloadResponse {
  return {
    image_url: `/storybook-images/${imageId}/full`,
    thumbnail_url: `/storybook-images/${imageId}/thumbnail`,
    expires_in_seconds: 600,
  };
}

function createStoryImageAssetResponse(imageId: string, thumbnail = false) {
  const color = imageId.includes('sunrise')
    ? '#2B6CB0'
    : imageId.includes('whiteboard')
      ? '#D97706'
      : '#15803D';
  const label = imageId
    .replace(/^img-/, '')
    .replace(/^upload-/, 'upload')
    .replace(/-/g, ' ');

  return new HttpResponse(
    svgMarkup(label, color, thumbnail ? 160 : 960, thumbnail ? 160 : 640),
    {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
    },
  );
}

function buildExportPayload(state: StoryState, requestedPathIds: string[]) {
  const entries = requestedPathIds.flatMap((pathId) =>
    (state.entriesByPath[pathId] ?? []).map((record) => ({
      day: record.summary.day,
      entry_id: record.summary.id,
      edit_id: record.summary.edit_id,
      image_filenames: record.images.map((image) => image.filename),
      content: record.content,
      path_id: pathId,
    })),
  );

  return {
    exported_at: STORYBOOK_NOW_ISO,
    path_ids: requestedPathIds,
    entries,
  };
}

function toEntryContent(record: StoryEntryRecord): EntryContentResponse {
  return {
    ...record.summary,
    content: record.content,
    image_filenames: record.images.map((image) => image.filename),
  };
}

function findEntryRecord(
  state: StoryState,
  entryId: string,
  pathId?: string,
): { pathId: string; record: StoryEntryRecord } | null {
  const pathIds = pathId ? [pathId] : Object.keys(state.entriesByPath);
  for (const currentPathId of pathIds) {
    const record = (state.entriesByPath[currentPathId] ?? []).find(
      (item) => item.summary.id === entryId,
    );
    if (record) {
      return { pathId: currentPathId, record };
    }
  }
  return null;
}

function clearSessionStorage() {
  localStorage.clear();
  sessionStorage.clear();
}

async function clearStoryDatabase() {
  try {
    await Promise.all([
      db.pathPreferences.clear(),
      db.queryCache.clear(),
      db.entryContent.clear(),
      db.entryImages.clear(),
    ]);
  } catch {
    // IndexedDB may be unavailable in some environments.
  }
}

async function seedStoryCache(state: StoryState) {
  seedQueryCacheFromState(state);
  await seedDatabaseFromState(state);
}

function seedQueryCacheFromState(state: StoryState) {
  storybookQueryClient.setQueryData(
    getListPathsQueryKey(),
    createQueryResponse(state.paths),
  );
  storybookQueryClient.setQueryData(
    getListInvitationsQueryKey(),
    createQueryResponse(state.invitations),
  );
  storybookQueryClient.setQueryData(
    getListBlocklistQueryKey(),
    createQueryResponse(state.blocklist),
  );

  for (const path of state.paths) {
    const pathId = path.path_id;
    const entries = state.entriesByPath[pathId] ?? [];
    storybookQueryClient.setQueryData(
      getListEntriesQueryKey(pathId),
      createQueryResponse(entries.map((record) => record.summary)),
    );
    storybookQueryClient.setQueryData(
      getListSubscriptionsQueryKey(pathId),
      createQueryResponse(state.subscriptionsByPath[pathId] ?? []),
    );

    for (const record of entries) {
      storybookQueryClient.setQueryData(
        getGetEntryQueryKey(pathId, record.summary.id),
        createQueryResponse(toEntryContent(record)),
      );
      storybookQueryClient.setQueryData(
        getListEntryImagesQueryKey(pathId, record.summary.id),
        createQueryResponse(record.images),
      );
    }
  }
}

async function seedDatabaseFromState(state: StoryState) {
  const entryContentRows = Object.entries(state.entriesByPath).flatMap(
    ([pathId, entries]) =>
      entries.map((record) => ({
        cache_key: `${pathId}:${record.summary.id}`,
        id: record.summary.id,
        path_id: pathId,
        day: record.summary.day,
        edit_id: record.summary.edit_id,
        content: record.content,
        image_filenames: record.images.map((image) => image.filename),
      })),
  );

  const entryImageRows = Object.values(state.entriesByPath).flatMap((entries) =>
    entries.flatMap((record) =>
      record.images.map((image) => ({
        id: image.id,
        entry_id: image.entry_id,
        filename: image.filename,
        status: image.status,
        strip_metadata: image.strip_metadata,
        content_type: image.content_type,
        byte_size: image.byte_size,
      })),
    ),
  );

  if (entryContentRows.length > 0) {
    await db.entryContent.bulkPut(entryContentRows);
  }
  if (entryImageRows.length > 0) {
    await db.entryImages.bulkPut(entryImageRows);
  }
}

function createQueryResponse<T>(data: T) {
  return {
    data,
    status: 200,
    headers: new Headers(),
  };
}

function createOverrideHandlers(requestOverrides: StoryRequestOverride[]) {
  return requestOverrides.map((override) => {
    const method = override.method ?? 'ALL';
    const resolver = () => {
      if (override.networkError) {
        return HttpResponse.error();
      }
      return HttpResponse.json(
        override.body ?? { detail: 'Storybook forced response' },
        { status: override.status ?? 500 },
      );
    };

    if (method === 'GET') return http.get(override.path, resolver);
    if (method === 'POST') return http.post(override.path, resolver);
    if (method === 'PUT') return http.put(override.path, resolver);
    if (method === 'DELETE') return http.delete(override.path, resolver);
    if (method === 'PATCH') return http.patch(override.path, resolver);
    return http.all(override.path, resolver);
  });
}

function cloneEntriesByPath(entriesByPath: Record<string, StoryEntryRecord[]>) {
  return Object.fromEntries(
    Object.entries(entriesByPath).map(([pathId, entries]) => [
      pathId,
      clone(entries),
    ]),
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function installDeterministicDate() {
  const globalScope = globalThis as typeof globalThis & {
    __PATHS_STORYBOOK_DATE__?: boolean;
  };
  if (globalScope.__PATHS_STORYBOOK_DATE__) {
    return;
  }

  const RealDate = Date;
  const fixedTime = STORYBOOK_NOW.getTime();

  class MockDate extends RealDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length < 1) {
        super(fixedTime);
      } else {
        super(...args);
      }
    }

    static now() {
      return fixedTime;
    }

    static parse(value: string) {
      return RealDate.parse(value);
    }

    static UTC(...args: Parameters<typeof RealDate.UTC>) {
      return RealDate.UTC(...args);
    }
  }

  globalThis.Date = MockDate as DateConstructor;
  globalScope.__PATHS_STORYBOOK_DATE__ = true;
}

function installMatchMediaStub() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia === 'function'
  ) {
    return;
  }

  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }) as MediaQueryList;
}

function installNavigatorOnlineStub() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  const globalScope = window as Window & {
    __PATHS_STORYBOOK_NETWORK_MODE__?: StoryNetworkMode;
    __PATHS_STORYBOOK_ONLINE_STUB__?: boolean;
  };
  if (globalScope.__PATHS_STORYBOOK_ONLINE_STUB__) {
    return;
  }

  globalScope.__PATHS_STORYBOOK_NETWORK_MODE__ = 'online';

  try {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get() {
        return globalScope.__PATHS_STORYBOOK_NETWORK_MODE__ !== 'offline';
      },
    });
    globalScope.__PATHS_STORYBOOK_ONLINE_STUB__ = true;
  } catch {
    // Some environments may not permit redefining navigator.onLine.
  }
}

function ensureStorybookChromeStyles() {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById('paths-storybook-chrome')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'paths-storybook-chrome';
  style.textContent = `
    html,
    body,
    #storybook-root {
      min-height: 100%;
    }

    .sb-story-root {
      min-height: 100vh;
      display: block;
    }

    .sb-phone-stage {
      min-height: 100vh;
      padding: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at top, rgba(57, 73, 171, 0.16), transparent 34%),
        linear-gradient(180deg, #f6f1e6 0%, #ece4d6 48%, #e8e1d4 100%);
      box-sizing: border-box;
    }

    .sb-phone-frame {
      width: min(100%, 428px);
      min-height: 872px;
      padding: 18px 12px 16px;
      border-radius: 46px;
      position: relative;
      background:
        linear-gradient(180deg, #3e434d 0%, #1d1f24 18%, #090a0d 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow:
        0 36px 80px rgba(28, 24, 16, 0.28),
        inset 0 0 0 1px rgba(255, 255, 255, 0.08),
        inset 0 -10px 30px rgba(255, 255, 255, 0.04);
      box-sizing: border-box;
    }

    .sb-phone-frame::before,
    .sb-phone-frame::after {
      content: '';
      position: absolute;
      right: -3px;
      width: 3px;
      border-radius: 999px;
      background: rgba(16, 18, 22, 0.9);
    }

    .sb-phone-frame::before {
      top: 170px;
      height: 70px;
    }

    .sb-phone-frame::after {
      top: 262px;
      height: 108px;
    }

    .sb-phone-speaker {
      width: 112px;
      height: 28px;
      margin: 0 auto 10px;
      border-radius: 999px;
      background:
        radial-gradient(circle at center, rgba(255, 255, 255, 0.12), transparent 56%),
        rgba(8, 10, 13, 0.96);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .sb-phone-screen {
      width: 100%;
      min-height: 824px;
      overflow: hidden;
      position: relative;
      border-radius: 34px;
      background: var(--ion-background-color, #ffffff);
      box-shadow:
        inset 0 0 0 1px rgba(15, 23, 42, 0.08),
        0 0 0 1px rgba(255, 255, 255, 0.06);
    }

    .sb-phone-screen > *,
    .sb-phone-screen .ion-page {
      height: 100%;
      min-height: 100%;
    }

    .sb-phone-screen ion-content {
      --padding-bottom: 28px;
    }

    .sb-story-root[data-color-mode="dark"] .sb-phone-stage {
      background:
        radial-gradient(circle at top, rgba(121, 134, 203, 0.28), transparent 32%),
        linear-gradient(180deg, #171923 0%, #12141c 52%, #0c0e15 100%);
    }

    .sb-story-root[data-color-mode="dark"] .sb-phone-frame {
      background:
        linear-gradient(180deg, #59606b 0%, #23272d 18%, #07080b 100%);
    }

    @media (max-width: 640px) {
      .sb-phone-stage {
        padding: 12px;
      }

      .sb-phone-frame {
        width: min(100%, 402px);
        min-height: 824px;
        padding: 14px 10px 12px;
        border-radius: 38px;
      }

      .sb-phone-speaker {
        margin-bottom: 8px;
      }

      .sb-phone-screen {
        min-height: 780px;
        border-radius: 28px;
      }
    }
  `;
  document.head.appendChild(style);
}

function applyStorybookNetworkMode(mode: StoryNetworkMode) {
  if (typeof window === 'undefined') {
    return;
  }

  const globalScope = window as Window & {
    __PATHS_STORYBOOK_NETWORK_MODE__?: StoryNetworkMode;
  };
  globalScope.__PATHS_STORYBOOK_NETWORK_MODE__ = mode;
  window.dispatchEvent(new Event(mode === 'offline' ? 'offline' : 'online'));
}

function normalizeStoryColorMode(value: unknown): StoryColorMode {
  return value === 'dark' || value === 'system' ? value : 'light';
}

export function createStoryApiError(
  path: string,
  status = 500,
  method: StoryRequestMethod = 'ALL',
  body?: unknown,
): StoryRequestOverride {
  return {
    path,
    method,
    status,
    body,
  };
}

export function createStoryNetworkError(
  path: string,
  method: StoryRequestMethod = 'ALL',
): StoryRequestOverride {
  return {
    path,
    method,
    networkError: true,
  };
}

function applyStorybookColorMode(mode: StoryColorMode) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (mode === 'system') {
    localStorage.removeItem(STORYBOOK_DARK_MODE_KEY);
    document.documentElement.classList.toggle(
      'ion-palette-dark',
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
    );
    return;
  }

  localStorage.setItem(STORYBOOK_DARK_MODE_KEY, mode);
  document.documentElement.classList.toggle(
    'ion-palette-dark',
    mode === 'dark',
  );
}

export function storyDateOffset(dayOffset: number) {
  const date = new Date(STORYBOOK_NOW);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

export function storyDateYearsAgo(yearsAgo: number) {
  const date = new Date(STORYBOOK_NOW);
  date.setUTCFullYear(date.getUTCFullYear() - yearsAgo);
  return date.toISOString().slice(0, 10);
}

export function storyTimestampOffset(dayOffset: number) {
  const date = new Date(STORYBOOK_NOW);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString();
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

function createJsonDataUrl(value: unknown) {
  return `data:application/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(value, null, 2),
  )}`;
}

function svgMarkup(label: string, color: string, width = 960, height = 640) {
  const safeLabel = escapeXml(label);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${color}" />
      <rect x="32" y="32" width="${width - 64}" height="${height - 64}" rx="28" fill="rgba(255,255,255,0.16)" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Georgia, serif" font-size="${Math.max(
        24,
        Math.round(width / 16),
      )}">${safeLabel}</text>
    </svg>
  `;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
