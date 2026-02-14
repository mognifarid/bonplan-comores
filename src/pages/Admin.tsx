import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { Loader2, Shield } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Gestion des annonces</h3>
            <p className="text-sm text-muted-foreground mb-4">Modérer et gérer les annonces</p>
            <Button variant="outline">Accéder</Button>
          </div>
          
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Statistiques</h3>
            <p className="text-sm text-muted-foreground mb-4">Voir les statistiques de la plateforme</p>
            <Button variant="outline" onClick={() => navigate('/admin/stats')}>Voir les stats</Button>
          </div>
          
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Signalements</h3>
            <p className="text-sm text-muted-foreground mb-4">Gérer les signalements d'annonces</p>
            <Button variant="outline">Voir les signalements</Button>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Messages</h3>
            <p className="text-sm text-muted-foreground mb-4">Répondre aux messages des utilisateurs</p>
            <Button variant="outline" onClick={() => navigate('/admin/messages')}>Voir les messages</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
