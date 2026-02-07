import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Stats {
  activeAds: number;
  totalUsers: number;
}

export function useStats() {
  const query = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_stats');
      
      if (error) {
        console.error('Error fetching stats:', error);
        return { activeAds: 0, totalUsers: 0 };
      }

      const stats = data as { activeAds: number; totalUsers: number };
      return {
        activeAds: stats?.activeAds ?? 0,
        totalUsers: stats?.totalUsers ?? 0,
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time feel
  });

  // Subscribe to realtime changes for live updates
  useEffect(() => {
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ads' },
        () => {
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query]);

  return query;
}
