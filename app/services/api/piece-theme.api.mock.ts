import { PIECE_THEME_LABELS } from './piece-theme.api';
import type { IPieceThemeApiClient } from './piece-theme.api';

export class MockPieceThemeApiClient implements IPieceThemeApiClient {
  async getLabels() {
    return PIECE_THEME_LABELS;
  }
}
