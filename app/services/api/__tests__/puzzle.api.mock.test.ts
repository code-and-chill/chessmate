import { MockPuzzleApiClient } from '../puzzle.api.mock';

describe('MockPuzzleApiClient', () => {
  it('getRandomPuzzle returns object envelope', async () => {
    const client = new MockPuzzleApiClient();
    const res = await client.getRandomPuzzle();
    expect(res).toBeDefined();
  });
});

