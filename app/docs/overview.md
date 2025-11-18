---
title: App Overview
service: app
status: active
last_reviewed: 2025-11-18
type: overview
---

# ChessMate App Overview

## Purpose

ChessMate App is the cross-platform mobile and web client for the ChessMate chess platform. It provides a Chess.com-grade user experience for playing, learning, and engaging with chess.

**Platforms Supported:**
- 📱 iOS (React Native via Expo)
- 🤖 Android (React Native via Expo)
- 🌐 Web (React via react-native-web)

**Backend Services:**
- `account-api` — Authentication, user profiles, account management
- `live-game-api` — Real-time game state, moves, WebSocket synchronization
- `puzzle-api` — Tactical puzzles, daily puzzles, puzzle ratings
- `rating-api` — Player ratings, leaderboards, ELO calculations
- `matchmaking-api` — Opponent matching, queue management

## Core Philosophy

### 1. Cross-Platform Consistency
One codebase serves mobile and web with platform-appropriate adaptations.

### 2. Feature Modularity
Features are self-contained vertical slices with clear boundaries.

### 3. Design System First
Shared UI components and design tokens ensure visual consistency across all screens.

### 4. Separation of Concerns
- **Presentation** — UI components (dumb, reusable)
- **Logic** — Hooks and state management (testable, isolated)
- **Integration** — API clients and WebSocket services (decoupled)

### 5. AI-Assisted Development
Folder structure and naming conventions optimized for AI code generation and maintainability.

---

## Application Structure

### Current Structure

The app currently uses a **flat, modular structure** with the following top-level folders:

```
app/
├── api/           # HTTP clients and API integrations
├── app/           # Expo Router (file-based routing)
├── assets/        # Images, fonts, sounds, piece sets
├── components/    # UI components (primitives, compound, feature-specific)
├── config/        # App configuration
├── constants/     # Global constants
├── contexts/      # React Context providers
├── docs/          # Documentation (this folder)
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization (7 languages)
├── mocks/         # Mock data for testing
├── screens/       # Screen components
├── scripts/       # Build and automation scripts
├── styles/        # Global styles
├── types/         # TypeScript type definitions
├── ui/            # Design system (tokens, theme)
└── utils/         # Utility functions
```

### Target Structure (Production-Grade)

The app is migrating to a **vertical slice architecture** with horizontal shared layers:

```
app/
├── app/           # 🚀 Expo Router (file-based routing)
├── features/      # 🎯 Vertical domain slices (board, game, puzzles, matchmaking)
├── ui/            # 🎨 Design system (primitives, tokens, theme)
├── services/      # 🌐 External integrations (API, WebSocket, storage)
├── core/          # 🛠️ Domain-agnostic utilities (utils, hooks, state)
├── platform/      # ⚙️ Cross-cutting concerns (security, monitoring)
├── assets/        # 📦 Static resources (images, fonts, sounds)
├── types/         # 🔷 Global type definitions
├── docs/          # 📚 Documentation
└── __tests__/     # 🧪 Root-level tests (e2e, integration)
```

**Key Principles:**
- ✅ **Vertical slicing** — Features are self-contained
- ✅ **Horizontal layering** — Shared concerns at bottom
- ✅ **Unidirectional dependencies** — No circular imports
- ✅ **Public APIs** — Import from folders via `index.ts`

**See:** [folder-structure-convention.md](./folder-structure-convention.md) for detailed specification.

---

## Feature Domains

### Play (Live Games)

The core game experience with multiple modes:

**Online Play**
- Time control selection (Blitz, Rapid, Classical)
- Matchmaking with rating-based pairing
- Real-time gameplay with WebSocket synchronization
- Move validation and chess engine integration

**Play vs Bot**
- Difficulty levels (800-2000+ ELO)
- AI opponent powered by Stockfish
- Instant game start, no waiting

**Friend Challenge**
- Private game creation via game ID
- Direct challenge to friends
- Custom time controls

**Components:**
- Chess board with drag-and-drop piece interaction
- Player panels with avatar, username, rating, clock
- Move history with algebraic notation
- Game controls (resign, offer draw, settings)
- Game over modal with result and rating change

### Puzzles (Tactical Training)

Daily puzzles and tactical training system:

**Daily Puzzle**
- One featured puzzle per day
- Shareable results
- Streak tracking

**Tactics Trainer**
- Rating-based puzzle system
- Category selection (forks, pins, discovered attacks, etc.)
- Performance tracking and statistics

**Puzzle Play**
- Interactive board with move validation
- Hint system
- Solution reveal
- Success/failure feedback

### Learn (Educational Content)

Structured learning paths:

**Lessons**
- Beginner, Intermediate, Advanced categories
- Interactive lessons with board demonstrations
- Completion tracking

**Tactics Trainer**
- Puzzle categories by tactical motif
- Spaced repetition

**Game Review**
- Past game analysis
- Accuracy metrics
- Blunder/mistake highlights

**Openings Explorer**
- Opening database with ECO codes
- Win rate statistics
- Game examples

