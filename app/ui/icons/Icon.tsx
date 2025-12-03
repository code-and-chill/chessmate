import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

export type IconName = 
  // Navigation
  | 'globe' | 'robot' | 'users' | 'book' | 'trophy' | 'settings'
  | 'message' | 'leaderboard' | 'clubs' | 'friends'
  // Actions
  | 'play' | 'pause' | 'stop' | 'refresh' | 'search' | 'add'
  | 'edit' | 'delete' | 'close' | 'check' | 'chevron-right'
  | 'chevron-left' | 'arrow-back' | 'arrow-forward'
  // Status
  | 'info' | 'warning' | 'error' | 'success' | 'flag' | 'star'
  | 'flame' | 'bolt' | 'target' | 'puzzle' | 'brain'
  // Chess
  | 'chess-board' | 'chess-knight' | 'chess-pawn' | 'timer'
  | 'clock' | 'history' | 'trending-up' | 'trending-down'
  // Social
  | 'person' | 'group' | 'chat' | 'send' | 'notifications'
  | 'favorite' | 'share' | 'emoji-events';

const iconMap: Record<IconName, keyof typeof MaterialIcons.glyphMap> = {
  // Navigation
  globe: 'public',
  robot: 'smart-toy',
  users: 'group',
  book: 'menu-book',
  trophy: 'emoji-events',
  settings: 'settings',
  message: 'chat-bubble',
  leaderboard: 'leaderboard',
  clubs: 'groups',
  friends: 'people',
  
  // Actions
  play: 'play-arrow',
  pause: 'pause',
  stop: 'stop',
  refresh: 'refresh',
  search: 'search',
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  close: 'close',
  check: 'check',
  'chevron-right': 'chevron-right',
  'chevron-left': 'chevron-left',
  'arrow-back': 'arrow-back',
  'arrow-forward': 'arrow-forward',
  
  // Status
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'check-circle',
  flag: 'flag',
  star: 'star',
  flame: 'local-fire-department',
  bolt: 'bolt',
  target: 'track-changes',
  puzzle: 'extension',
  brain: 'psychology',
  
  // Chess
  'chess-board': 'grid-on',
  'chess-knight': 'emoji-events',
  'chess-pawn': 'sports-esports',
  timer: 'timer',
  clock: 'schedule',
  history: 'history',
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',
  
  // Social
  person: 'person',
  group: 'group',
  chat: 'chat',
  send: 'send',
  notifications: 'notifications',
  favorite: 'favorite',
  share: 'share',
  'emoji-events': 'emoji-events',
};

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color, 
  style 
}) => {
  const { colors } = useThemeTokens();
  const iconColor = color || colors.foreground.primary;
  const glyphName = iconMap[name];

  return (
    <MaterialIcons 
      name={glyphName} 
      size={size} 
      color={iconColor} 
      style={style}
    />
  );
};
