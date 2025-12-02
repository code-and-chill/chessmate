/**
 * Responsive Layout Example
 * app/app/(tabs)/responsive-example.tsx
 * 
 * Demonstrates responsive breakpoints, dark mode, and adaptive layouts
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  Text,
  Container,
  Grid,
  Card,
  Button,
  Badge,
  GameCard,
  useBreakpoint,
  useDeviceType,
  useResponsive,
  useIsDark,
  spacingTokens,
  spacingScale,
  textVariants,
  colorTokens,
  getColor,
  radiusTokens,
} from '@/ui';
import type { Player } from '@/ui';

export default function ResponsiveExample() {
  const breakpoint = useBreakpoint();
  const device = useDeviceType();
  const isDark = useIsDark();

  // Responsive values
  const titleSize = useResponsive({
    xs: 24,
    md: 28,
    lg: 32,
  });

  const cardColumns = useResponsive({
    xs: 1,
    sm: 2,
    lg: 3,
    xl: 4,
  });

  // Sample game data
  const player1: Player = {
    id: '1',
    name: 'Player1',
    rating: 1725,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Player1',
  };

  const player2: Player = {
    id: '2',
    name: 'Player2',
    rating: 1680,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Player2',
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: getColor(colorTokens.neutral[50], isDark) },
      ]}
    >
      <Container constrained centered adaptivePadding>
        {/* Breakpoint Info */}
        <Card variant="filled" size="sm">
          <View style={styles.infoGrid}>
            <InfoItem
              label="Breakpoint"
              value={breakpoint.toUpperCase()}
              isDark={isDark}
            />
            <InfoItem
              label="Device"
              value={
                device.isMobile
                  ? 'Mobile'
                  : device.isTablet
                  ? 'Tablet'
                  : 'Desktop'
              }
              isDark={isDark}
            />
            <InfoItem
              label="Theme"
              value={isDark ? 'Dark' : 'Light'}
              isDark={isDark}
            />
            <InfoItem
              label="Platform"
              value={device.isWeb ? 'Web' : 'Native'}
              isDark={isDark}
            />
          </View>
        </Card>

        <View style={styles.spacer} />

        {/* Responsive Title */}
        <Text
          style={[
            textVariants.display,
            {
              fontSize: titleSize,
              color: getColor(colorTokens.neutral[900], isDark),
            },
          ]}
        >
          Responsive Layout Demo
        </Text>

        <Text
          {...textVariants.body}
          style={{
            color: getColor(colorTokens.neutral[600], isDark),
            marginTop: spacingTokens[2],
          }}
        >
          This screen adapts to screen size and theme automatically
        </Text>

        <View style={styles.spacer} />

        {/* Responsive Grid of Cards */}
        <Text
          {...textVariants.title}
          style={{
            color: getColor(colorTokens.neutral[900], isDark),
            marginBottom: spacingTokens[3],
          }}
        >
          Responsive Grid
        </Text>

        <Grid columns={cardColumns} gap={spacingTokens[4]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="elevated" size="md">
              <View style={styles.gridCard}>
                <Text
                  {...textVariants.title}
                  style={{ color: getColor(colorTokens.neutral[900], isDark) }}
                >
                  Card {i}
                </Text>
                <Text
                  {...textVariants.body}
                  style={{
                    color: getColor(colorTokens.neutral[600], isDark),
                    marginTop: spacingTokens[1],
                  }}
                >
                  {cardColumns} columns on {breakpoint}
                </Text>
                <Badge variant="info" style={{ marginTop: spacingTokens[2] }}>
                  {device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}
                </Badge>
              </View>
            </Card>
          ))}
        </Grid>

        <View style={styles.spacer} />

        {/* Game Cards - Responsive */}
        <Text
          {...textVariants.title}
          style={{
            color: getColor(colorTokens.neutral[900], isDark),
            marginBottom: spacingTokens[3],
          }}
        >
          Game Cards
        </Text>

        <Grid columns={cardColumns} gap={spacingTokens[4]}>
          {[1, 2, 3, 4].map((i) => (
            <GameCard
              key={i}
              gameId={`game-${i}`}
              players={{ white: player1, black: player2 }}
              currentTurn={i % 2 === 0 ? 'white' : 'black'}
              timeControl="10+0"
              status="active"
              onPress={() => console.log(`Open game ${i}`)}
            />
          ))}
        </Grid>

        <View style={styles.spacer} />

        {/* Responsive Button Sizes */}
        <Text
          {...textVariants.title}
          style={{
            color: getColor(colorTokens.neutral[900], isDark),
            marginBottom: spacingTokens[3],
          }}
        >
          Responsive Actions
        </Text>

        <View style={styles.buttonGroup}>
          <Button
            variant="primary"
            size={device.isMobile ? 'md' : 'lg'}
            style={styles.button}
          >
            {device.isMobile ? 'Play' : 'Start Playing'}
          </Button>
          <Button
            variant="secondary"
            size={device.isMobile ? 'md' : 'lg'}
            style={styles.button}
          >
            {device.isMobile ? 'Learn' : 'Learn Chess'}
          </Button>
        </View>

        {/* Layout Info */}
        <View style={styles.spacer} />
        <Card variant="outlined" size="sm">
          <Text
            {...textVariants.body}
            style={{
              color: getColor(colorTokens.neutral[700], isDark),
              textAlign: 'center',
            }}
          >
            💡 Resize your browser to see responsive behavior
          </Text>
        </Card>
      </Container>
    </ScrollView>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
  isDark: boolean;
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value, isDark }) => (
  <View style={styles.infoItem}>
    <Text
      {...textVariants.caption}
      style={{ color: getColor(colorTokens.neutral[600], isDark) }}
    >
      {label}
    </Text>
    <Text
      {...textVariants.body}
      style={{
        color: getColor(colorTokens.neutral[900], isDark),
        fontWeight: '600',
        marginTop: spacingTokens[1],
      }}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingTokens[4],
  },
  infoItem: {
    flex: 1,
    minWidth: 100,
  },
  spacer: {
    height: spacingScale.section,
  },
  gridCard: {
    alignItems: 'center',
    padding: spacingTokens[3],
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacingTokens[3],
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 120,
  },
});
