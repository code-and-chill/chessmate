import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { spacingTokens } from '@/ui/tokens/spacing';

interface BoardThemeRightToolsProps {
  settings?: any;
  onChange?: (settings: any) => void;
  onQuickApply?: (presetId: string) => void;
}

const BoardThemeRightTools: React.FC<BoardThemeRightToolsProps> = ({ settings = {}, onChange = () => {}, onQuickApply = () => {} }) => {
  const [coordsEnabled, setCoordsEnabled] = React.useState<boolean>(!!settings.showCoordinates);

  React.useEffect(() => {
    setCoordsEnabled(!!settings.showCoordinates);
  }, [settings.showCoordinates]);

  const toggleCoords = (value: boolean) => {
    setCoordsEnabled(value);
    onChange({ ...settings, showCoordinates: value });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Board Details</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Show board coordinates</Text>
        <Switch value={coordsEnabled} onValueChange={toggleCoords} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Effects</Text>
        <Pressable style={styles.button} onPress={() => onQuickApply('celebration')}>
          <Text style={styles.buttonText}>Preview Celebration</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacingTokens[3] ?? 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacingTokens[2] ?? 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacingTokens[1] ?? 6,
  },
  label: {
    fontSize: 14,
  },
  section: {
    marginTop: spacingTokens[3] ?? 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacingTokens[1] ?? 6,
  },
  button: {
    paddingVertical: spacingTokens[2] ?? 8,
    paddingHorizontal: spacingTokens[3] ?? 12,
    backgroundColor: '#F2F4F7',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 13,
    color: '#111827',
  },
});

export default BoardThemeRightTools;

