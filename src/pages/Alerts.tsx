import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function Alerts() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Mes alertes</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertes email
            </CardTitle>
            <CardDescription>
              Recevez des notifications pour les nouvelles annonces correspondant à vos critères
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez créer des alertes pour être notifié des nouvelles annonces.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
