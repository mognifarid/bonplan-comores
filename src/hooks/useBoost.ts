import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type BoostType = 'vedette' | 'urgent' | 'remontee';
export type PaymentProvider = 'stripe' | 'paypal';

export const BOOST_PRICES = {
  vedette: { price: 6, label: 'Vedette', description: 'Mise en avant premium pendant 7 jours' },
  urgent: { price: 3, label: 'Urgent', description: 'Badge urgent pendant 7 jours' },
  remontee: { price: 1.5, label: 'Remontée', description: 'Remonter en haut des résultats' },
};

export function useBoostAd() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ adId, boostType, provider = 'stripe' }: { adId: string; boostType: BoostType; provider?: PaymentProvider }) => {
      const functionName = provider === 'paypal' ? 'create-paypal-boost' : 'create-boost-payment';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { adId, boostType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return { ...data, provider };
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le paiement",
        variant: "destructive",
      });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sessionId, orderId, provider = 'stripe' }: { sessionId?: string; orderId?: string; provider?: PaymentProvider }) => {
      if (provider === 'paypal' && orderId) {
        const { data, error } = await supabase.functions.invoke('capture-paypal-boost', {
          body: { orderId },
        });
        if (error) throw error;
        return data;
      }
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['userAds'] });
        queryClient.invalidateQueries({ queryKey: ['publicAds'] });
        toast({
          title: "Boost activé !",
          description: `Votre boost ${data.boostType} est maintenant actif.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error('Payment verification failed:', error);
    },
  });
}
