---
title: Chess App
service: chess-app
status: active
last_reviewed: 2025-11-15
type: overview
---

# Chess App – React Native + Expo

A cross-platform chess play experience built with React Native and Expo. Run on iOS, Android, and web.

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI (via `npx expo`)
- (Optional) iOS simulator: Xcode
- (Optional) Android emulator: Android Studio

### Installation

```bash
cd chess-app
npm install
```

### Local Development

Start the development server (Expo GO):

```bash
npm start
```

This opens a terminal menu. Choose your platform:

#### Run on Web (Browser)

```bash
npm run web
```

Opens at `http://localhost:8081` with auto-reload. Best for quick iteration.

#### Run on iOS Simulator

```bash
npm run ios
```

Requires Xcode and simulator running.

#### Run on Android Emulator

```bash
npm run android
```

Requires Android Studio and emulator running.

#### Run on Expo GO (Mobile Device)

```bash
npm start
```

Scan the QR code with your device's camera (iOS) or Expo GO app (Android).

### Type Checking

```bash
npm run typecheck
```

Verifies TypeScript without output. Run before commits.

## Project Structure

```
chess-app/
├── index.ts                     # Expo entry point (registerRootComponent)
├── src/
│   ├── App.tsx                  # Root component
│   ├── api/                     # HTTP clients (3 clients)
│   ├── hooks/                   # Business logic hooks (8 hooks)
│   ├── types/                   # Domain types & interfaces
│   ├── i18n/                    # Internationalization (7 locales)
│   ├── screens/                 # Full-page components (13 screens)
│   │   ├── play/                # Play-related screens (8)
│   │   ├── puzzle/              # Puzzle-related screens (5)
│   │   └── __tests__/           # Screen tests
│   ├── components/              # UI components (20+)
│   │   ├── primitives/          # Base building blocks (Box, Text, Button, Surface)
│   │   ├── compound/            # Reusable complex (ChessBoard, GameActions, etc.)
│   │   ├── play/                # Play feature components
│   │   ├── puzzle/              # Puzzle feature components
│   │   └── identity/            # User/identity components
│   └── ui/                      # Design system
│       ├── theme/               # Theme configuration
│       └── tokens/              # Colors, spacing, typography
├── docs/
│   ├── FOLDER_STRUCTURE.md      # Complete structure guide
│   ├── COMPONENT_INDEX.md       # Component reference
│   ├── MIGRATION_SUMMARY.md     # Architecture migration details
│   ├── ARCHITECTURE.md          # Technical design
│   ├── overview.md              # Feature overview
│   └── ...
├── app.json                     # Expo config (platforms, splash, icons)
├── metro.config.js              # Metro bundler config
├── tsconfig.json                # TypeScript config
├── package.json
└── README.md
```

**📚 New Structure Documentation**:
- **[FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md)** – Complete directory layout with all files
- **[COMPONENT_INDEX.md](./docs/COMPONENT_INDEX.md)** – Quick reference for all components
- **[MIGRATION_SUMMARY.md](./docs/MIGRATION_SUMMARY.md)** – November 2025 architecture migration details

## Build for Production

### Web Export

```bash
npm run build:web
```

Outputs static files to `dist/` for deployment (Vercel, Netlify, etc.).

### iOS App Store

```bash
npm run build:ios
```

Creates `.ipa` for TestFlight/App Store (requires EAS account).

### Google Play

```bash
npm run build:android
```

Creates `.aab` for Google Play (requires EAS account).

## Configuration

### API Base URL

In `src/core/hooks/useGame.ts`, update the base URL:

```tsx
const baseUrl = process.env.REACT_APP_LIVE_GAME_API_URL || 'http://localhost:8001';
```

### App Branding

Edit `app.json`:

```json
{
  "expo": {
    "name": "Chessmate",
    "slug": "chessmate",
    "version": "0.1.0",
    "ios": {
      "bundleIdentifier": "com.chessmate.app"
    },
    "android": {
      "package": "com.chessmate.app"
    }
  }
}
```

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm start` | Start Expo dev server |
| `npm run web` | Run on web (browser) |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run build:web` | Export web static files |
| `npm run build:ios` | Build for App Store |
| `npm run build:android` | Build for Google Play |
| `npm run typecheck` | Type-check TypeScript |
| `npm run clean` | Remove dist/ and .expo/ |

## Troubleshooting

### Port 8081 already in use

```bash
# Kill the process or use a different port
npx expo start --web --port 3000
```

### Module not found errors

Clear cache and reinstall:

```bash
npm run clean
rm -rf node_modules
npm install
```

### TypeScript errors

Re-run type-check:

```bash
npm run typecheck
```

Fix any reported errors before building.

### Platform-specific issues

- **iOS**: Ensure Xcode is installed and Simulator is running
- **Android**: Check Android Studio paths and emulator status
- **Web**: Clear browser cache if styles look wrong

## Architecture

### Core Module (`src/core/`)

Business logic, type definitions, and API clients. No UI dependencies.

- **models/**: TypeScript types matching backend contracts
- **api/**: HTTP client (`LiveGameApiClient`)
- **hooks/**: React hooks (`useGame`, `useAuth`)

### UI Module (`src/ui/`)

Cross-platform React Native components and design system.

- **tokens/**: Design system (colors, spacing, typography)
- **components/primitives/**: Base components (Box, Text, Button, Surface)
- **components/compound/**: Chess-specific (ChessBoard, PlayerPanel, MoveList)
- **screens/**: Full-page compositions (PlayScreen)

### Entry Point (`index.ts`)

Registers the Expo app with the platform:

```tsx
import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
```

Handles web, iOS, and Android initialization.

## Development Workflow

1. **Local dev**: `npm run web` for fastest iteration
2. **Type-check**: `npm run typecheck` before commits
3. **Test on device**: `npm start` + Expo GO or simulator
4. **Build**: `npm run build:web/ios/android` for distribution

## Dependencies

- **expo**: Cross-platform framework
- **react**: UI library
- **react-native**: Mobile framework
- **react-native-web**: Web support
- **typescript**: Type safety

## Further Reading

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Metro Bundler](https://facebook.github.io/metro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Support

For issues or questions:
1. Check this README and linked documentation
2. Review `src/core/` and `src/ui/` module READMEs
3. Inspect error logs from `npm start` or simulator
4. File an issue on the repository

---

**Chessmate Team** • MIT License
