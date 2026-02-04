import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStats } from '@/hooks/useStats';

export function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stats } = useStats();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/annonces?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/annonces');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Headline */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight">
              Le Bon Plan
              <span className="block text-2xl md:text-3xl lg:text-4xl font-semibold opacity-90 mt-2">
                des Comores 🌴
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto">
              Achetez, vendez et trouvez tout ce dont vous avez besoin sur Grande Comore, Anjouan et Mohéli
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Que recherchez-vous ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto">
                Rechercher
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-12 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">
                {stats?.activeAds ?? 0}
              </p>
              <p className="text-sm text-primary-foreground/70">Annonces actives</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">
                {stats?.totalUsers ?? 0}
              </p>
              <p className="text-sm text-primary-foreground/70">Utilisateurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">3</p>
              <p className="text-sm text-primary-foreground/70">Îles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
