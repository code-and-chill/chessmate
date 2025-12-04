/**
 * Piece Set Registry
 * 
 * Central registry for all chess piece themes.
 * Maps theme names to complete piece sets with metadata.
 * 
 * @see docs/PIECE_SYSTEM_UPGRADE_PLAN.md
 */

import type { PieceSet, PieceTheme } from '../types/pieces';

// Import Minimal Theme SVGs
import MinimalWK from '@/assets/pieces/minimal/wK.svg';
import MinimalWQ from '@/assets/pieces/minimal/wQ.svg';
import MinimalWR from '@/assets/pieces/minimal/wR.svg';
import MinimalWB from '@/assets/pieces/minimal/wB.svg';
import MinimalWN from '@/assets/pieces/minimal/wN.svg';
import MinimalWP from '@/assets/pieces/minimal/wP.svg';
import MinimalBK from '@/assets/pieces/minimal/bK.svg';
import MinimalBQ from '@/assets/pieces/minimal/bQ.svg';
import MinimalBR from '@/assets/pieces/minimal/bR.svg';
import MinimalBB from '@/assets/pieces/minimal/bB.svg';
import MinimalBN from '@/assets/pieces/minimal/bN.svg';
import MinimalBP from '@/assets/pieces/minimal/bP.svg';

// Import Solid Theme SVGs
import SolidWK from '@/assets/pieces/solid/wK.svg';
import SolidWQ from '@/assets/pieces/solid/wQ.svg';
import SolidWR from '@/assets/pieces/solid/wR.svg';
import SolidWB from '@/assets/pieces/solid/wB.svg';
import SolidWN from '@/assets/pieces/solid/wN.svg';
import SolidWP from '@/assets/pieces/solid/wP.svg';
import SolidBK from '@/assets/pieces/solid/bK.svg';
import SolidBQ from '@/assets/pieces/solid/bQ.svg';
import SolidBR from '@/assets/pieces/solid/bR.svg';
import SolidBB from '@/assets/pieces/solid/bB.svg';
import SolidBN from '@/assets/pieces/solid/bN.svg';
import SolidBP from '@/assets/pieces/solid/bP.svg';

// Import Outline Theme SVGs
import OutlineWK from '@/assets/pieces/outline/wK.svg';
import OutlineWQ from '@/assets/pieces/outline/wQ.svg';
import OutlineWR from '@/assets/pieces/outline/wR.svg';
import OutlineWB from '@/assets/pieces/outline/wB.svg';
import OutlineWN from '@/assets/pieces/outline/wN.svg';
import OutlineWP from '@/assets/pieces/outline/wP.svg';
import OutlineBK from '@/assets/pieces/outline/bK.svg';
import OutlineBQ from '@/assets/pieces/outline/bQ.svg';
import OutlineBR from '@/assets/pieces/outline/bR.svg';
import OutlineBB from '@/assets/pieces/outline/bB.svg';
import OutlineBN from '@/assets/pieces/outline/bN.svg';
import OutlineBP from '@/assets/pieces/outline/bP.svg';

// Import Neon Theme SVGs
import NeonWK from '@/assets/pieces/neon/wK.svg';
import NeonWQ from '@/assets/pieces/neon/wQ.svg';
import NeonWR from '@/assets/pieces/neon/wR.svg';
import NeonWB from '@/assets/pieces/neon/wB.svg';
import NeonWN from '@/assets/pieces/neon/wN.svg';
import NeonWP from '@/assets/pieces/neon/wP.svg';
import NeonBK from '@/assets/pieces/neon/bK.svg';
import NeonBQ from '@/assets/pieces/neon/bQ.svg';
import NeonBR from '@/assets/pieces/neon/bR.svg';
import NeonBB from '@/assets/pieces/neon/bB.svg';
import NeonBN from '@/assets/pieces/neon/bN.svg';
import NeonBP from '@/assets/pieces/neon/bP.svg';

