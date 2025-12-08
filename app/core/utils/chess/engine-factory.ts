import { ChessJsEngine } from './chessjs-engine';
import type { IEngine } from './engine-interface';

const singletonKey = '__SINGLETON__';
const engines = new Map<string, IEngine>();

export const getEngine = (gameId?: string): IEngine => {
  const key = gameId ?? singletonKey;
  let e = engines.get(key);
  if (!e) {
    e = new ChessJsEngine();
    engines.set(key, e);
  }
  return e;
};

export const clearEngine = (gameId?: string) => {
  const key = gameId ?? singletonKey;
  const e = engines.get(key);
  if (e) engines.delete(key);
  return e;
};
