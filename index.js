import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It ensures that whether the app is loaded in Expo or standalone APK,
// the root component is registered correctly and the JS bundle boots offline.
registerRootComponent(App);
