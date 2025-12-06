import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/ui', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    VStack: ({ children }: any) => React.createElement(View, null, children),
    HStack: ({ children }: any) => React.createElement(View, null, children),
    Text: ({ children }: any) => React.createElement('Text', null, children),
    useThemeTokens: () => ({
      colors: {
        background: { secondary: '#fff' },
        foreground: { primary: '#000', secondary: '#666', muted: '#999' },
        accent: { primary: '#00f' },
      },
    }),
  };
});

jest.mock('@/i18n/I18nContext', () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

import {PlayerColorSelector} from '../PlayerColorSelector';

describe('PlayerColorSelector', () => {
  it('renders color choices', () => {
    const onChange = jest.fn();
    const { getByText } = render(<PlayerColorSelector value="white" onChange={onChange} />);

    // The displayed text includes emoji + translation key
    expect(getByText('⚪ game_modes.white')).toBeTruthy();
    expect(getByText('⚫ game_modes.black')).toBeTruthy();
  });
});
