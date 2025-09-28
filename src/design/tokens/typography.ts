import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  giant: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '200' as const,
    letterSpacing: -1,
    fontFamily,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
    fontFamily,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
    fontFamily,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500' as const,
    fontFamily,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily,
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    fontFamily,
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    fontFamily,
  },
};