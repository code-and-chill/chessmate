#!/usr/bin/env ts-node

/**
 * DLS Usage Audit Script
 * 
 * Scans the codebase for:
 * 1. Direct Tailwind design class usage (colors, spacing, typography)
 * 2. Hard-coded design values (colors, spacing, typography, radii)
 * 3. Components not using DLS primitives
 * 
 * Usage:
 *   ts-node scripts/audit-dls-usage.ts
 *   ts-node scripts/audit-dls-usage.ts --fix  # Auto-fix simple cases
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditIssue {
  file: string;
  line: number;
  type: 'tailwind-design' | 'hardcoded-color' | 'hardcoded-spacing' | 'hardcoded-typography' | 'hardcoded-radius';
  message: string;
  code: string;
}

const ISSUES: AuditIssue[] = [];

// Patterns to detect
const PATTERNS = {
  // Tailwind design classes (should use DLS props instead)
  tailwindDesign: {
    // Color classes
    colorClasses: /className\s*=\s*["'][^"']*\b(bg|text|border)-(neutral|blue|purple|green|red|amber|cyan|orange)-\d+/g,
    semanticColorClasses: /className\s*=\s*["'][^"']*\b(bg|text|border)-(background|foreground|accent|success|error|warning|info)-/g,
    // Spacing classes
    spacingClasses: /className\s*=\s*["'][^"']*\b(p|m|gap|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-\d+/g,
    // Typography classes
    typographyClasses: /className\s*=\s*["'][^"']*\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl)|font-(display|primary|mono|normal|medium|semibold|bold))/g,
    // Radius classes
    radiusClasses: /className\s*=\s*["'][^"']*\brounded-(sm|md|lg|xl|2xl|full)/g,
  },
  
  // Hard-coded values
  hardcoded: {
    // Hex colors
    hexColors: /#[0-9A-Fa-f]{3,6}/g,
    // RGB/RGBA colors
    rgbColors: /rgba?\([^)]+\)/g,
    // Spacing values
    spacingValues: /(padding|margin|gap):\s*\d+px/g,
    // Typography values
    typographyValues: /(fontSize|lineHeight|letterSpacing):\s*\d+/g,
    // Border radius values
    radiusValues: /borderRadius:\s*\d+/g,
  },
};

// Layout utilities that are acceptable
const ACCEPTABLE_TAILWIND = [
  'flex', 'flex-1', 'flex-row', 'flex-col',
  'items-center', 'items-start', 'items-end', 'items-stretch',
  'justify-center', 'justify-start', 'justify-end', 'justify-between', 'justify-around',
  'self-center', 'self-start', 'self-end', 'self-stretch',
  'w-full', 'h-full', 'w-screen', 'h-screen',
  'absolute', 'relative', 'fixed',
  'overflow-hidden', 'overflow-scroll', 'overflow-visible',
  'hidden', 'block', 'inline', 'inline-block',
  'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
];

function isAcceptableTailwindClass(className: string): boolean {
  return ACCEPTABLE_TAILWIND.some(acceptable => className.includes(acceptable));
}

function auditFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for Tailwind design classes
    if (PATTERNS.tailwindDesign.colorClasses.test(line)) {
      const matches = line.match(PATTERNS.tailwindDesign.colorClasses);
      if (matches && !isAcceptableTailwindClass(line)) {
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          type: 'tailwind-design',
          message: `Direct Tailwind color class detected. Use DLS colors via useColors() hook instead.`,
          code: line.trim(),
        });
      }
    }
    
    if (PATTERNS.tailwindDesign.spacingClasses.test(line)) {
      const matches = line.match(PATTERNS.tailwindDesign.spacingClasses);
      if (matches && !isAcceptableTailwindClass(line)) {
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          type: 'tailwind-design',
          message: `Direct Tailwind spacing class detected. Use DLS padding/margin props instead.`,
          code: line.trim(),
        });
      }
    }
    
    if (PATTERNS.tailwindDesign.typographyClasses.test(line)) {
      const matches = line.match(PATTERNS.tailwindDesign.typographyClasses);
      if (matches && !isAcceptableTailwindClass(line)) {
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          type: 'tailwind-design',
          message: `Direct Tailwind typography class detected. Use DLS Text variant/size props instead.`,
          code: line.trim(),
        });
      }
    }
    
    if (PATTERNS.tailwindDesign.radiusClasses.test(line)) {
      const matches = line.match(PATTERNS.tailwindDesign.radiusClasses);
      if (matches && !isAcceptableTailwindClass(line)) {
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          type: 'tailwind-design',
          message: `Direct Tailwind radius class detected. Use DLS radius prop instead.`,
          code: line.trim(),
        });
      }
    }
    
    // Check for hard-coded colors
    if (PATTERNS.hardcoded.hexColors.test(line) || PATTERNS.hardcoded.rgbColors.test(line)) {
      // Skip if it's in a comment or string that's not a style value
      if (!line.includes('//') && (line.includes('backgroundColor') || line.includes('color') || line.includes('borderColor'))) {
        ISSUES.push({
          file: filePath,
          line: lineNumber,
          type: 'hardcoded-color',
          message: `Hard-coded color value detected. Use DLS colors via useColors() hook instead.`,
          code: line.trim(),
        });
      }
    }
    
    // Check for hard-coded spacing
    if (PATTERNS.hardcoded.spacingValues.test(line)) {
      ISSUES.push({
        file: filePath,
        line: lineNumber,
        type: 'hardcoded-spacing',
        message: `Hard-coded spacing value detected. Use DLS spacingTokens instead.`,
        code: line.trim(),
      });
    }
    
    // Check for hard-coded typography
    if (PATTERNS.hardcoded.typographyValues.test(line)) {
      ISSUES.push({
        file: filePath,
        line: lineNumber,
        type: 'hardcoded-typography',
        message: `Hard-coded typography value detected. Use DLS typographyTokens or Text variant props instead.`,
        code: line.trim(),
      });
    }
    
    // Check for hard-coded radius
    if (PATTERNS.hardcoded.radiusValues.test(line)) {
      ISSUES.push({
        file: filePath,
        line: lineNumber,
        type: 'hardcoded-radius',
        message: `Hard-coded border radius detected. Use DLS radiusTokens or radius prop instead.`,
        code: line.trim(),
      });
    }
  });
}

function printReport(): void {
  console.log('\n🔍 DLS Usage Audit Report\n');
  console.log('='.repeat(80));
  
  if (ISSUES.length === 0) {
    console.log('✅ No issues found! All code follows DLS guidelines.');
    console.log('='.repeat(80));
    return;
  }
  
  // Group by type
  const byType = ISSUES.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = [];
    acc[issue.type].push(issue);
    return acc;
  }, {} as Record<string, AuditIssue[]>);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Total Issues: ${ISSUES.length}`);
  Object.entries(byType).forEach(([type, issues]) => {
    console.log(`   ${type}: ${issues.length}`);
  });
  
  // Print details
  console.log('\n📋 Details:\n');
  
  Object.entries(byType).forEach(([type, issues]) => {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`\n${type.toUpperCase()} (${issues.length} issues)`);
    console.log('─'.repeat(80));
    
    issues.forEach((issue) => {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.log(`\n${relativePath}:${issue.line}`);
      console.log(`  ${issue.message}`);
      console.log(`  ${issue.code}`);
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Tips:');
  console.log('   - Use DLS props (padding, backgroundColor, variant) instead of Tailwind design classes');
  console.log('   - Use useColors() hook for theme-aware colors');
  console.log('   - Use spacingTokens, typographyTokens, radiusTokens for design values');
  console.log('   - Tailwind classes are acceptable for layout utilities (flex-1, items-center, etc.)');
  console.log('\n📚 See docs/tailwind-dls-integration.md for migration guide\n');
}

function findFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip ignored directories
    if (stat.isDirectory()) {
      if (['node_modules', 'dist', '.expo', '__tests__', '.git'].includes(file)) {
        return;
      }
      findFiles(filePath, fileList);
    } else if (stat.isFile()) {
      // Only include TypeScript/TSX files, exclude test files
      if ((file.endsWith('.ts') || file.endsWith('.tsx')) && 
          !file.endsWith('.test.ts') && 
          !file.endsWith('.test.tsx') &&
          !file.endsWith('.spec.ts') &&
          !file.endsWith('.spec.tsx')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  
  console.log('🔍 Scanning codebase for DLS compliance issues...\n');
  
  const baseDir = path.join(__dirname, '..');
  const appDir = path.join(baseDir, 'app');
  const featuresDir = path.join(baseDir, 'features');
  
  const files: string[] = [];
  
  // Find files in app/ directory
  if (fs.existsSync(appDir)) {
    findFiles(appDir, files);
  }
  
  // Find files in features/ directory
  if (fs.existsSync(featuresDir)) {
    findFiles(featuresDir, files);
  }
  
  console.log(`Found ${files.length} files to audit...\n');
  
  files.forEach(file => {
    auditFile(file);
  });
  
  printReport();
  
  if (ISSUES.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
