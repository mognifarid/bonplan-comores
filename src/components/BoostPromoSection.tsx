import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Zap, ArrowUp, Loader2, ImageIcon } from 'lucide-react';
import { BoostType, BOOST_PRICES, useBoostAd } from '@/hooks/useBoost';
import { useUserAds } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function BoostPromoSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBoost, setSelectedBoost] = useState<BoostType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: userAds, isLoading: adsLoading } = useUserAds();
  const boostAd = useBoostAd();

  // Filtrer les annonces approuvées qui ne sont pas déjà boostées
  const eligibleAds = userAds?.filter(ad => 
    ad.status === 'approved' && 
    (!ad.boost || !(ad as any).boost_expires_at || new Date((ad as any).boost_expires_at) < new Date())
  ) || [];

  const boostOptions = [
    {
      type: 'vedette' as BoostType,
      icon: Star,
      gradient: 'from-amber-400 to-orange-500',
      bgClass: 'bg-gradient-to-br from-amber-50 to-orange-50',
      iconClass: 'text-amber-500',
      borderClass: 'border-amber-200 hover:border-amber-400',
    },
    {
      type: 'urgent' as BoostType,
      icon: Zap,
      gradient: 'from-red-400 to-rose-500',
      bgClass: 'bg-gradient-to-br from-red-50 to-rose-50',
      iconClass: 'text-red-500',
      borderClass: 'border-red-200 hover:border-red-400',
    },
    {
      type: 'remontee' as BoostType,
      icon: ArrowUp,
      gradient: 'from-blue-400 to-indigo-500',
      bgClass: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconClass: 'text-blue-500',
      borderClass: 'border-blue-200 hover:border-blue-400',
    },
  ];

  const handleBoostClick = (boostType: BoostType) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour booster une annonce.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setSelectedBoost(boostType);
    setDialogOpen(true);
  };

  const handleSelectAd = async (adId: string) => {
    if (!selectedBoost) return;
    
    try {
      await boostAd.mutateAsync({ adId, boostType: selectedBoost });
      setDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <>
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">🚀 Boostez vos annonces</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Augmentez la visibilité de vos annonces et vendez plus rapidement avec nos options de boost
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {boostOptions.map((option) => {
              const Icon = option.icon;
              const info = BOOST_PRICES[option.type];
              
              return (
                <Card 
                  key={option.type}
                  className={`relative overflow-hidden border-2 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${option.borderClass} ${option.bgClass}`}
                  onClick={() => handleBoostClick(option.type)}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${option.gradient}`} />
                  <CardHeader className="text-center pb-2">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-white shadow-md mb-3`}>
                      <Icon className={`h-8 w-8 ${option.iconClass}`} />
                    </div>
                    <CardTitle className="text-xl">{info.label}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">{info.price}€</span>
                      <span className="text-muted-foreground ml-1">/ 7 jours</span>
                    </div>
                    <Button className="w-full" variant={option.type === 'vedette' ? 'premium' : option.type === 'urgent' ? 'urgent' : 'default'}>
                      Choisir ce boost
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            💳 Paiement sécurisé via Stripe • Activation immédiate après paiement
          </p>
        </div>
      </section>

      {/* Dialog de sélection d'annonce */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBoost && (
                <>
                  {selectedBoost === 'vedette' && <Star className="h-5 w-5 text-amber-500" />}
                  {selectedBoost === 'urgent' && <Zap className="h-5 w-5 text-red-500" />}
                  {selectedBoost === 'remontee' && <ArrowUp className="h-5 w-5 text-blue-500" />}
                  Boost {selectedBoost && BOOST_PRICES[selectedBoost].label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Sélectionnez l'annonce que vous souhaitez booster
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {adsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : eligibleAds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {userAds?.length === 0 
                    ? "Vous n'avez pas encore d'annonces."
                    : "Aucune annonce éligible au boost. Vos annonces doivent être approuvées et ne pas être déjà boostées."}
                </p>
                <Button onClick={() => { setDialogOpen(false); navigate('/deposer'); }}>
                  Déposer une annonce
                </Button>
              </div>
            ) : (
              eligibleAds.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => handleSelectAd(ad.id)}
                  className="flex items-center gap-4 p-3 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-all hover:bg-muted/50"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {ad.images?.[0] ? (
                      <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{ad.title}</h4>
                    <p className="text-sm text-muted-foreground">{ad.price?.toLocaleString()} KMF</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Sélectionner
                  </Button>
                </div>
              ))
            )}
          </div>

          {boostAd.isPending && (
            <div className="flex items-center justify-center py-4 border-t">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span>Redirection vers le paiement...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
