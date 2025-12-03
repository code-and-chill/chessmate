/**
 * CoachAvatar Storybook Stories
 */

import React from 'react';
import { View } from 'react-native';
import { CoachAvatar, useExpressionCycle, useExpressionForSentiment, useExpressionForMoveQuality } from './CoachAvatar';

export default {
  title: 'Coach/CoachAvatar',
  component: CoachAvatar,
};

// Story: All expressions
export const AllExpressions = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
    <CoachAvatar expression="happy" showName name="Happy" />
    <CoachAvatar expression="thoughtful" showName name="Thoughtful" />
    <CoachAvatar expression="surprised" showName name="Surprised" />
    <CoachAvatar expression="concerned" showName name="Concerned" />
    <CoachAvatar expression="excited" showName name="Excited" />
    <CoachAvatar expression="neutral" showName name="Neutral" />
  </View>
);

// Story: Happy expression
export const Happy = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="happy" />
  </View>
);

// Story: Thoughtful expression
export const Thoughtful = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="thoughtful" />
  </View>
);

// Story: Surprised expression
export const Surprised = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="surprised" />
  </View>
);

// Story: Concerned expression
export const Concerned = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="concerned" />
  </View>
);

// Story: Excited expression
export const Excited = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="excited" />
  </View>
);

// Story: All sizes
export const AllSizes = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', flexDirection: 'row', alignItems: 'flex-end', gap: 20 }}>
    <CoachAvatar expression="happy" size="sm" showName name="Small" />
    <CoachAvatar expression="happy" size="md" showName name="Medium" />
    <CoachAvatar expression="happy" size="lg" showName name="Large" />
    <CoachAvatar expression="happy" size="xl" showName name="XL" />
  </View>
);

// Story: With name
export const WithName = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="happy" showName name="Coach Sarah" />
  </View>
);

// Story: Without name
export const WithoutName = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="happy" showName={false} />
  </View>
);

// Story: With bounce animation
export const WithBounce = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
    <CoachAvatar expression="excited" bounce={true} size="lg" />
  </View>
);

// Story: Animated expression changes
export const AnimatedExpressionChanges = () => {
  const expression = useExpressionCycle(1500);
  
  return (
    <View style={{ padding: 20, backgroundColor: '#F8F9FA', alignItems: 'center' }}>
      <CoachAvatar
        expression={expression}
        size="xl"
        showName
        name={`Expression: ${expression}`}
        animated={true}
      />
    </View>
  );
};

// Story: Custom background
export const CustomBackground = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', flexDirection: 'row', gap: 20 }}>
    <CoachAvatar
      expression="happy"
      backgroundColor="#E0F2FE"
      borderColor="#0EA5E9"
      size="lg"
    />
    <CoachAvatar
      expression="excited"
      backgroundColor="#FEE2E2"
      borderColor="#EF4444"
      size="lg"
    />
    <CoachAvatar
      expression="thoughtful"
      backgroundColor="#F3E8FF"
      borderColor="#A855F7"
      size="lg"
    />
  </View>
);

// Story: Custom border
export const CustomBorder = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', flexDirection: 'row', gap: 20 }}>
    <CoachAvatar expression="happy" borderWidth={2} size="lg" />
    <CoachAvatar expression="happy" borderWidth={4} size="lg" />
    <CoachAvatar expression="happy" borderWidth={6} size="lg" />
  </View>
);

