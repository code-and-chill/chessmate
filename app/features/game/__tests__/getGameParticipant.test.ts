import { getGameParticipant } from '../utils/getGameParticipant';

describe('getGameParticipant', () => {
  const baseGame = {
    players: ['white-id', 'black-id'],
  } as any;

  test('returns null for null game', () => {
    expect(getGameParticipant(null, 'white-id')).toBeNull();
  });

  test('matches by account id as white', () => {
    const p = getGameParticipant(baseGame, 'white-id', null);
    expect(p).not.toBeNull();
    expect(p!.myColor).toBe('white');
  });

  test('matches by account id as black', () => {
    const p = getGameParticipant(baseGame, 'black-id', null);
    expect(p).not.toBeNull();
    expect(p!.myColor).toBe('black');
  });

  test('returns null for spectator', () => {
    const p = getGameParticipant(baseGame, 'someone-else', null);
    expect(p).toBeNull();
  });

  test('falls back to username when no accountId', () => {
    const gameWithUsernames = { players: ['alice', 'bob'] } as any;
    const p = getGameParticipant(gameWithUsernames, null, { username: 'bob' });
    expect(p).not.toBeNull();
    expect(p!.myColor).toBe('black');
  });
});
