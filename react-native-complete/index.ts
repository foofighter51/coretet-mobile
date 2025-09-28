/**
 * CoreTet Design System - React Native Complete Implementation
 * Final cleaned version with exact specifications
 */

// Export design tokens
export { designTokens } from './tokens';
export { globalStyles, componentStyles, layoutStyles } from './styles';

// Export components
export {
  Button,
  ButtonProps,
} from './components/Button';

export {
  Input,
  InputProps,
} from './components/Input';

export {
  Text,
  TextProps,
} from './components/Text';

export {
  TrackCard,
  TrackCardProps,
} from './components/TrackCard';

export {
  TabBar,
  TabBarProps,
  TabItem,
} from './components/TabBar';

export {
  Avatar,
  AvatarProps,
} from './components/Avatar';

export {
  Card,
  CardProps,
} from './components/Card';

export {
  EmptyState,
  EmptyStateProps,
} from './components/EmptyState';

export {
  LoadingSpinner,
  LoadingSpinnerProps,
} from './components/LoadingSpinner';

// Type exports
export type {
  ColorKeys,
  SpacingKeys,
  TypographyVariant,
  ButtonVariant,
  ComponentStyles,
} from './types';

// Default export
export default {
  tokens: require('./tokens').designTokens,
  styles: {
    global: require('./styles').globalStyles,
    components: require('./styles').componentStyles,
    layout: require('./styles').layoutStyles,
  },
  components: {
    Button: require('./components/Button').Button,
    Input: require('./components/Input').Input,
    Text: require('./components/Text').Text,
    TrackCard: require('./components/TrackCard').TrackCard,
    TabBar: require('./components/TabBar').TabBar,
    Avatar: require('./components/Avatar').Avatar,
    Card: require('./components/Card').Card,
    EmptyState: require('./components/EmptyState').EmptyState,
    LoadingSpinner: require('./components/LoadingSpinner').LoadingSpinner,
  },
};