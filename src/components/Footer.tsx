import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
                <span className="text-xl">🌴</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Le Bon Plan</h3>
                <p className="text-xs text-muted-foreground">Comores</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              La plateforme d'annonces #1 aux Comores.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/annonces" className="text-sm text-muted-foreground hover:text-primary">Toutes les annonces</Link></li>
              <li><Link to="/deposer" className="text-sm text-muted-foreground hover:text-primary">Déposer une annonce</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Catégories</h4>
            <ul className="space-y-2">
              <li><Link to="/annonces?category=vehicules" className="text-sm text-muted-foreground hover:text-primary">🚗 Véhicules</Link></li>
              <li><Link to="/annonces?category=immobilier" className="text-sm text-muted-foreground hover:text-primary">🏠 Immobilier</Link></li>
              <li><Link to="/annonces?category=electronique" className="text-sm text-muted-foreground hover:text-primary">📱 Électronique</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <a href="mailto:mogni.farid@gmail.com" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
              <Mail className="h-3 w-3" />mogni.farid@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2024 Le Bon Plan Comores. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
