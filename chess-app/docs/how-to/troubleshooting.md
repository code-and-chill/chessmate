---
title: Troubleshooting Guide
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Troubleshooting Guide

Common issues and solutions.

## Setup Issues

### Node Modules Installation Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Use legacy peer dependencies resolution
npm install --legacy-peer-deps

# Or force resolution
npm install --force
```

### Port 3000 Already in Use

**Error**: `address already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

## API Connection Issues

### API Requests Failing

**Error**: CORS error or connection refused

**Solution**:
1. Verify .env API URLs are correct
2. Ensure backend services are running
3. Check CORS configuration on backend
4. Clear browser cache: Ctrl+Shift+Delete

### Token/Authentication Issues

**Error**: 401 Unauthorized

**Solution**:
- Clear localStorage: Open DevTools → Application → Clear storage
- Re-login
- Check JWT token expiration

## Mobile Development

### iOS Simulator Not Found

**Error**: `xcrun: error: unable to find simulator`

**Solution**:
```bash
# List available simulators
xcrun simctl list

# Create new simulator if needed
xcrun simctl create "iPhone 14" com.apple.CoreSimulator.SimDeviceType.iPhone-14 com.apple.CoreSimulator.SimRuntime.iOS-16-4
```

### Android Emulator Issues

**Error**: `Unable to start Android emulator`

**Solution**:
```bash
# List available emulators
emulator -list-avds

# Kill existing emulator processes
pkill emulator

# Start emulator explicitly
emulator -avd Pixel_5_API_30
```

---

*Last updated: 2025-11-15*
