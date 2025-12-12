import { MockLearningApiClient } from '../learning.api.mock';

describe('MockLearningApiClient', () => {
  it('getAllLessons returns array', async () => {
    const client = new MockLearningApiClient();
    const lessons = await client.getAllLessons();
    expect(Array.isArray(lessons)).toBe(true);
  });
});

