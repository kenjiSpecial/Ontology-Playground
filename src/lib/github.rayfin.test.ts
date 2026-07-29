import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Covers the Rayfin branch of the OAuth proxy in `src/lib/github.ts`.
 *
 * `github.test.ts` exercises the default (fetch) path; these tests stub the
 * Rayfin client so the branch selection and error mapping are checked too.
 */

const invoke = vi.fn();

vi.mock('../services/rayfinClient', () => ({
  isRayfinConfigured: () => true,
  getRayfinClient: () => ({ functions: { githubOAuth: { invoke } } }),
}));

describe('device flow over Rayfin', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.restoreAllMocks());

  it('invokes the githubOAuth function instead of fetching', async () => {
    const body = {
      device_code: 'dc',
      user_code: 'ABCD-1234',
      verification_uri: 'https://github.com/login/device',
      expires_in: 900,
      interval: 5,
    };
    invoke.mockResolvedValueOnce({ status: 200, body });

    const { startDeviceFlow } = await import('./github');

    expect(await startDeviceFlow('client-id-test')).toEqual(body);
    expect(fetch).not.toHaveBeenCalled();
    expect(invoke).toHaveBeenCalledWith({
      path: 'login/device/code',
      body: { client_id: 'client-id-test', scope: 'public_repo' },
    });
  });

  it('maps a non-2xx upstream status to the same error as a direct fetch', async () => {
    invoke.mockResolvedValueOnce({ status: 500, body: {} });

    const { startDeviceFlow } = await import('./github');

    await expect(startDeviceFlow('client-id-test')).rejects.toThrow(
      'Device flow start failed (500)',
    );
  });

  it('keeps polling on authorization_pending, which GitHub returns with a 200', async () => {
    invoke
      .mockResolvedValueOnce({ status: 200, body: { error: 'authorization_pending' } })
      .mockResolvedValueOnce({ status: 200, body: { access_token: 'ghp_ok' } });

    const { pollForToken } = await import('./github');

    expect(await pollForToken('cid', 'dc', 0, 60)).toBe('ghp_ok');
    expect(invoke).toHaveBeenCalledTimes(2);
  });

  it('surfaces a terminal OAuth error from the response body', async () => {
    invoke.mockResolvedValueOnce({
      status: 200,
      body: { error: 'expired_token', error_description: 'The device code expired' },
    });

    const { pollForToken } = await import('./github');

    await expect(pollForToken('cid', 'dc', 0, 60)).rejects.toThrow('The device code expired');
  });
});
