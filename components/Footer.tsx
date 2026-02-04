import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
export function Footer() {
  return <footer className="bg-card border-t border-border mt-16">
      <div className="container py-12 bg-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
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
              La plateforme d'annonces #1 aux Comores. Achetez, vendez facilement sur Grande Comore, Anjouan et Mohéli.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/annonces" className="text-sm text-muted-foreground hover:text-primary transition-colors">Toutes les annonces</Link></li>
              <li><Link to="/deposer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Déposer une annonce</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tarifs boost</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Catégories</h4>
            <ul className="space-y-2">
              <li><Link to="/annonces?category=vehicules" className="text-sm text-muted-foreground hover:text-primary transition-colors">🚗 Véhicules</Link></li>
              <li><Link to="/annonces?category=immobilier" className="text-sm text-muted-foreground hover:text-primary transition-colors">🏠 Immobilier</Link></li>
              <li><Link to="/annonces?category=electronique" className="text-sm text-muted-foreground hover:text-primary transition-colors">📱 Électronique</Link></li>
              <li><Link to="/annonces?category=emploi" className="text-sm text-muted-foreground hover:text-primary transition-colors">💼 Emploi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Informations</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">À propos</Link></li>
              <li>
                <a href="mailto:mogni.farid@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Contact
                </a>
              </li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Le Bon Plan Comores. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:mogni.farid@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              mogni.farid@gmail.com
            </a>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <span className="text-lg">💳</span>
              <span className="text-sm font-medium text-foreground">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}