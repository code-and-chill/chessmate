import { MockAuthApiClient } from '../auth.api.mock';

describe('MockAuthApiClient', () => {
  it('login returns token and user', async () => {
    const client = new MockAuthApiClient();
    const res = await client.login('a@b.com', 'pass');
    expect(res).toBeDefined();
    expect(typeof res.token).toBe('string');
    expect(res.user).toBeDefined();
  });
});

