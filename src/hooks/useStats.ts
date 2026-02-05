import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  activeAds: number;
  totalUsers: number;
}

export function useStats() {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_stats');
      
      if (error) {
        console.error('Error fetching stats:', error);
        return { activeAds: 0, totalUsers: 0 };
      }

      const stats = data as { active_ads: number; total_users: number };
      return {
        activeAds: stats?.active_ads ?? 0,
        totalUsers: stats?.total_users ?? 0,
      };
    },
    staleTime: 60000,
  });
}
