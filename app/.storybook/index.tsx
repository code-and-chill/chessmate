import { getStorybookUI } from '@storybook/react-native';
import './storybook.requires';

const StorybookUIRoot = getStorybookUI({
  enableWebsockets: true,
  onDeviceUI: true,
});

export default StorybookUIRoot;
