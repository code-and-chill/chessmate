import React from 'react';
import { render } from '@testing-library/react-native';
import { PuzzleHubScreen } from '../PuzzleHubScreen';

describe('PuzzleHubScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<PuzzleHubScreen />);

    expect(getByText('Daily Puzzle')).toBeTruthy();
    expect(getByText('Tactics Stats')).toBeTruthy();
    expect(getByText('Quick Train')).toBeTruthy();
  });
});