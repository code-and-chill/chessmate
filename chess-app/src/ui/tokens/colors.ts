// Design tokens for color
export const colors = {
  // Board
  boardLight: '#EEEED2',
  boardDark: '#769656',

  // UI surfaces
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  surfaceElevated: '#F3F3F3',

  // Text
  textPrimary: '#151515',
  textSecondary: '#555555',
  textMuted: '#8A8A8A',

  // Accents
  accentGreen: '#769656',
  accentGreenDark: '#4E6A3A',
  danger: '#D9534F',

  // Borders & lines
  borderSubtle: 'rgba(0,0,0,0.08)',

  // Background
  appBackground: '#F0F2F5',
} as const;

export type ColorKey = keyof typeof colors;
