/**
 * EvalGraph Storybook Stories
 */

import React from 'react';
import { View } from 'react-native';
import { EvalGraph } from './EvalGraph';

export default {
  title: 'Chess/EvalGraph',
  component: EvalGraph,
};

// Sample evaluation data (centipawns)
const balancedGameEvals = [20, 30, 25, 15, 10, 5, 0, -5, -10, 0, 10, 20, 15, 10, 5, 0, -5, 0, 5, 10];
const whiteWinningEvals = [50, 80, 120, 180, 250, 320, 400, 450, 480, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500];
const blackWinningEvals = [-50, -80, -120, -180, -250, -320, -400, -450, -480, -500, -500, -500, -500, -500, -500, -500, -500, -500, -500, -500];
const swingGameEvals = [30, 40, 50, 45, 200, 180, -50, -100, -200, -150, 100, 150, 200, 180, -80, -120, 50, 80, 100, 120];
const gradualAdvantageEvals = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190];

// Sample phases
const samplePhases = {
  opening: 8,
  middlegame: 25,
  endgame: 35,
};

// Story: Basic usage
export const Basic = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={balancedGameEvals}
    />
  </View>
);

// Story: White winning
export const WhiteWinning = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={whiteWinningEvals}
      playerColor="white"
    />
  </View>
);

// Story: Black winning
export const BlackWinning = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={blackWinningEvals}
      playerColor="black"
    />
  </View>
);

// Story: With critical moments
export const WithCriticalMoments = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={swingGameEvals}
      criticalMoments={[5, 7, 9, 11, 15]}
    />
  </View>
);

// Story: With game phases
export const WithGamePhases = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={balancedGameEvals}
      phases={samplePhases}
      showPhases={true}
    />
  </View>
);

// Story: Without zero line
export const WithoutZeroLine = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={balancedGameEvals}
      showZeroLine={false}
    />
  </View>
);

// Story: Without phases
export const WithoutPhases = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={balancedGameEvals}
      phases={samplePhases}
      showPhases={false}
    />
  </View>
);

// Story: Gradual advantage
export const GradualAdvantage = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={gradualAdvantageEvals}
      phases={{ opening: 5, middlegame: 12, endgame: 20 }}
    />
  </View>
);

// Story: Short game
export const ShortGame = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={[20, 50, 100, 200, 300]}
      criticalMoments={[4]}
    />
  </View>
);

// Story: Long game
export const LongGame = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={Array.from({ length: 50 }, (_, i) => Math.sin(i / 3) * 100 + Math.random() * 50 - 25)}
      phases={{ opening: 12, middlegame: 35, endgame: 50 }}
    />
  </View>
);

// Story: Animated entrance
export const Animated = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={swingGameEvals}
      criticalMoments={[5, 9, 15]}
      phases={samplePhases}
      animated={true}
      delay={300}
    />
  </View>
);

// Story: Custom dimensions
export const CustomDimensions = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 400 }}>
    <EvalGraph
      evaluations={balancedGameEvals}
      width={500}
      height={280}
    />
  </View>
);

// Story: Dark background
export const DarkBackground = () => (
  <View style={{ padding: 20, backgroundColor: '#1A1A1A', minHeight: 300 }}>
    <EvalGraph
      evaluations={balancedGameEvals}
      phases={samplePhases}
    />
  </View>
);

// Story: Critical blunder game
export const CriticalBlunderGame = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={[50, 60, 70, 80, 90, 100, 110, 120, -200, -250, -300, -320, -350, -380, -400, -420, -450, -470, -490, -500]}
      criticalMoments={[9]}
      phases={{ opening: 8, middlegame: 15, endgame: 20 }}
    />
  </View>
);

// Story: Comeback from losing position
export const ComebackStory = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={[-300, -280, -260, -240, -220, -200, -180, -160, -140, -120, -100, -80, -60, -40, -20, 0, 20, 40, 60, 80]}
      criticalMoments={[11, 16]}
      phases={{ opening: 5, middlegame: 14, endgame: 20 }}
    />
  </View>
);

// Story: Seesaw battle
export const SeesawBattle = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={[100, -100, 150, -150, 200, -200, 180, -180, 160, -160, 140, -140, 120, -120, 100, -100, 80, -80, 60, 0]}
      criticalMoments={[2, 4, 6, 8, 10, 12, 14, 16, 18]}
      phases={{ opening: 6, middlegame: 14, endgame: 20 }}
    />
  </View>
);

// Story: Perfect game (high accuracy)
export const PerfectGame = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={[15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110]}
      phases={{ opening: 8, middlegame: 16, endgame: 20 }}
    />
  </View>
);

// Story: Material advantage swing
export const MaterialAdvantageSwing = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', minHeight: 300 }}>
    <EvalGraph
      evaluations={[0, 10, 20, 30, 300, 310, 320, 330, 340, 350, 360, -100, -90, -80, -70, -60, -50, -40, -30, -20]}
      criticalMoments={[5, 12]}
      phases={{ opening: 4, middlegame: 11, endgame: 20 }}
    />
  </View>
);
