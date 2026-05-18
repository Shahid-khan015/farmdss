import { useQuery } from '@tanstack/react-query';

import { getFarmers } from '../services/authService';

export function useFarmers() {
  return useQuery({
    queryKey: ['farmers'],
    queryFn: () => getFarmers(),
  });
}
