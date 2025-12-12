import { MockGameApiClient } from '../game.api.mock';

describe('MockGameApiClient', () => {
  it('getGameById returns a game', async () => {
    const client = new MockGameApiClient();
    const game = await client.getGameById('play_1');
    expect(game).toBeDefined();
    expect(game.id).toBe('play_1');
  });
});

