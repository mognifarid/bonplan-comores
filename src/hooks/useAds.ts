import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Listing, CATEGORIES, BoostType } from '@/types/listing';

function transformAdToListing(ad: any): Listing {
  const category = CATEGORIES.find(c => c.slug === ad.category) || CATEGORIES[0];
  
  return {
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: ad.price,
    currency: 'KMF',
    category,
    island: ad.island,
    city: ad.city || '',
    images: ad.images || ['/placeholder.svg'],
    createdAt: new Date(ad.created_at),
    updatedAt: new Date(ad.updated_at),
    status: ad.status,
    boost: ad.boost as BoostType,
    userId: ad.user_id,
    userName: '',
    views: ad.views || 0,
  };
}

export function usePublicAds(filters?: {
  category?: string;
  island?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return useQuery({
    queryKey: ['publicAds', filters],
    queryFn: async () => {
      let query = supabase
        .from('ads_public')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.island && filters.island !== 'all') {
        query = query.eq('island', filters.island);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(transformAdToListing);
    },
  });
}

export function usePublicAd(id: string) {
  return useQuery({
    queryKey: ['publicAd', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_public')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformAdToListing(data);
    },
    enabled: !!id,
  });
}

export function useUserAds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userAds', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformAdToListing);
    },
    enabled: !!user,
  });
}

export function useUserAd(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userAd', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (adData: {
      title: string;
      description: string;
      price: number;
      category: string;
      subcategory?: string;
      island: string;
      city?: string;
      images?: string[];
      phone_number?: string;
      vehicle_brand?: string;
      vehicle_year?: string;
      vehicle_mileage?: string;
      room_count?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ads')
        .insert({
          ...adData,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAds'] });
      queryClient.invalidateQueries({ queryKey: ['publicAds'] });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      title: string;
      description: string;
      price: number;
      category: string;
      subcategory?: string;
      island: string;
      city?: string;
      images?: string[];
      phone_number?: string;
      status: string;
    }>) => {
      const { error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAds'] });
      queryClient.invalidateQueries({ queryKey: ['publicAds'] });
      queryClient.invalidateQueries({ queryKey: ['publicAd'] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAds'] });
      queryClient.invalidateQueries({ queryKey: ['publicAds'] });
    },
  });
}

export function useSavedAds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['savedAds', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_ads')
        .select('ad_id, ads_public(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || [])
        .filter(item => item.ads_public)
        .map(item => transformAdToListing(item.ads_public));
    },
    enabled: !!user,
  });
}

export function useSaveAd() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (adId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_ads')
        .insert({ user_id: user.id, ad_id: adId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAds'] });
    },
  });
}

export function useUnsaveAd() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (adId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_ads')
        .delete()
        .eq('user_id', user.id)
        .eq('ad_id', adId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAds'] });
    },
  });
}

export function useIsAdSaved(adId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isAdSaved', adId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('saved_ads')
        .select('id')
        .eq('user_id', user.id)
        .eq('ad_id', adId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!user && !!adId,
  });
}
