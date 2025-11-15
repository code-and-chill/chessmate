import fs from 'fs';
import { resolveMonorepoPath } from '../../core/paths';
import { writeActiveEnvironment, readActiveEnvironment, clearActiveEnvironment, getStateFilePath_ForDisplay } from '../state';

describe('k8s state persistence', () => {
  const stateFile = resolveMonorepoPath('.dx/.state');

  afterEach(() => {
    try { if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile); } catch {};
  });

  test('write and read active environment', () => {
    writeActiveEnvironment('local');
    const v = readActiveEnvironment();
    expect(v).toBe('local');
  });

  test('clear active environment', () => {
    writeActiveEnvironment('dev');
    clearActiveEnvironment();
    const v = readActiveEnvironment();
    expect(v === null || v === undefined).toBeTruthy();
  });

  test('state file path function', () => {
    const p = getStateFilePath_ForDisplay();
    expect(typeof p).toBe('string');
  });
});
