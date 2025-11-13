export interface ThemeColors {
  // Board
  boardLight: string;
  boardDark: string;

  // UI surfaces
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accents
  accentGreen: string;
  accentGreenDark: string;
  danger: string;

  // Borders & lines
  borderSubtle: string;

  // Background
  appBackground: string;
}

export type ThemeMode = 'light' | 'dark';

export type BoardTheme = 'green' | 'blue' | 'brown' | 'gray' | 'purple';

export const lightColors: ThemeColors = {
  boardLight: '#EEEED2',
  boardDark: '#769656',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  surfaceElevated: '#F3F3F3',
  textPrimary: '#151515',
  textSecondary: '#555555',
  textMuted: '#8A8A8A',
  accentGreen: '#769656',
  accentGreenDark: '#4E6A3A',
  danger: '#D9534F',
  borderSubtle: 'rgba(0,0,0,0.08)',
  appBackground: '#F0F2F5',
};

export const darkColors: ThemeColors = {
  boardLight: '#4A4A4A',
  boardDark: '#2C2C2C',
  surface: '#1E1E1E',
  surfaceMuted: '#2A2A2A',
  surfaceElevated: '#323232',
  textPrimary: '#E4E4E4',
  textSecondary: '#A0A0A0',
  textMuted: '#707070',
  accentGreen: '#6BAA63',
  accentGreenDark: '#5A9B52',
  danger: '#FF6B6B',
  borderSubtle: 'rgba(255,255,255,0.08)',
  appBackground: '#0A0A0A',
};

export const boardThemes: Record<BoardTheme, { light: string; dark: string }> = {
  green: {
    light: '#EEEED2',
    dark: '#769656',
  },
  blue: {
    light: '#D5E6F5',
    dark: '#5B84C8',
  },
  brown: {
    light: '#D2A679',
    dark: '#6F4E37',
  },
  gray: {
    light: '#E8E8E8',
    dark: '#707070',
  },
  purple: {
    light: '#E8D5F2',
    dark: '#7B5A8C',
  },
};

export function applyBoardTheme(colors: ThemeColors, boardTheme: BoardTheme): ThemeColors {
  const theme = boardThemes[boardTheme];
  return {
    ...colors,
    boardLight: theme.light,
    boardDark: theme.dark,
  };
}
