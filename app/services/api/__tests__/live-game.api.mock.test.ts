import { MockLiveGameApiClient } from '../live-game.api.mock';

describe('MockLiveGameApiClient', () => {
  it('createGame returns gameId', async () => {
    const client = new MockLiveGameApiClient();
    const res = await client.createGame();
    expect(res).toBeDefined();
    expect(typeof res.gameId).toBe('string');
  });
});

