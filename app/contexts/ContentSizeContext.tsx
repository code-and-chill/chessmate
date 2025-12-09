import { createContext, useContext } from 'react';

export type ContentSize = { width: number; height: number } | null;

const ContentSizeContext = createContext<ContentSize>(null);

export const ContentSizeProvider = ContentSizeContext.Provider;

export function useContentSize() {
  return useContext(ContentSizeContext);
}

