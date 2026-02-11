import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

const fontConfig = {
  fontFamily: Platform.select({
    web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    ios: 'System',
    default: 'sans-serif',
  }),
};

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2', // Medical Blue
    secondary: '#4CAF50', // Health Green
    tertiary: '#FF9800', // Warning Orange
    error: '#F44336', // Danger Red
  },
  fonts: configureFonts({config: fontConfig}),
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9', // Lighter Blue for Dark Mode
    secondary: '#81C784',
    tertiary: '#FFB74D',
    error: '#E57373',
    background: '#121212',
    surface: '#1E1E1E',
  },
  fonts: configureFonts({config: fontConfig}),
};