### Social (Community Features)

**Friends**
- Friend list with online status
- Quick challenge
- Friend search and management

**Clubs**
- Club creation and joining
- Member lists
- Activity tracking

**Messages**
- Direct messaging
- Club chat
- Unread indicators

**Leaderboards**
- Global rankings
- Friends rankings
- Club rankings

### Settings (Personalization)

**Profile**
- Avatar, username, bio, country
- Profile editing

**Statistics**
- Rating history across time controls
- Win/loss records
- Performance insights

**Achievements**
- Badge system (45 milestones)
- Progress tracking
- Unlock states

**Game Preferences**
- Board themes (10+ options)
- Piece sets (classic, modern, neo, 3D)
- Sound effects
- Animation settings
- Gameplay options (auto-queen, legal moves, premoves)

**Appearance**
- Light/dark/auto theme
- Language selection (7 languages)
- Time format
- Notation style
- Accessibility options

---

## Design System

### Design Tokens

Centralized design values for consistency:

**Colors** (`ui/tokens/colors.ts`)
- Primary, secondary, accent palettes
- Semantic colors (success, error, warning, info)
- Surface colors (background, card, modal)
- Text colors (primary, secondary, muted)
- Chess-specific colors (light square, dark square, legal move, selected)

**Spacing** (`ui/tokens/spacing.ts`)
- 4px base unit
- Scale: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48), xxxl(64)

