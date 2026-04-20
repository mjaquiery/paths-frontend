/**
 * Integration tests for admin path-creation-approval flow.
 *
 * Tests that the approval action calls the API with the correct
 * admin Bearer token and user ID, and that the result is displayed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

import { useAdminAuth } from '../composables/useAdminAuth';
import { setPathCreationApproval } from '../generated/apiClient';

vi.mock('../generated/apiClient', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../generated/apiClient')>();
  return {
    ...original,
    setPathCreationApproval: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A minimal test harness component that exercises the approval action. */
const ApprovalHarness = defineComponent({
  setup() {
    const { storeToken, getAdminAuthHeaders } = useAdminAuth();
    const userId = ref('');
    const result = ref<string>('');
    const error = ref<string>('');

    async function approve(allowed: boolean) {
      try {
        const resp = await setPathCreationApproval(
          userId.value,
          { allowed },
          { headers: getAdminAuthHeaders() },
        );
        if (resp.status === 200) {
          result.value = `${resp.data.user_id}:${resp.data.allowed}`;
        }
      } catch (e) {
        error.value = String(e);
      }
    }

    return { storeToken, userId, result, error, approve };
  },
  template: `
    <div>
      <input data-testid="user-id" v-model="userId" />
      <button data-testid="allow" @click="approve(true)">Allow</button>
      <button data-testid="deny" @click="approve(false)">Deny</button>
      <span data-testid="result">{{ result }}</span>
      <span data-testid="error">{{ error }}</span>
    </div>
  `,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Admin path-creation-approval flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('calls setPathCreationApproval with the admin Bearer token when allowing', async () => {
    vi.mocked(setPathCreationApproval).mockResolvedValue({
      data: { user_id: 'user-abc', allowed: true },
      status: 200,
      headers: new Headers(),
    });

    const wrapper = mount(ApprovalHarness);
    wrapper.vm.storeToken('admin-tok-123');

    await wrapper.find('[data-testid="user-id"]').setValue('user-abc');
    await wrapper.find('[data-testid="allow"]').trigger('click');
    await flushPromises();

    expect(vi.mocked(setPathCreationApproval)).toHaveBeenCalledWith(
      'user-abc',
      { allowed: true },
      { headers: { Authorization: 'Bearer admin-tok-123' } },
    );
    expect(wrapper.find('[data-testid="result"]').text()).toBe('user-abc:true');
  });

  it('calls setPathCreationApproval with allowed:false when denying', async () => {
    vi.mocked(setPathCreationApproval).mockResolvedValue({
      data: { user_id: 'user-xyz', allowed: false },
      status: 200,
      headers: new Headers(),
    });

    const wrapper = mount(ApprovalHarness);
    wrapper.vm.storeToken('admin-tok-456');

    await wrapper.find('[data-testid="user-id"]').setValue('user-xyz');
    await wrapper.find('[data-testid="deny"]').trigger('click');
    await flushPromises();

    expect(vi.mocked(setPathCreationApproval)).toHaveBeenCalledWith(
      'user-xyz',
      { allowed: false },
      { headers: { Authorization: 'Bearer admin-tok-456' } },
    );
    expect(wrapper.find('[data-testid="result"]').text()).toBe(
      'user-xyz:false',
    );
  });

  it('surfaces an error when the API throws', async () => {
    vi.mocked(setPathCreationApproval).mockRejectedValue(
      new Error('Network error'),
    );

    const wrapper = mount(ApprovalHarness);
    wrapper.vm.storeToken('admin-tok-789');

    await wrapper.find('[data-testid="user-id"]').setValue('user-bad');
    await wrapper.find('[data-testid="allow"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="error"]').text()).toContain(
      'Network error',
    );
  });
});
