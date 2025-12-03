/**
 * MATERIAL TEXTURE TOKENS
 * 
 * Visual texture patterns and materials for enhanced board rendering.
 * Provides optional overlays for premium aesthetic beyond flat colors.
 * 
 * Material Types:
 * - Wood: Grain patterns for classic board feel
 * - Marble: Veined patterns for elegant aesthetic
 * - Leather: Textured surface for premium feel
 * - Cloth: Fabric texture for tournament boards
 * - Stone: Natural patterns for depth
 * 
 * Implementation:
 * - SVG patterns (lightweight, scalable, cross-platform)
 * - CSS background-image for web
 * - React Native Image overlay with low opacity
 * 
 * @packageDocumentation
 */

/**
 * SVG pattern definitions for textures
 * These can be rendered as <defs> in SVG or converted to data URIs
 */
export const svgPatterns = {
  woodGrain: `
    <pattern id="wood-grain" patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="#D4A574"/>
      <path d="M0,10 Q25,8 50,10 T100,10" stroke="#B8935A" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M0,20 Q25,22 50,20 T100,20" stroke="#B8935A" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M0,35 Q25,33 50,35 T100,35" stroke="#9A7B4F" stroke-width="0.8" fill="none" opacity="0.4"/>
      <path d="M0,55 Q25,57 50,55 T100,55" stroke="#B8935A" stroke-width="0.5" fill="none" opacity="0.3"/>
      <path d="M0,70 Q25,68 50,70 T100,70" stroke="#9A7B4F" stroke-width="0.6" fill="none" opacity="0.3"/>
      <path d="M0,85 Q25,87 50,85 T100,85" stroke="#B8935A" stroke-width="0.5" fill="none" opacity="0.3"/>
    </pattern>
  `,

  marbleVeins: `
    <pattern id="marble-veins" patternUnits="userSpaceOnUse" width="200" height="200">
      <rect width="200" height="200" fill="#F5F5F5"/>
      <path d="M0,50 Q50,45 100,50 T200,50" stroke="#D1D5DB" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M0,120 Q50,115 100,120 T200,120" stroke="#9CA3AF" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M50,0 Q45,50 50,100 T50,200" stroke="#D1D5DB" stroke-width="1" fill="none" opacity="0.5"/>
      <path d="M150,0 Q155,50 150,100 T150,200" stroke="#D1D5DB" stroke-width="1.2" fill="none" opacity="0.5"/>
    </pattern>
  `,

  leatherTexture: `
    <pattern id="leather-texture" patternUnits="userSpaceOnUse" width="50" height="50">
      <rect width="50" height="50" fill="#8B4513"/>
      <circle cx="10" cy="10" r="1" fill="#654321" opacity="0.4"/>
      <circle cx="30" cy="15" r="1" fill="#654321" opacity="0.4"/>
      <circle cx="20" cy="30" r="1" fill="#654321" opacity="0.4"/>
      <circle cx="40" cy="35" r="1" fill="#654321" opacity="0.4"/>
      <circle cx="15" cy="40" r="1" fill="#654321" opacity="0.4"/>
    </pattern>
  `,

  clothWeave: `
    <pattern id="cloth-weave" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="#E8E8E8"/>
      <line x1="0" y1="0" x2="10" y2="0" stroke="#D4D4D4" stroke-width="1"/>
      <line x1="0" y1="5" x2="10" y2="5" stroke="#D4D4D4" stroke-width="1"/>
      <line x1="0" y1="10" x2="10" y2="10" stroke="#D4D4D4" stroke-width="1"/>
      <line x1="0" y1="0" x2="0" y2="10" stroke="#D4D4D4" stroke-width="1"/>
      <line x1="5" y1="0" x2="5" y2="10" stroke="#D4D4D4" stroke-width="1"/>
      <line x1="10" y1="0" x2="10" y2="10" stroke="#D4D4D4" stroke-width="1"/>
    </pattern>
  `,

  stoneGranite: `
    <pattern id="stone-granite" patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="#6B7280"/>
      <circle cx="20" cy="30" r="2" fill="#4B5563" opacity="0.6"/>
      <circle cx="50" cy="45" r="3" fill="#374151" opacity="0.7"/>
      <circle cx="80" cy="20" r="2" fill="#4B5563" opacity="0.6"/>
      <circle cx="30" cy="70" r="2.5" fill="#1F2937" opacity="0.5"/>
      <circle cx="70" cy="80" r="2" fill="#4B5563" opacity="0.6"/>
      <circle cx="40" cy="15" r="1.5" fill="#374151" opacity="0.5"/>
      <circle cx="60" cy="60" r="2" fill="#1F2937" opacity="0.6"/>
    </pattern>
  `,

  noiseTexture: `
    <filter id="noise-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="multiply" result="blend"/>
    </filter>
  `,
};

