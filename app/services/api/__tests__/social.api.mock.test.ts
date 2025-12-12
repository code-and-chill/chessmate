import { MockSocialApiClient } from '../social.api.mock';

describe('MockSocialApiClient', () => {
  it('getFriends returns array', async () => {
    const client = new MockSocialApiClient();
    const friends = await client.getFriends('u1');
    expect(Array.isArray(friends)).toBe(true);
  });
});