// Import Glass Theme SVGs
import GlassWK from '@/assets/pieces/glass/wK.svg';
import GlassWQ from '@/assets/pieces/glass/wQ.svg';
import GlassWR from '@/assets/pieces/glass/wR.svg';
import GlassWB from '@/assets/pieces/glass/wB.svg';
import GlassWN from '@/assets/pieces/glass/wN.svg';
import GlassWP from '@/assets/pieces/glass/wP.svg';
import GlassBK from '@/assets/pieces/glass/bK.svg';
import GlassBQ from '@/assets/pieces/glass/bQ.svg';
import GlassBR from '@/assets/pieces/glass/bR.svg';
import GlassBB from '@/assets/pieces/glass/bB.svg';
import GlassBN from '@/assets/pieces/glass/bN.svg';
import GlassBP from '@/assets/pieces/glass/bP.svg';

// Import Wood Theme SVGs
import WoodWK from '@/assets/pieces/wood/wK.svg';
import WoodWQ from '@/assets/pieces/wood/wQ.svg';
import WoodWR from '@/assets/pieces/wood/wR.svg';
import WoodWB from '@/assets/pieces/wood/wB.svg';
import WoodWN from '@/assets/pieces/wood/wN.svg';
import WoodWP from '@/assets/pieces/wood/wP.svg';
import WoodBK from '@/assets/pieces/wood/bK.svg';
import WoodBQ from '@/assets/pieces/wood/bQ.svg';
import WoodBR from '@/assets/pieces/wood/bR.svg';
import WoodBB from '@/assets/pieces/wood/bB.svg';
import WoodBN from '@/assets/pieces/wood/bN.svg';
import WoodBP from '@/assets/pieces/wood/bP.svg';

// Import Pixel Theme SVGs
import PixelWK from '@/assets/pieces/pixel/wK.svg';
import PixelWQ from '@/assets/pieces/pixel/wQ.svg';
import PixelWR from '@/assets/pieces/pixel/wR.svg';
import PixelWB from '@/assets/pieces/pixel/wB.svg';
import PixelWN from '@/assets/pieces/pixel/wN.svg';
import PixelWP from '@/assets/pieces/pixel/wP.svg';
import PixelBK from '@/assets/pieces/pixel/bK.svg';
import PixelBQ from '@/assets/pieces/pixel/bQ.svg';
import PixelBR from '@/assets/pieces/pixel/bR.svg';
import PixelBB from '@/assets/pieces/pixel/bB.svg';
import PixelBN from '@/assets/pieces/pixel/bN.svg';
import PixelBP from '@/assets/pieces/pixel/bP.svg';

// Import Sketch Theme SVGs
import SketchWK from '@/assets/pieces/sketch/wK.svg';
import SketchWQ from '@/assets/pieces/sketch/wQ.svg';
import SketchWR from '@/assets/pieces/sketch/wR.svg';
import SketchWB from '@/assets/pieces/sketch/wB.svg';
import SketchWN from '@/assets/pieces/sketch/wN.svg';
import SketchWP from '@/assets/pieces/sketch/wP.svg';
import SketchBK from '@/assets/pieces/sketch/bK.svg';
import SketchBQ from '@/assets/pieces/sketch/bQ.svg';
import SketchBR from '@/assets/pieces/sketch/bR.svg';
import SketchBB from '@/assets/pieces/sketch/bB.svg';
import SketchBN from '@/assets/pieces/sketch/bN.svg';
import SketchBP from '@/assets/pieces/sketch/bP.svg';

/**
 * Minimal Flat Theme
 * 
 * Lichess-inspired clean outlines with thin strokes.
 * Best for: mobile devices, minimalist aesthetic, light/dark mode.
 */
