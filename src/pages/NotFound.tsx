import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-4">🏝️</div>
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Oups ! Cette page semble s'être perdue quelque part dans l'archipel des Comores...
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/annonces">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Voir les annonces
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
