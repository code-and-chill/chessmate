import { MockAccountApiClient } from '../account.api.mock';

describe('MockAccountApiClient', () => {
  it('getProfile returns a profile', async () => {
    const client = new MockAccountApiClient();
    const p = await client.getProfile('u1');
    expect(p).toBeDefined();
    expect(typeof p.id).toBe('string');
  });
});

