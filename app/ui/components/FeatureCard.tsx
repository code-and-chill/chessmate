import { StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { InteractivePressable } from '@/ui/primitives/InteractivePressable';
import { Icon, type IconName } from '@/ui/icons';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { DevBadge } from '@/ui/primitives/DevBadge';
import { typographyTokens } from '@/ui/tokens/typography';
import { spacingScale } from '@/ui/tokens/spacing';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  /** Icon name from icon library (e.g., "globe", "robot", "book") */
  icon: IconName | ReactNode;

  /** Card title (e.g., "Online Play") */
  title: string;
  
  /** Description text (e.g., "Find opponents worldwide") */
  description: string;
  
  /** Optional progress/info text (e.g., "1245 rating • 34 games") */
  progress?: string;
  
  /** Press handler */
  onPress: () => void;
  
  /** Animation delay in milliseconds (stagger by 100ms: 200, 300, 400...) */
  delay?: number;
  
  /** Custom card variant (default: "elevated") */
  variant?: 'elevated' | 'gradient';
}

export function FeatureCard({
  icon,
  title,
  description,
  progress,
  onPress,
  delay = 200,
  variant = 'elevated',
}: FeatureCardProps) {
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Compact mode: on native devices always use compact stacked layout; on web use width threshold
  const isCompact = Platform.OS !== 'web' || width <= 600;

  const horizontalPadding = Platform.OS === 'ios' && isLandscape ? spacingScale.xl : spacingScale.gutter;

  // Use Card's padding prop in compact mode to control internal padding deterministically
  const cardPadding = isCompact ? spacingScale.sm : undefined;

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(delay)} style={{ width: '100%' }}>
      <DevBadge>{`w:${Math.round(width)} compact:${isCompact ? 'Y' : 'N'}`}</DevBadge>
      <Card variant={variant} size="lg" hoverable pressable padding={cardPadding} style={{ ...styles.card, minWidth: 0 }}>
        <InteractivePressable
          onPress={onPress}
          scaleOnPress
          pressScale={0.98}
          hapticFeedback
          hapticStyle="light"
          style={[
            styles.cardInner,
            isCompact && styles.cardInnerCompact,
            !isCompact && { paddingHorizontal: horizontalPadding, paddingVertical: spacingScale.sm },
            isCompact && { width: '100%', overflow: 'hidden', paddingHorizontal: 0, alignSelf: 'stretch' },
            { minWidth: 0 },
          ]}
        >
          {!isCompact && (
            <View style={[styles.leftZone]}>
              <View style={[styles.iconBadge, isCompact && styles.iconBadgeCompact, { backgroundColor: colors.background.secondary }]}>
                {typeof icon === 'string' ? (
                  <Icon name={icon as IconName} size={isCompact ? spacingScale.iconSize * 0.9 : spacingScale.iconSize * 1.2} color={colors.foreground.primary} />
                ) : (
                  icon
                )}
              </View>
            </View>
          )}

          <View style={[styles.centerZone, isCompact && { paddingLeft: 0 }]}>
            <Text
              style={[
                styles.title,
                isCompact && { fontSize: typographyTokens.fontSize.lg },
                { color: colors.foreground.primary },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <Text
              style={[
                styles.description,
                isCompact && { fontSize: typographyTokens.fontSize.sm },
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
            {progress && <Text style={styles.progress}>{progress}</Text>}
          </View>

          <View style={[styles.rightZone]}>
            <View style={styles.actionWrap}>
              <Text style={[styles.arrow, { color: colors.foreground.secondary, textAlignVertical: 'center', includeFontPadding: false }]}>{'→'}</Text>
            </View>
          </View>
         </InteractivePressable>
       </Card>
     </Animated.View>
   );
 }

 const styles = StyleSheet.create({
   card: {
     width: '100%',
     maxWidth: '100%',
     alignSelf: 'stretch',
     overflow: 'hidden',
   },
   cardInner: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: spacingScale.gap,
   },
   cardInnerCompact: {
     flexDirection: 'column',
     alignItems: 'stretch',
   },
  iconBadge: {
    width: spacingScale.avatarLg,
    height: spacingScale.avatarLg,
    borderRadius: 12, // More rounded like Claude
    justifyContent: 'center',
    alignItems: 'center',
  },
   iconBadgeCompact: {
     marginBottom: spacingScale.sm,
     alignSelf: 'center',
     width: spacingScale.avatarMd,
     height: spacingScale.avatarMd,
     borderRadius: spacingScale.avatarMd / 2,
   },
   iconBadgeRow: {
     marginRight: spacingScale.md,
   },
   contentContainer: {
     flex: 1,
     minWidth: 0,
     width: '100%',
   },
   leftZone: {
     width: 56,
     justifyContent: 'center',
     alignItems: 'center',
   },
   centerZone: {
     flex: 1,
     minWidth: 0,
     paddingLeft: spacingScale.md,
     paddingRight: spacingScale.md,
   },
   rightZone: {
     width: 40,
     justifyContent: 'center',
     alignItems: 'center',
   },
   actionWrap: {
     width: 32,
     height: 32,
     borderRadius: 16,
     justifyContent: 'center',
     alignItems: 'center',
   },
  title: {
    fontFamily: typographyTokens.fontFamily.displayMedium,
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.semibold, // Less heavy
    marginBottom: spacingScale.xs,
    letterSpacing: -0.2, // Tighter spacing
    flexShrink: 1,
    maxWidth: '100%',
  },
  description: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontSize: typographyTokens.fontSize.base,
    lineHeight: 22, // Slightly more breathing room
    flexShrink: 1,
    maxWidth: '100%',
    color: '#6B7280', // Medium gray like Claude
  },
  progress: {
    fontFamily: typographyTokens.fontFamily.primaryMedium,
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.semibold,
    marginTop: spacingScale.xs,
    color: '#6B7280', // Medium gray like Claude
  },
   arrow: {
     fontWeight: '600',
     marginLeft: spacingScale.md,
     flexShrink: 0,
   },
   arrowRow: {
     marginLeft: spacingScale.md,
     alignSelf: 'center',
   },
   arrowCompact: {
     alignSelf: 'flex-end',
     marginTop: spacingScale.sm,
     marginLeft: 0,
   },
 });
