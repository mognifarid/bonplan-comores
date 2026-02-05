import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function EditListing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Modifier l'annonce</h1>
        <p className="text-muted-foreground mb-6">Cette fonctionnalité sera bientôt disponible.</p>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </main>
      <Footer />
    </div>
  );
}
