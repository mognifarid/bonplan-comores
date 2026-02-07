import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Zap, ArrowUp, Loader2 } from 'lucide-react';
import { useBoostAd, BoostType, BOOST_PRICES } from '@/hooks/useBoost';

interface BoostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId: string | null;
}

export function BoostDialog({ open, onOpenChange, adId }: BoostDialogProps) {
  const boostAd = useBoostAd();

  const handleBoost = async (boostType: BoostType) => {
    if (!adId) return;
    
    await boostAd.mutateAsync({ adId, boostType });
    onOpenChange(false);
  };

  const boostOptions = [
    {
      type: 'vedette' as BoostType,
      icon: Star,
      color: 'amber',
      borderClass: 'border-amber-300 hover:border-amber-400',
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-500',
    },
    {
      type: 'urgent' as BoostType,
      icon: Zap,
      color: 'red',
      borderClass: 'border-red-300 hover:border-red-400',
      bgClass: 'bg-red-50',
      iconClass: 'text-red-500',
    },
    {
      type: 'remontee' as BoostType,
      icon: ArrowUp,
      color: 'blue',
      borderClass: 'border-blue-300 hover:border-blue-400',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Booster votre annonce</DialogTitle>
          <DialogDescription>
            Choisissez un type de boost pour augmenter la visibilité de votre annonce.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {boostOptions.map((option) => {
            const Icon = option.icon;
            const info = BOOST_PRICES[option.type];
            
            return (
              <Card 
                key={option.type}
                className={`border-2 cursor-pointer transition-all ${option.borderClass} ${option.bgClass}`}
                onClick={() => handleBoost(option.type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${option.bgClass}`}>
                        <Icon className={`h-6 w-6 ${option.iconClass}`} />
                      </div>
                      <div>
                        <h3 className="font-bold">{info.label}</h3>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{info.price}€</p>
                      <p className="text-xs text-muted-foreground">7 jours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {boostAd.isPending && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Redirection vers le paiement...</span>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Le paiement est sécurisé via Stripe.</p>
          <p>Votre boost sera activé immédiatement après le paiement.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
