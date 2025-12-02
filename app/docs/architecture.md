---
title: Chess App Architecture
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: architecture
---

# Chess App Architecture

Client architecture for mobile (React Native) and web (React) platforms.

## Architecture Overview

### Web Architecture (React)

```
index.tsx
  ↓
App.tsx
  ├─ AuthProvider (JWT token management)
  ├─ Router
  │   ├─ LoginPage
  │   ├─ LobbyPage
  │   ├─ PlayScreen
  │   ├─ ProfilePage
  │   └─ SettingsPage
  └─ ApiClient (Axios with auth interceptor)
```

### Mobile Architecture (React Native)

```
index.ts
  ↓
App.tsx
  ├─ AuthContext (SecureStorage for tokens)
  ├─ Navigation
  │   ├─ LoginNavigator
  │   ├─ LobbyNavigator
  │   ├─ PlayNavigator
  │   └─ ProfileNavigator
  └─ ApiClient
```

## State Management

### Authentication State
- User ID
- JWT token (stored securely)
- Roles/permissions
- Auto-refresh on expiry

### Game State
- Current game ID
- Board position (FEN)
- Move history
- Player perspective (white/black)
- Timer state

### UI State
- Active screen/tab
- Loading/error states
- Preferences (theme, sounds, etc.)

## Component Hierarchy

### Common Components
- **Board**: Chess board visualization
- **MoveInput**: Handle player moves
- **PlayerInfo**: Display opponent/player info
- **GameClock**: Display time controls

### Screen Components
- **LobbyScreen**: Queue and games list
- **PlayScreen**: Live game interface
- **ProfileScreen**: Player profile and stats

## API Integration

### Authentication Flow
1. User enters credentials
2. `POST /v1/auth/login` → JWT token
3. Store token in secure storage
4. All subsequent requests include `Authorization: Bearer {token}`

### Real-time Updates
- WebSocket connection to `/ws/games/{game_id}`
- Receives opponent moves in real-time
- Broadcasts local moves to opponent

## Build and Deployment

### Web Build
```bash
npm run build  # Creates dist/ with optimized bundle
```

### Mobile Build
```bash
npm run build:ios   # Creates iOS app
npm run build:android # Creates Android app
```

### Environment Configuration
- Injected at build time for web
- Packaged in app for mobile
- Supports staging and production endpoints

## Performance Optimization

- Code splitting for lazy loading
- Image optimization and compression
- Minimal re-renders via React.memo
- Efficient WebSocket usage (single connection per game)

---

*Last updated: 2025-11-15*