export const minimalPieceSet: PieceSet = {
  name: 'minimal',
  displayName: 'Minimal Flat',
  description: 'Clean, Lichess-inspired minimal outlines',
  premium: false,
  type: 'svg',
  pieces: {
    wK: MinimalWK,
    wQ: MinimalWQ,
    wR: MinimalWR,
    wB: MinimalWB,
    wN: MinimalWN,
    wP: MinimalWP,
    bK: MinimalBK,
    bQ: MinimalBQ,
    bR: MinimalBR,
    bB: MinimalBB,
    bN: MinimalBN,
    bP: MinimalBP,
  },
};

/**
 * Solid Filled Theme
 * 
 * Bold filled shapes with no strokes.
 * Best for: high contrast, strong visual presence, readability.
 */
export const solidPieceSet: PieceSet = {
  name: 'solid',
  displayName: 'Solid Filled',
  description: 'Bold filled shapes, strong presence',
  premium: false,
  type: 'svg',
  pieces: {
    wK: SolidWK,
    wQ: SolidWQ,
    wR: SolidWR,
    wB: SolidWB,
    wN: SolidWN,
    wP: SolidWP,
    bK: SolidBK,
    bQ: SolidBQ,
    bR: SolidBR,
    bB: SolidBB,
    bN: SolidBN,
    bP: SolidBP,
  },
};

/**
 * Outline Theme
 * 
 * Thick strokes with no fills, minimalist design.
 * Best for: modern aesthetic, clarity, reduced visual noise.
 */
export const outlinePieceSet: PieceSet = {
  name: 'outline',
  displayName: 'Outline',
  description: 'Thick strokes, minimalist design',
  premium: false,
  type: 'svg',
  pieces: {
    wK: OutlineWK,
    wQ: OutlineWQ,
    wR: OutlineWR,
    wB: OutlineWB,
    wN: OutlineWN,
    wP: OutlineWP,
    bK: OutlineBK,
    bQ: OutlineBQ,
    bR: OutlineBR,
    bB: OutlineBB,
    bN: OutlineBN,
    bP: OutlineBP,
  },
};

/**
 * Neon Glow Theme
 * 
 * Cyberpunk-inspired glowing pieces with neon filter effects.
 * Best for: dark mode, futuristic aesthetic, eye-catching design.
 */
export const neonPieceSet: PieceSet = {
  name: 'neon',
  displayName: 'Neon Glow',
  description: 'Cyberpunk glowing effects',
  premium: false,
  type: 'svg',
  pieces: {
    wK: NeonWK,
    wQ: NeonWQ,
    wR: NeonWR,
    wB: NeonWB,
    wN: NeonWN,
    wP: NeonWP,
    bK: NeonBK,
    bQ: NeonBQ,
    bR: NeonBR,
    bB: NeonBB,
    bN: NeonBN,
    bP: NeonBP,
  },
};

/**
 * Glass Theme
 * 
 * Translucent glass effect with soft gradients.
 * Best for: elegant design, light mode, subtle aesthetics.
 */
export const glassPieceSet: PieceSet = {
  name: 'glass',
  displayName: 'Glass',
  description: 'Translucent glass effect',
  premium: false,
  type: 'svg',
  pieces: {
    wK: GlassWK,
    wQ: GlassWQ,
    wR: GlassWR,
    wB: GlassWB,
    wN: GlassWN,
    wP: GlassWP,
    bK: GlassBK,
    bQ: GlassBQ,
    bR: GlassBR,
    bB: GlassBB,
    bN: GlassBN,
    bP: GlassBP,
  },
};

/**
 * Wood Theme
 * 
 * Carved wooden pieces with subtle grain texture.
 * Best for: traditional aesthetic, warm tones, classic feel.
 */
export const woodPieceSet: PieceSet = {
  name: 'wood',
  displayName: 'Wood Carved',
  description: 'Traditional wooden pieces',
  premium: false,
  type: 'svg',
  pieces: {
    wK: WoodWK,
    wQ: WoodWQ,
    wR: WoodWR,
    wB: WoodWB,
    wN: WoodWN,
    wP: WoodWP,
    bK: WoodBK,
    bQ: WoodBQ,
    bR: WoodBR,
    bB: WoodBB,
    bN: WoodBN,
    bP: WoodBP,
  },
};

