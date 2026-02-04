import { useState } from 'react';
import { CreditCard, Star, Zap, ArrowUp, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Ad } from '@/hooks/useAds';
import { CATEGORIES, ISLANDS } from '@/types/listing';

interface PendingBoostsSectionProps {
  ads: Ad[];
}

const BOOST_INFO = {
  vedette: {
    name: 'Vedette',
    icon: Star,
    price: '6€',
    color: 'bg-gradient-premium text-accent-foreground',
    description: 'En tête des résultats pendant 7 jours'
  },
  urgent: {
    name: 'Urgent',
    icon: Zap,
    price: '3€',
    color: 'bg-gradient-urgent text-destructive-foreground',
    description: 'Badge "Urgent" + priorité 3 jours'
  },
  remontee: {
    name: 'Remontée',
    icon: ArrowUp,
    price: '1,50€',
    color: 'bg-secondary text-secondary-foreground',
    description: 'Remontez votre annonce en haut'
  }
};

export function PendingBoostsSection({ ads }: PendingBoostsSectionProps) {
  const { toast } = useToast();
  const [loadingAdId, setLoadingAdId] = useState<string | null>(null);

  // Filtrer les annonces en attente de paiement (status pending et pas encore de boost appliqué)
  const pendingAds = ads.filter(ad => ad.status === 'pending');

  const handlePayment = async (adId: string, boostType: string) => {
    setLoadingAdId(adId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          boostType,
          adId,
          paymentMethod: 'stripe'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirection vers le paiement",
          description: "La page de paiement Stripe s'est ouverte dans un nouvel onglet.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la session de paiement",
        variant: "destructive",
      });
    } finally {
      setLoadingAdId(null);
    }
  };

  const getCategoryInfo = (slug: string) => {
    return CATEGORIES.find(c => c.slug === slug) || { icon: '📦', name: slug };
  };

  const getIslandLabel = (value: string) => {
    return ISLANDS.find(i => i.value === value)?.label || value;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(price) + ' KMF';
  };

  if (pendingAds.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun boost en attente
          </h3>
          <p className="text-muted-foreground">
            Tous vos boosts sont activés ou vous n'avez pas encore ajouté de boost à vos annonces.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          {pendingAds.length} annonce{pendingAds.length > 1 ? 's' : ''} en attente de paiement
        </h3>
      </div>

      {pendingAds.map((ad) => {
        const category = getCategoryInfo(ad.category);
        
        return (
          <Card key={ad.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="w-full md:w-40 aspect-video md:aspect-square bg-muted flex-shrink-0">
                {ad.images && ad.images.length > 0 ? (
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {category.icon}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground line-clamp-1">{ad.title}</h4>
                    <p className="text-primary font-bold">{formatPrice(ad.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {ad.city}, {getIslandLabel(ad.island)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    En attente de paiement
                  </Badge>
                </div>

                {/* Boost Options */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(BOOST_INFO).map(([key, info]) => {
                    const Icon = info.icon;
                    const isLoading = loadingAdId === ad.id;
                    
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="gap-2 justify-start h-auto py-2 px-3"
                        onClick={() => handlePayment(ad.id, key)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <div className={`w-6 h-6 rounded-full ${info.color} flex items-center justify-center`}>
                            <Icon className="h-3 w-3" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className="font-medium text-sm">{info.name}</div>
                          <div className="text-xs text-muted-foreground">{info.price}</div>
                        </div>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
