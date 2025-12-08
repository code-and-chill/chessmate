import { getPlayerColor } from '../utils/getPlayerColor';

describe('getPlayerColor', () => {
  it('returns w when participant is null', () => {
    expect(getPlayerColor(null)).toBe('w');
  });

  it('returns w for white participant', () => {
    const participant = { myColor: 'white' } as any;
    expect(getPlayerColor(participant)).toBe('w');
  });

  it('returns b for black participant', () => {
    const participant = { myColor: 'black' } as any;
    expect(getPlayerColor(participant)).toBe('b');
  });
});