/**
 * Pixel Theme
 * 
 * Retro 8-bit pixelated style with sharp edges.
 * Best for: nostalgic aesthetic, game feel, playful design.
 */
export const pixelPieceSet: PieceSet = {
  name: 'pixel',
  displayName: 'Pixel Art',
  description: 'Retro 8-bit style',
  premium: false,
  type: 'svg',
  pieces: {
    wK: PixelWK,
    wQ: PixelWQ,
    wR: PixelWR,
    wB: PixelWB,
    wN: PixelWN,
    wP: PixelWP,
    bK: PixelBK,
    bQ: PixelBQ,
    bR: PixelBR,
    bB: PixelBB,
    bN: PixelBN,
    bP: PixelBP,
  },
};

/**
 * Sketch Theme
 * 
 * Hand-drawn sketchy lines with organic feel.
 * Best for: artistic aesthetic, unique look, creative vibe.
 */
export const sketchPieceSet: PieceSet = {
  name: 'sketch',
  displayName: 'Sketch',
  description: 'Hand-drawn artistic style',
  premium: false,
  type: 'svg',
  pieces: {
    wK: SketchWK,
    wQ: SketchWQ,
    wR: SketchWR,
    wB: SketchWB,
    wN: SketchWN,
    wP: SketchWP,
    bK: SketchBK,
    bQ: SketchBQ,
    bR: SketchBR,
    bB: SketchBB,
    bN: SketchBN,
    bP: SketchBP,
  },
};

/**
 * Classic Theme (Emoji Fallback)
 * 
 * Unicode emoji pieces for backward compatibility.
 * DEPRECATED: Will be removed after SVG migration complete.
 */
export const classicPieceSet: PieceSet = {
  name: 'classic',
  displayName: 'Classic',
  description: 'Unicode emoji pieces (legacy)',
  premium: false,
  type: 'emoji',
  pieces: {
    wK: '♔' as any,
    wQ: '♕' as any,
    wR: '♖' as any,
    wB: '♗' as any,
    wN: '♘' as any,
    wP: '♙' as any,
    bK: '♚' as any,
    bQ: '♛' as any,
    bR: '♜' as any,
    bB: '♝' as any,
    bN: '♞' as any,
    bP: '♟' as any,
  },
};

/**
 * Central Piece Set Registry
 * 
 * Add new themes here as they're implemented.
 * Registry is used by Piece component and theme selector UI.
 */
export const pieceSets: Record<PieceTheme, PieceSet> = {
  minimal: minimalPieceSet,
  solid: solidPieceSet,
  outline: outlinePieceSet,
  classic: classicPieceSet,
  neon: neonPieceSet,
  glass: glassPieceSet,
  wood: woodPieceSet,
  pixel: pixelPieceSet,
  sketch: sketchPieceSet,
} as any; // Type assertion for backward compatibility

/**
 * Get piece set metadata
 * 
 * @param theme - Theme identifier
 * @returns Piece set metadata (name, description, premium flag)
 */
export const getPieceSetInfo = (theme: PieceTheme) => {
  const set = pieceSets[theme] || pieceSets.minimal;
  return {
    name: set.name,
    displayName: set.displayName,
    description: set.description,
    premium: set.premium,
    type: set.type,
  };
};

/**
 * Get all available theme names
 * 
 * @returns Array of theme identifiers
 */
export const getAvailableThemes = (): PieceTheme[] => {
  return Object.keys(pieceSets) as PieceTheme[];
};

/**
 * Check if theme is available
 * 
 * @param theme - Theme identifier to check
 * @returns True if theme exists in registry
 */
export const isThemeAvailable = (theme: string): theme is PieceTheme => {
  return theme in pieceSets;
};
