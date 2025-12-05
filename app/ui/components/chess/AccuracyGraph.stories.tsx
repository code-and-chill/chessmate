/**
 * AccuracyGraph Storybook Stories
 */

import React from 'react';
import { View } from 'react-native';
import { AccuracyGraph } from '@/ui';

export default {
  title: 'Chess/AccuracyGraph',
  component: AccuracyGraph,
};

// Sample data
const samplePlayerData = [95, 92, 88, 90, 87, 85, 83, 86, 89, 91, 88, 85, 82, 80, 78, 75, 73, 70, 68, 72];
const sampleOpponentData = [90, 88, 85, 82, 80, 78, 75, 72, 70, 68, 65, 62, 60, 58, 55, 52, 50, 48, 45, 42];

const strongPlayerData = [98, 97, 96, 95, 94, 93, 92, 91, 90, 91, 92, 93, 94, 95, 96, 97, 98, 97, 96, 95];
const weakPlayerData = [60, 58, 55, 52, 50, 48, 45, 42, 40, 38, 35, 32, 30, 28, 25, 22, 20, 18, 15, 12];

const closeMatchData1 = [85, 87, 86, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72];
const closeMatchData2 = [86, 85, 87, 86, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73];

// Story: Basic usage
export const Basic = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
    />
  </View>
);

// Story: Custom names
export const CustomNames = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
      playerName="Magnus"
      opponentName="Hikaru"
    />
  </View>
);

// Story: Without thresholds
export const WithoutThresholds = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
      showThresholds={false}
    />
  </View>
);

// Story: Without averages
export const WithoutAverages = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
      showAverages={false}
    />
  </View>
);

// Story: Strong player vs weak player
export const StrongVsWeak = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={strongPlayerData}
      opponentData={weakPlayerData}
      playerName="GM Player"
      opponentName="Beginner"
    />
  </View>
);

// Story: Close match
export const CloseMatch = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={closeMatchData1}
      opponentData={closeMatchData2}
      playerName="Player 1"
      opponentName="Player 2"
    />
  </View>
);

// Story: Short game
export const ShortGame = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={[95, 90, 85, 80, 75]}
      opponentData={[90, 85, 80, 75, 70]}
      playerName="White"
      opponentName="Black"
    />
  </View>
);

// Story: Long game
export const LongGame = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={Array.from({ length: 40 }, (_, i) => 95 - i * 0.5)}
      opponentData={Array.from({ length: 40 }, (_, i) => 90 - i * 0.7)}
      playerName="Endurance Player"
      opponentName="Time Trouble Player"
    />
  </View>
);

// Story: With animation
export const Animated = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
      animated={true}
      delay={200}
    />
  </View>
);

// Story: Custom dimensions
export const CustomDimensions = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 400 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
      width={500}
      height={300}
    />
  </View>
);

// Story: Dark background
export const DarkBackground = () => (
  <View style={{ padding: 20, backgroundColor: '#1A1A1A', minHeight: 300 }}>
    <AccuracyGraph
      playerData={samplePlayerData}
      opponentData={sampleOpponentData}
    />
  </View>
);

// Story: Player dominating
export const PlayerDominating = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={[98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79]}
      opponentData={[70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32]}
      playerName="Pro"
      opponentName="Amateur"
    />
  </View>
);

// Story: Comeback story
export const ComebackStory = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <AccuracyGraph
      playerData={[60, 62, 65, 68, 70, 73, 75, 78, 80, 82, 85, 87, 89, 91, 93, 95, 96, 97, 98, 99]}
      opponentData={[95, 93, 91, 89, 87, 85, 83, 81, 79, 77, 75, 73, 71, 69, 67, 65, 63, 61, 59, 57]}
      playerName="Comeback Kid"
      opponentName="Tired Player"
    />
  </View>
);
