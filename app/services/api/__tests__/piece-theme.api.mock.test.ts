import { MockPieceThemeApiClient } from '../piece-theme.api.mock';

describe('MockPieceThemeApiClient', () => {
  it('getLabels returns an object', async () => {
    const client = new MockPieceThemeApiClient();
    const labels = await client.getLabels();
    expect(labels).toBeDefined();
    expect(typeof labels).toBe('object');
  });
});

