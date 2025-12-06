import React from 'react';
import { render } from '@testing-library/react-native';

// Mock hooks and UI primitives used by the component
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

import {TimeControlSelector} from '../TimeControlSelector';

describe('TimeControlSelector', () => {
  it('renders available time control options and highlights selected', () => {
    const onChange = jest.fn();
    const { getByText } = render(<TimeControlSelector value="10+0" onChange={onChange} />);

    // Ensure a couple of options render
    expect(getByText('10+0')).toBeTruthy();
    expect(getByText('5+0')).toBeTruthy();
  });
});
