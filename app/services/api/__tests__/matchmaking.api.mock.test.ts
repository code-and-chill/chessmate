import { MockMatchmakingApiClient } from '../matchmaking.api.mock';

describe('MockMatchmakingApiClient', () => {
  it('joinQueue returns queue status', async () => {
    const client = new MockMatchmakingApiClient();
    const status = await client.joinQueue({ userId: 'u', timeControl: 'blitz' });
    expect(status).toBeDefined();
    expect(typeof status.inQueue).toBe('boolean');
  });
});

