import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock primitives and hooks used by Tabs
jest.mock('@/ui', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    HStack: ({ children }: any) => React.createElement(View, null, children),
    Text: ({ children }: any) => React.createElement('Text', null, children),
    useThemeTokens: () => ({
      colors: {
        background: { tertiary: '#f3f3f3' },
        foreground: { primary: '#000', secondary: '#666' },
        accent: { primary: '#0a84ff' },
      },
    }),
    spacingTokens: { 2: 8, 3: 12, 4: 16 },
    radiusTokens: { md: 8 },
    shadowTokens: { xs: {} },
  };
});

jest.mock('@/i18n/I18nContext', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

import Tabs from '../Tabs';

describe('Tabs', () => {
  it('renders labels and responds to presses', () => {
    const onSelect = jest.fn();
    const items = [
      { id: 'one', label: 'One', icon: '1' },
      { id: 'two', label: 'Two', icon: '2' },
    ];

    const { getByText } = render(
      <Tabs items={items} selectedId="one" onSelect={onSelect} size="md" />
    );

    expect(getByText('One')).toBeTruthy();
    expect(getByText('Two')).toBeTruthy();

    // Press second tab
    fireEvent.press(getByText('Two'));
    expect(onSelect).toHaveBeenCalledWith('two');
  });
});
