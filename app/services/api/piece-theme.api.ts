import type { PieceTheme } from '@/features/board/types/pieces';

export const PIECE_THEME_LABELS: Record<PieceTheme, { name: string; description: string }> = {
  minimal: { name: 'Minimal', description: 'Clean, modern flat design' },
  solid: { name: 'Solid', description: 'Filled shapes, bold appearance' },
  outline: { name: 'Outline', description: 'Thick strokes, minimalist' },
  classic: { name: 'Classic', description: 'Traditional chess pieces' },
  neon: { name: 'Neon Glow', description: 'Cyberpunk glowing effects' },
  glass: { name: 'Glass', description: 'Translucent glass effect' },
  wood: { name: 'Wood Carved', description: 'Traditional wooden pieces' },
  pixel: { name: 'Pixel Art', description: 'Retro 8-bit style' },
  sketch: { name: 'Sketch', description: 'Hand-drawn artistic style' },
};

export interface IPieceThemeApiClient {
  getLabels(): Promise<typeof PIECE_THEME_LABELS>;
}

export class PieceThemeApiClient implements IPieceThemeApiClient {
  async getLabels(): Promise<typeof PIECE_THEME_LABELS> {
    return PIECE_THEME_LABELS;
  }
}
