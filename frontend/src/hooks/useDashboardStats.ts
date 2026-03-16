import { useQuery } from '@tanstack/react-query';

import { tractorService } from '../services/tractorService';
import { implementService } from '../services/implementService';
import { simulationService } from '../services/simulationService';

export function useDashboardStats() {
  const tractorsQ = useQuery({
    queryKey: ['tractors', { limit: 1, offset: 0 }],
    queryFn: () => tractorService.list({ limit: 1, offset: 0 }),
  });
  const implementsQ = useQuery({
    queryKey: ['implements', { limit: 1, offset: 0 }],
    queryFn: () => implementService.list({ limit: 1, offset: 0 }),
  });
  const simsQ = useQuery({
    queryKey: ['simulations', { limit: 1, offset: 0 }],
    queryFn: () => simulationService.list({ limit: 1, offset: 0 }),
  });

  const isLoading = tractorsQ.isLoading || implementsQ.isLoading || simsQ.isLoading;
  const error = tractorsQ.error || implementsQ.error || simsQ.error;

  const stats =
    tractorsQ.data && implementsQ.data && simsQ.data
      ? {
          tractors: tractorsQ.data.total,
          implements: implementsQ.data.total,
          simulations: simsQ.data.total,
        }
      : null;

  return { stats, isLoading, error: error as Error | null };
}

