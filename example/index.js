import { AppRegistry } from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('main', () => App);

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
