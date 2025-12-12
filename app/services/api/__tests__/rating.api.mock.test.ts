import { MockRatingApiClient } from '../rating.api.mock';

describe('MockRatingApiClient', () => {
  it('getLeaderboard returns entries', async () => {
    const client = new MockRatingApiClient();
    const entries = await client.getLeaderboard('global', 'blitz');
    expect(Array.isArray(entries)).toBe(true);
  });
});

