import {
  MockAuthApiClient,
  MockAccountApiClient,
  MockRatingApiClient,
  MockMatchmakingApiClient,
  MockLearningApiClient,
  MockSocialApiClient,
  MockLiveGameApiClient,
  MockPuzzleApiClient,
  MockPlayApiClient,
} from '../mock-clients';

describe('Mock clients construction', () => {
  it('can construct all mock clients', () => {
    const auth = new MockAuthApiClient();
    const account = new MockAccountApiClient();
    const rating = new MockRatingApiClient();
    const matchmaking = new MockMatchmakingApiClient();
    const learning = new MockLearningApiClient();
    const social = new MockSocialApiClient();
    const live = new MockLiveGameApiClient();
    const puzzle = new MockPuzzleApiClient();
    const play = new MockPlayApiClient();

    expect(auth).toBeDefined();
    expect(account).toBeDefined();
    expect(rating).toBeDefined();
    expect(matchmaking).toBeDefined();
    expect(learning).toBeDefined();
    expect(social).toBeDefined();
    expect(live).toBeDefined();
    expect(puzzle).toBeDefined();
    expect(play).toBeDefined();
  });
});