**Typography** (`ui/tokens/typography.ts`)
- Font families (primary, monospace for notation)
- Font sizes (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- Font weights (light, regular, medium, semibold, bold)
- Line heights

**Borders** (`ui/tokens/borders.ts`)
- Border radii (none, sm, md, lg, full)
- Border widths (thin, medium, thick)

**Shadows** (`ui/tokens/shadows.ts`)
- Elevation levels (sm, md, lg, xl)

**Animations** (`ui/tokens/animations.ts`)
- Duration (fast, base, slow)
- Easing functions (ease-in, ease-out, ease-in-out)

### Theme System

**ThemeProvider** (`ui/theme/ThemeProvider.tsx`)
- Context-based theme management
- Light/dark theme switching
- Auto theme based on system preference
- Persistent theme selection

**useTheme Hook** (`ui/theme/useTheme.ts`)
- Access current theme
- Toggle theme
- Theme-aware color values

**Themes:**
- `light.ts` — Light mode color scheme
- `dark.ts` — Dark mode color scheme

### UI Components

**Primitives** (`ui/primitives/`)
- `Box` — Flexbox container with spacing props
- `Text` — Typography with theme variants
- `Button` — Interactive button with variants (primary, secondary, outline, ghost)
- `Surface` — Card/panel with elevation
- `Input` — Text input with validation states
- `Avatar` — User avatar with fallback
- `Badge` — Status indicators
- `Modal` — Dialog overlays
- `Tooltip` — Hover information
- `Spinner` — Loading indicators

**Compound Components** (`components/compound/`)
- `ChessBoard` — Full chess board with pieces
- `Square` — Individual board square
- `Piece` — Chess piece component
- `PlayerPanel` — Player info + clock
- `MoveList` — Move history display
- `GameActions` — In-game controls

---

## Internationalization (i18n)

### Supported Languages

1. **English** (`en`) — Default
2. **Spanish** (`es`)
3. **French** (`fr`)
4. **German** (`de`)
5. **Japanese** (`ja`)
6. **Russian** (`ru`)
7. **Chinese Simplified** (`zh`)

### Translation Structure

**Namespaces:**
- `common` — Shared translations (buttons, labels, errors)
- `play` — Play feature translations
- `puzzle` — Puzzle feature translations
- `learn` — Learn feature translations
- `social` — Social feature translations
- `settings` — Settings translations
- `navigation` — Navigation labels

**Usage:**
```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation('play');
  return <Text>{t('findMatch')}</Text>;
}
```

**Dynamic Language Switching:**
Users can change language in Settings → Appearance → Language.

**See:** [i18n.md](./i18n.md) for detailed internationalization guide.

---

## API Integration

### HTTP Clients

**Base Client** (`api/client.ts`)
- Axios-based HTTP client
- Request/response interceptors
- Error handling
- Retry logic

**Service Clients:**
- `playApi.ts` — Live game API (`live-game-api`)
- `puzzleApi.ts` — Puzzle API (`puzzle-api`)
- `accountApi.ts` — Account API (`account-api`)
- `ratingApi.ts` — Rating API (`rating-api`)
- `matchmakingApi.ts` — Matchmaking API (`matchmaking-api`)

**See:** [api.md](./api.md) for API documentation.

### WebSocket Integration

**GameWebSocket** (planned)
- Real-time game state updates
- Move synchronization
- Clock updates
- Connection management
- Reconnection logic

**MatchmakingWebSocket** (planned)
- Queue status updates
- Match found notifications

---

## State Management

### Current Approach

**React Context** (`contexts/`)
- AuthContext — Authentication state
- ThemeContext — Theme preferences

**React Query** (`hooks/`)
- Server state management
- Automatic caching and refetching
- Optimistic updates

**Local State** (useState)
- Component-level UI state

### Target Approach

**Global State** (`core/state/`)
- Redux Toolkit or Zustand
- Auth slice
- User slice
- Settings slice

**Feature State** (`features/*/state/`)
- Game slice (game state, moves, clocks)
- Puzzle slice (puzzle state, hints, solutions)
- Matchmaking slice (queue status, matched opponent)

---

## Testing Strategy

### Unit Tests
- Utils, hooks, pure functions
- Co-located with source files
- Jest + React Testing Library

### Component Tests
- UI component behavior
- User interaction
- Accessibility

### Integration Tests
- API integration
- WebSocket connection
- Multi-component workflows

### End-to-End Tests
- Critical user flows
- Play a game
- Solve a puzzle
- Matchmaking

**Test Coverage Target:** 80% overall, 100% for critical paths

---

## Performance

### Optimization Strategies

1. **Code Splitting**
   - Lazy load features
   - Route-based splitting
   - Component-level splitting for heavy features

2. **Memoization**
   - React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for stable function references

3. **Asset Optimization**
   - SVG for chess pieces (scalable, small)
   - WebP for images
   - Compressed sounds

4. **List Virtualization**
   - FlatList for long lists (games, puzzles)
   - Windowing for move history

5. **Network Optimization**
   - Request batching
   - Caching strategies
   - Compression

### Performance Monitoring

- Expo Performance Monitor
- React DevTools Profiler
- Lighthouse for web
- Frame rate monitoring

---

## Security

### Authentication

- JWT-based authentication
- Token refresh mechanism
- Secure token storage (Expo SecureStore on mobile)

### Data Protection

- HTTPS for all API calls
- WebSocket over WSS
- Input sanitization
- XSS prevention

### Privacy

- GDPR compliance
- User data minimization
- Consent management
- Data export/deletion

---

## Accessibility

### WCAG 2.1 Compliance

- Level AA target
- Semantic HTML (web)
- Screen reader support
- Keyboard navigation
- Touch target sizes (44x44pt minimum)

### Accessible Features

- High contrast mode
- Font scaling
- Alternative text for images
- Focus indicators
- Accessible forms

---

## Build & Deployment

### Development

```bash
npm run dev              # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm run web              # Run on web browser
```

### Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run lint             # Lint code
npm run type-check       # TypeScript validation
```

### Building

```bash
npm run build:ios        # Build iOS app
npm run build:android    # Build Android app
npm run build:web        # Build web app
```

### Deployment

- **Mobile:** EAS Build → App Store / Google Play
- **Web:** Static hosting (Vercel, Netlify, Cloudflare Pages)

---

## Related Documentation

### Architecture & Design
- [architecture.md](./architecture.md) — System design and technical architecture
- [folder-structure-convention.md](./folder-structure-convention.md) — Production-grade structure spec
- [folder-structure-visual.md](./folder-structure-visual.md) — Visual diagrams and flows
- [domain.md](./domain.md) — Chess domain concepts and glossary

### Development Guides
- [getting-started.md](./getting-started.md) — Setup guide for new developers
- [how-to/local-dev.md](./how-to/local-dev.md) — Local development workflow
- [how-to/migration-to-production-structure.md](./how-to/migration-to-production-structure.md) — Migration guide
- [ai-agent-quick-reference.md](./ai-agent-quick-reference.md) — Quick reference for AI agents

### Component & API References
- [component-index.md](./component-index.md) — Component catalog
- [hooks.md](./hooks.md) — Custom hooks documentation
- [api.md](./api.md) — API client documentation
- [i18n.md](./i18n.md) — Internationalization guide

### Operations
- [operations.md](./operations.md) — Deployment and monitoring
- [decisions/](./decisions/) — Architecture Decision Records (ADRs)

---

## Roadmap

### Phase 1: MVP (Completed)
- ✅ Basic play screen
- ✅ Chess board with drag-and-drop
- ✅ Player panels and clocks
- ✅ Move list
- ✅ Game controls

### Phase 2: Design System (Completed)
- ✅ Design tokens
- ✅ Theme system (light/dark)
- ✅ UI primitives (Button, Text, Input, etc.)
- ✅ Internationalization (7 languages)

### Phase 3: Features (In Progress)
- ✅ Play hub with multiple modes
- ✅ Puzzle system
- ✅ Learn module
- ⏳ Social features
- ⏳ Settings and personalization

### Phase 4: Production-Grade Structure (Planned)
- ⏳ Migrate to vertical slice architecture
- ⏳ Extract features (board, game, puzzles, matchmaking)
- ⏳ Refactor services layer
- ⏳ Add platform layer (security, monitoring)

### Phase 5: Advanced Features (Future)
- 🔮 Tournament system
- 🔮 AI coaching and analysis
- 🔮 Streaming and spectating
- 🔮 Advanced social features (clubs, forums)
- 🔮 Monetization (subscriptions, premium features)

---

*Last updated: 2025-11-18*
