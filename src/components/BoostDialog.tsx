import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Zap, ArrowUp, Loader2, CreditCard } from 'lucide-react';
import { useBoostAd, BoostType, PaymentProvider, BOOST_PRICES } from '@/hooks/useBoost';

interface BoostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId: string | null;
}

export function BoostDialog({ open, onOpenChange, adId }: BoostDialogProps) {
  const boostAd = useBoostAd();
  const [selectedBoost, setSelectedBoost] = useState<BoostType | null>(null);

  const handleBoost = async (boostType: BoostType, provider: PaymentProvider) => {
    if (!adId) return;
    await boostAd.mutateAsync({ adId, boostType, provider });
    onOpenChange(false);
    setSelectedBoost(null);
  };

  const boostOptions = [
    {
      type: 'vedette' as BoostType,
      icon: Star,
      borderClass: 'border-amber-300 hover:border-amber-400',
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-500',
    },
    {
      type: 'urgent' as BoostType,
      icon: Zap,
      borderClass: 'border-red-300 hover:border-red-400',
      bgClass: 'bg-red-50',
      iconClass: 'text-red-500',
    },
    {
      type: 'remontee' as BoostType,
      icon: ArrowUp,
      borderClass: 'border-blue-300 hover:border-blue-400',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSelectedBoost(null); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {selectedBoost ? 'Choisissez votre moyen de paiement' : 'Booster votre annonce'}
          </DialogTitle>
          <DialogDescription>
            {selectedBoost
              ? `${BOOST_PRICES[selectedBoost].label} — ${BOOST_PRICES[selectedBoost].price}€`
              : 'Choisissez un type de boost pour augmenter la visibilité de votre annonce.'}
          </DialogDescription>
        </DialogHeader>

        {!selectedBoost ? (
          <div className="grid gap-4 py-4">
            {boostOptions.map((option) => {
              const Icon = option.icon;
              const info = BOOST_PRICES[option.type];
              return (
                <Card
                  key={option.type}
                  className={`border-2 cursor-pointer transition-all ${option.borderClass} ${option.bgClass}`}
                  onClick={() => setSelectedBoost(option.type)}
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
        ) : (
          <div className="grid gap-4 py-4">
            {/* Stripe */}
            <Card
              className="border-2 cursor-pointer transition-all border-indigo-300 hover:border-indigo-400 bg-indigo-50"
              onClick={() => handleBoost(selectedBoost, 'stripe')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-indigo-100">
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Carte bancaire (Stripe)</h3>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PayPal */}
            <Card
              className="border-2 cursor-pointer transition-all border-yellow-300 hover:border-yellow-400 bg-yellow-50"
              onClick={() => handleBoost(selectedBoost, 'paypal')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-yellow-100">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.654h6.23c2.094 0 3.612.56 4.51 1.665.39.48.656 1.005.795 1.562.15.6.183 1.32.098 2.14l-.012.1v.46l.357.203c.303.162.545.35.731.563.324.371.534.833.624 1.373.093.554.062 1.215-.09 1.963-.177.86-.464 1.608-.855 2.22a4.62 4.62 0 0 1-1.348 1.42c-.533.37-1.162.643-1.872.81-.69.163-1.472.246-2.322.246H12.1a.95.95 0 0 0-.94.805l-.035.2-.596 3.767-.025.143a.95.95 0 0 1-.94.806H7.076Z" fill="#253B80"/>
                      <path d="M19.44 8.077c-.01.064-.022.128-.035.194-.898 4.614-3.97 6.208-7.893 6.208H9.51a.97.97 0 0 0-.959.82l-1.024 6.49-.29 1.84a.51.51 0 0 0 .504.59h3.545a.853.853 0 0 0 .843-.718l.035-.18.668-4.233.043-.234a.853.853 0 0 1 .843-.72h.531c3.436 0 6.127-1.396 6.914-5.434.33-1.686.159-3.093-.712-4.08a3.382 3.382 0 0 0-.965-.743Z" fill="#179BD7"/>
                      <path d="M18.44 7.672a7.65 7.65 0 0 0-.943-.21 11.96 11.96 0 0 0-1.902-.14h-5.76a.85.85 0 0 0-.842.718L7.98 14.88l-.032.204a.97.97 0 0 1 .959-.82h2.002c3.923 0 6.995-1.594 7.893-6.207.027-.137.048-.27.066-.4a4.71 4.71 0 0 0-.427-.185Z" fill="#222D65"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold">PayPal</h3>
                    <p className="text-sm text-muted-foreground">Payez avec votre compte PayPal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button variant="ghost" onClick={() => setSelectedBoost(null)} className="mt-2">
              ← Retour au choix du boost
            </Button>
          </div>
        )}

        {boostAd.isPending && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Redirection vers le paiement...</span>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Le paiement est sécurisé via Stripe ou PayPal.</p>
          <p>Votre boost sera activé immédiatement après le paiement.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
