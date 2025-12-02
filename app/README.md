# ChessMate Mobile/Web App

Cross-platform chess application for iOS, Android, and Web built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start
```

### Run on Platform

```bash
# iOS
pnpm ios

# Android
pnpm android

# Web
pnpm web
```

## 📚 Documentation

**Complete documentation is in [`docs/`](./docs/)**

### Essential Reading
- **[docs/overview.md](./docs/overview.md)** — Complete app overview (READ THIS FIRST)
- **[docs/getting-started.md](./docs/getting-started.md)** — Developer setup guide
- **[docs/ai-agent-quick-reference.md](./docs/ai-agent-quick-reference.md)** — For AI-assisted development

### Architecture & Design
- **[docs/design-language-system.md](./docs/design-language-system.md)** — Complete DLS (1850+ lines)
- [docs/architecture.md](./docs/architecture.md) — System design
- [docs/folder-structure-convention.md](./docs/folder-structure-convention.md) — Structure rules

### Development
- [docs/component-index.md](./docs/component-index.md) — Component catalog
- [docs/hooks.md](./docs/hooks.md) — Custom hooks reference
- [docs/api-layer.md](./docs/api-layer.md) — API integration
- [docs/i18n.md](./docs/i18n.md) — Internationalization

### Operations
- [docs/operations.md](./docs/operations.md) — Deployment & monitoring
- [docs/how-to/](./docs/how-to/) — Practical guides

## 🏗️ Project Structure

```
app/
├── app/              # Expo Router (file-based routing)
├── features/         # Feature modules (vertical slices)
├── ui/               # Design system
│   ├── primitives/   # Base components
│   ├── components/   # Compound components
│   └── tokens/       # Design tokens
├── services/         # External integrations (API, WebSocket)
├── core/             # Core utilities
├── platform/         # Platform-specific code
└── docs/             # Documentation
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

## 🔧 Common Tasks

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Clear cache
pnpm clear
```

## 📦 Build & Deploy

```bash
# Build for production
pnpm build

# iOS build
pnpm build:ios

# Android build
pnpm build:android

# Web build
pnpm build:web
```

## 🌍 Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)

## 🤝 Contributing

1. Read [AGENTS.md](../AGENTS.md) for repository conventions
2. Check [docs/ai-agent-quick-reference.md](./docs/ai-agent-quick-reference.md) for file placement
3. Follow [docs/folder-structure-convention.md](./docs/folder-structure-convention.md) strictly
4. Review [docs/architecture.md](./docs/architecture.md) before making changes

## 📝 Tech Stack

- **Framework**: React Native (Expo)
- **Routing**: Expo Router (file-based)
- **State**: React Context + React Query
- **UI**: Custom Design Language System
- **Testing**: Jest + React Testing Library + Detox
- **Languages**: TypeScript
- **Build**: EAS Build

## 🐛 Troubleshooting

See [docs/how-to/troubleshooting.md](./docs/how-to/troubleshooting.md) for common issues.

## 📖 Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native docs](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

**For comprehensive documentation, see [`docs/README.md`](./docs/README.md)**
