/**
 * Watch Feature Types
 * features/watch/types/watch.types.ts
 */

export type Stream = {
  id: string;
  title: string;
  streamer: string;
  viewers: number;
  thumbnail: string;
};

export type LiveGame = {
  id: string;
  white: string;
  black: string;
  event: string;
  viewers: number;
};
