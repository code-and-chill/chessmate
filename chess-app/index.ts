import { registerRootComponent } from 'expo';
import { initializeConfiguration } from './src/config';
import App from './src/App';

// Initialize configuration system at startup (before any other initialization)
const config = initializeConfiguration();
if (__DEV__) {
  console.log(`[App] Initialized in ${config.environment} environment`);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
