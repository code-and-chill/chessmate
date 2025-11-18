import React from 'react';
import { render } from '@testing-library/react-native';
import { PlayHubScreen } from '../PlayHubScreen';

describe('PlayHubScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<PlayHubScreen />);

    expect(getByText('Now Playing')).toBeTruthy();
    expect(getByText('Play Blitz')).toBeTruthy();
    expect(getByText('Game History')).toBeTruthy();
  });
});