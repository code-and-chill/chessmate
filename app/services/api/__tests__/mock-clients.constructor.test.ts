import { MockAuthApiClient } from '../auth.api.mock';
import { MockAccountApiClient } from '../account.api.mock';
import { MockRatingApiClient } from '../rating.api.mock';
import { MockMatchmakingApiClient } from '../matchmaking.api.mock';
import { MockLearningApiClient } from '../learning.api.mock';
import { MockSocialApiClient } from '../social.api.mock';
import { MockLiveGameApiClient } from '../live-game.api.mock';
import { MockPuzzleApiClient } from '../puzzle.api.mock';
import { MockGameApiClient } from '../game.api.mock';

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
    const game = new MockGameApiClient();

    expect(auth).toBeDefined();
    expect(account).toBeDefined();
    expect(rating).toBeDefined();
    expect(matchmaking).toBeDefined();
    expect(learning).toBeDefined();
    expect(social).toBeDefined();
    expect(live).toBeDefined();
    expect(puzzle).toBeDefined();
    expect(game).toBeDefined();
  });
});