// Story: Dark background
export const DarkBackground = () => (
  <View style={{ padding: 20, backgroundColor: '#1A1A1A', flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
    <CoachAvatar expression="happy" showName name="Happy" />
    <CoachAvatar expression="thoughtful" showName name="Thoughtful" />
    <CoachAvatar expression="surprised" showName name="Surprised" />
    <CoachAvatar expression="excited" showName name="Excited" />
  </View>
);

// Story: With CoachTooltip integration
export const WithTooltipIntegration = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', alignItems: 'center', gap: 20 }}>
    <View style={{ alignItems: 'center' }}>
      <CoachAvatar expression="happy" size="lg" showName name="Coach Sarah" />
      <View style={{
        marginTop: 10,
        padding: 12,
        backgroundColor: '#10B981',
        borderRadius: 8,
        maxWidth: 200,
      }}>
        <RNText style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>
          Great move! You're winning!
        </RNText>
      </View>
    </View>
  </View>
);

// Story: Sentiment mapping
export const SentimentMapping = () => {
  const [sentiment, setSentiment] = React.useState<'positive' | 'neutral' | 'cautionary' | 'critical'>('positive');
  const expression = useExpressionForSentiment(sentiment);
  
  return (
    <View style={{ padding: 20, backgroundColor: '#F8F9FA', alignItems: 'center', gap: 20 }}>
      <CoachAvatar expression={expression} size="xl" showName name={sentiment} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(['positive', 'neutral', 'cautionary', 'critical'] as const).map((s) => (
          <View
            key={s}
            style={{
              padding: 8,
              backgroundColor: sentiment === s ? '#667EEA' : '#E5E7EB',
              borderRadius: 6,
            }}
            onTouchEnd={() => setSentiment(s)}
          >
            <RNText style={{ color: sentiment === s ? 'white' : '#1F2937', fontSize: 12 }}>
              {s}
            </RNText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Story: Move quality mapping
export const MoveQualityMapping = () => {
  const [quality, setQuality] = React.useState<string>('brilliant');
  const expression = useExpressionForMoveQuality(quality);
  
  const qualities = ['brilliant', 'best', 'good', 'book', 'inaccuracy', 'mistake', 'blunder'];
  
  return (
    <View style={{ padding: 20, backgroundColor: '#F8F9FA', alignItems: 'center', gap: 20 }}>
      <CoachAvatar expression={expression} size="xl" showName name={quality} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {qualities.map((q) => (
          <View
            key={q}
            style={{
              padding: 8,
              backgroundColor: quality === q ? '#667EEA' : '#E5E7EB',
              borderRadius: 6,
            }}
            onTouchEnd={() => setQuality(q)}
          >
            <RNText style={{ color: quality === q ? 'white' : '#1F2937', fontSize: 12 }}>
              {q}
            </RNText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Story: Game feedback scenario
export const GameFeedbackScenario = () => (
  <View style={{ padding: 20, backgroundColor: '#F8F9FA', gap: 30 }}>
    {/* Brilliant move */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <CoachAvatar expression="excited" size="lg" bounce={true} />
      <View style={{ flex: 1, padding: 12, backgroundColor: '#EC4899', borderRadius: 8 }}>
        <RNText style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
          Brilliant move! ‼️
        </RNText>
      </View>
    </View>
    
    {/* Good move */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <CoachAvatar expression="happy" size="lg" />
      <View style={{ flex: 1, padding: 12, backgroundColor: '#10B981', borderRadius: 8 }}>
        <RNText style={{ color: 'white', fontSize: 14 }}>
          Excellent move! Keep it up.
        </RNText>
      </View>
    </View>
    
    {/* Thinking */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <CoachAvatar expression="thoughtful" size="lg" />
      <View style={{ flex: 1, padding: 12, backgroundColor: '#8B5CF6', borderRadius: 8 }}>
        <RNText style={{ color: 'white', fontSize: 14 }}>
          Consider your options carefully...
        </RNText>
      </View>
    </View>
    
    {/* Mistake */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <CoachAvatar expression="concerned" size="lg" />
      <View style={{ flex: 1, padding: 12, backgroundColor: '#F59E0B', borderRadius: 8 }}>
        <RNText style={{ color: 'white', fontSize: 14 }}>
          That wasn't the best move. ⚠️
        </RNText>
      </View>
    </View>
  </View>
);

// Re-export RNText for stories
import { Text as RNText } from 'react-native';
