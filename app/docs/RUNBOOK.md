---
title: Chess App Operational Runbook
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: operations
---

# Chess App - Operational Runbook

## Web Deployment

### Prerequisites

- Node.js 18+
- npm or yarn

### Build

```bash
npm ci
npm run build
```

Output: `dist/` directory (static files)

### Deployment

**Staging**:
```bash
npm run deploy:staging
```

**Production**:
```bash
npm run deploy:production
```

### Configuration

Environment variables (injected at build time):

```env
REACT_APP_API_URL=https://api.example.com
REACT_APP_ACCOUNT_API=https://account.example.com
REACT_APP_LIVE_GAME_API=https://game.example.com
REACT_APP_MATCHMAKING_API=https://matchmaking.example.com
```

## Mobile Deployment

### iOS Deployment

```bash
npm run build:ios
# Then use Xcode or fastlane to deploy to App Store
```

### Android Deployment

```bash
npm run build:android
# Then use Play Console to deploy to Google Play
```

## Monitoring

### Web Monitoring

- Page load time (target < 2 seconds)
- JavaScript errors (Sentry integration)
- API response times
- User engagement metrics

### Mobile Monitoring

- Crash rates (Crashlytics)
- Startup time (target < 3 seconds)
- Memory usage
- Battery consumption

## Incident Response

**Issue**: Blank screen on load

**Steps**:
1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check JWT token in local storage
4. Clear browser cache and reload

**Resolution**:
- Deploy hotfix if it's a code issue
- Check API service health if connectivity issue

**Issue**: WebSocket connection fails

**Steps**:
1. Check live-game-api WebSocket endpoint
2. Verify firewall allows WebSocket connections
3. Check browser network tab for connection details

**Resolution**:
- Restart live-game-api if down
- Check network configuration on client

## Maintenance

### Regular Updates

- Update dependencies monthly: `npm update`
- Security audit: `npm audit` (fix high/critical issues)
- Run tests: `npm test` before deployment

### Performance Optimization

- Monitor bundle size
- Optimize images for mobile
- Implement code splitting for large features

---

*Last updated: 2025-11-15*