/**
 * Material configuration
 * Defines texture properties and how they should be applied
 */
export const materialTokens = {
  wood: {
    name: 'Wood',
    pattern: 'woodGrain',
    opacity: 0.15,
    blendMode: 'multiply' as const,
    description: 'Natural wood grain for classic boards',
  },
  marble: {
    name: 'Marble',
    pattern: 'marbleVeins',
    opacity: 0.2,
    blendMode: 'multiply' as const,
    description: 'Elegant marble veins for premium aesthetic',
  },
  leather: {
    name: 'Leather',
    pattern: 'leatherTexture',
    opacity: 0.25,
    blendMode: 'overlay' as const,
    description: 'Textured leather for luxurious feel',
  },
  cloth: {
    name: 'Cloth',
    pattern: 'clothWeave',
    opacity: 0.1,
    blendMode: 'multiply' as const,
    description: 'Fabric weave for tournament boards',
  },
  stone: {
    name: 'Stone',
    pattern: 'stoneGranite',
    opacity: 0.18,
    blendMode: 'multiply' as const,
    description: 'Stone texture for natural depth',
  },
  noise: {
    name: 'Noise',
    pattern: 'noiseTexture',
    opacity: 0.05,
    blendMode: 'overlay' as const,
    description: 'Subtle grain for any surface',
  },
  none: {
    name: 'None',
    pattern: null,
    opacity: 0,
    blendMode: 'normal' as const,
    description: 'No texture overlay',
  },
} as const;

/**
 * Material type
 */
export type MaterialType = keyof typeof materialTokens;

/**
 * Get material configuration
 */
export const getMaterial = (material: MaterialType) => {
  return materialTokens[material];
};

/**
 * Generate SVG pattern data URI for use in CSS/styles
 */
export const getMaterialDataUri = (material: MaterialType): string | null => {
  const config = materialTokens[material];
  if (!config.pattern || config.pattern === 'noiseTexture') return null;

  const pattern = svgPatterns[config.pattern as keyof typeof svgPatterns];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>${pattern}</defs>
      <rect width="100%" height="100%" fill="url(#${config.pattern})"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Piece shadow configuration
 * Adds depth to chess pieces
 */
export const pieceShadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
} as const;

/**
 * Piece shadow type
 */
export type PieceShadowLevel = keyof typeof pieceShadow;

/**
 * Get piece shadow configuration
 */
export const getPieceShadow = (level: PieceShadowLevel = 'medium') => {
  return pieceShadow[level];
};

/**
 * Square highlight glow configuration
 * For selected/hovered squares and pieces
 */
export const squareGlow = {
  none: {
    borderWidth: 0,
    borderColor: 'transparent',
    shadowOpacity: 0,
  },
  subtle: {
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  medium: {
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  strong: {
    borderWidth: 4,
    borderColor: 'rgba(59, 130, 246, 0.7)',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
} as const;

/**
 * Square glow level
 */
export type SquareGlowLevel = keyof typeof squareGlow;

/**
 * Get square glow configuration
 */
export const getSquareGlow = (level: SquareGlowLevel = 'medium') => {
  return squareGlow[level];
};

/**
 * Board edge/border styling
 * Adds physical depth to board edges
 */
export const boardBorder = {
  none: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  simple: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  raised: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  inset: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

/**
 * Board border style
 */
export type BoardBorderStyle = keyof typeof boardBorder;

/**
 * Get board border configuration
 */
export const getBoardBorder = (style: BoardBorderStyle = 'simple') => {
  return boardBorder[style];
};
