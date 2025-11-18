---
title: Local Development Setup
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Local Development Setup

Guide to set up chess-app for local development.

## Prerequisites

- Node.js 16+ and npm
- React Native CLI (for mobile development)
- Git
- Xcode (macOS, for iOS development)
- Android Studio (for Android development)

## Web Development

### 1. Navigate to Project

```bash
cd /workspaces/chessmate/chess-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create .env File

```bash
cp .env.example .env  # if exists
```

Configure API endpoints:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ACCOUNT_API=http://localhost:8001
REACT_APP_LIVE_GAME_API=http://localhost:8002
```

### 4. Run Development Server

```bash
npm start
```

Web app available at `http://localhost:3000`

## Mobile Development

### React Native Setup

```bash
# Install Expo CLI
npm install -g expo-cli

# Install dependencies
npm install
```

### iOS Development

```bash
# Build for iOS
npm run build:ios

# Run on iOS simulator
npm run ios
```

### Android Development

```bash
# Build for Android
npm run build:android

# Run on Android emulator
npm run android
```

## Running Tests

```bash
npm test
npm test -- --coverage
```

---

*Last updated: 2025-11-15*
