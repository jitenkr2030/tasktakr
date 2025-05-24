import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { API_URL } from './src/config';

// Configure the app to use the correct API URL
if (!global.API_URL) {
  global.API_URL = API_URL;
}

// Register the app component
if (Platform.OS === 'web') {
  AppRegistry.registerComponent('main', () => App);
  AppRegistry.runApplication('main', {
    rootTag: document.getElementById('root')
  });
} else {
  registerRootComponent(App);
}
