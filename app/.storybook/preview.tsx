import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../ui/theme/ThemeProvider';

export const decorators = [
  (Story: any) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
];

export const parameters: Preview['parameters'] = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
