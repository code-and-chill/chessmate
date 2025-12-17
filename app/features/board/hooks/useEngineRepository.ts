import { useMemo } from 'react';
import { useApiConfig } from '@/config/hooks';
import { useMockApi } from '@/config/hooks';
import { EngineApiClient, MockEngineApiClient } from '@/services/api';
import { EngineRepository } from '../repositories/EngineRepository';
import type { IEngineRepository } from '../repositories/IEngineRepository';

/**
 * Hook for dependency injection of EngineRepository
 * 
 * Handles mock/real switching based on configuration.
 */
export function useEngineRepository(): IEngineRepository {
  const apiConfig = useApiConfig();
  const useMock = useMockApi();

  return useMemo(() => {
    const engineUrl = apiConfig.engineClusterUrl || 'http://localhost:9000';
    const client = useMock
      ? new MockEngineApiClient()
      : new EngineApiClient(engineUrl);
    return new EngineRepository(client);
  }, [apiConfig.engineClusterUrl, useMock]);
}
