import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Menu, X, User, Bell, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdmin } from '@/hooks/useAdmin';

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/annonces?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/annonces');
    }
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté." });
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
              <span className="text-xl">🌴</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground leading-tight">Le Bon Plan</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Comores</p>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une annonce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-muted/50 border-transparent focus:border-primary"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/alertes')}>
              <Bell className="h-4 w-4" />
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" className="gap-2 text-primary" onClick={() => navigate('/admin')}>
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => navigate('/mes-annonces')}>
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profil')}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                <User className="h-4 w-4" />
                Connexion
              </Button>
            )}
            <Link to="/deposer">
              <Button variant="hero" size="default" className="gap-2">
                <Plus className="h-4 w-4" />
                Déposer
              </Button>
            </Link>
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <Link to="/deposer">
              <Button variant="hero" size="icon"><Plus className="h-5 w-5" /></Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </form>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container py-4 space-y-2">
            {user ? (
              <>
                {isAdmin && (
                  <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted w-full text-left text-primary">
                    <Shield className="h-5 w-5" />Admin
                  </button>
                )}
                <button onClick={() => { navigate('/mes-annonces'); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted w-full text-left">
                  <User className="h-5 w-5 text-muted-foreground" />Mes annonces
                </button>
                <button onClick={() => { navigate('/profil'); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted w-full text-left">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{getInitials()}</AvatarFallback></Avatar>Mon profil
                </button>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted w-full text-left">
                  <LogOut className="h-5 w-5 text-muted-foreground" />Déconnexion
                </button>
              </>
            ) : (
              <button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted w-full text-left">
                <User className="h-5 w-5 text-muted-foreground" />Connexion
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
