// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/**', '.expo/**'],
  },
  {
    // DLS Compliance Rules - Apply to features and routes, but not ui/
    // These rules enforce the Design Language System by preventing:
    // 1. Raw React Native View/Text/TouchableOpacity imports
    // 2. StyleSheet.create usage (use tokens instead)
    // 3. Hard-coded values should be caught in code review
    files: ['features/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    ignores: ['**/ui/**', '**/node_modules/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      // Block raw View/Text/TouchableOpacity imports from react-native
      // Use DLS primitives from @/ui instead
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['View', 'Text'],
              message:
                '❌ DLS Violation: Use DLS primitives instead.\n' +
                '✅ Instead of: import { View, Text } from "react-native"\n' +
                '✅ Use: import { Box, Text } from "@/ui"\n' +
                '📚 See: app/docs/design-language-system.md#dls-adoption-checklist',
            },
            {
              name: 'react-native',
              importNames: ['TouchableOpacity'],
              message:
                '❌ DLS Violation: Use DLS primitives instead.\n' +
                '✅ Instead of: import { TouchableOpacity } from "react-native"\n' +
                '✅ Use: import { Button, InteractivePressable } from "@/ui"\n' +
                '📚 See: app/docs/design-language-system.md#dls-adoption-checklist',
            },
          ],
        },
      ],

      // Block StyleSheet.create usage - use tokens and primitive props instead
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.object.name="StyleSheet"][callee.property.name="create"]',
          message:
            '❌ DLS Violation: Avoid StyleSheet.create in features/routes.\n' +
            '✅ Instead of: StyleSheet.create({ padding: 16, borderRadius: 8 })\n' +
            '✅ Use: DLS tokens (spacingTokens, radiusTokens, shadowTokens) and primitive props\n' +
            '📚 See: app/docs/design-language-system.md#dls-adoption-checklist',
        },
        {
          selector:
            'MemberExpression[object.name="StyleSheet"][property.name="create"]',
          message:
            '❌ DLS Violation: Avoid StyleSheet.create in features/routes.\n' +
            '✅ Instead of: StyleSheet.create({ ... })\n' +
            '✅ Use: DLS tokens and primitive props (Box padding={spacingTokens[4]})\n' +
            '📚 See: app/docs/design-language-system.md#dls-adoption-checklist',
        },
      ],
    },
  },
]);
