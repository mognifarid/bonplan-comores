import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useVerifyPayment } from '@/hooks/useBoost';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider');
  const token = searchParams.get('token'); // PayPal order ID
  const sessionId = searchParams.get('session_id'); // Stripe session ID
  const verifyPayment = useVerifyPayment();
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    if (captured) return;

    if (provider === 'paypal' && token) {
      // Capture PayPal payment
      setCaptured(true);
      verifyPayment.mutate(
        { orderId: token, provider: 'paypal' },
        {
          onSuccess: () => {
            setTimeout(() => navigate('/mes-annonces?success=true'), 2500);
          },
          onError: () => {
            // stay on page, show error
          },
        }
      );
    } else {
      // Stripe: redirect to dashboard
      const timer = setTimeout(() => {
        navigate('/mes-annonces?success=true' + (sessionId ? `&session_id=${sessionId}` : ''));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [provider, token, sessionId, navigate, captured]);

  const isError = verifyPayment.isError;
  const isLoading = verifyPayment.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            {isError ? (
              <>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Erreur de paiement</h1>
                <p className="text-muted-foreground mb-6">Le paiement n'a pas pu être finalisé.</p>
                <Button onClick={() => navigate('/mes-annonces')} className="mt-4">
                  Retour à mes annonces
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {isLoading ? 'Finalisation du paiement...' : 'Paiement réussi !'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {isLoading ? 'Veuillez patienter...' : 'Votre boost a été activé avec succès.'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLoading ? 'Traitement en cours...' : 'Redirection...'}
                </div>
                <Button onClick={() => navigate('/mes-annonces?success=true')} className="mt-4">
                  Voir mes annonces
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
