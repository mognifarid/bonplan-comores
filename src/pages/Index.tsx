import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CategoryCard } from '@/components/CategoryCard';
import { ListingCard } from '@/components/ListingCard';
import { BoostedAdsSection } from '@/components/BoostedAdsSection';
import { IslandSelector } from '@/components/IslandSelector';
import { CATEGORIES, Island } from '@/types/listing';
import { usePublicAds } from '@/hooks/useAds';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Index() {
  const [selectedIsland, setSelectedIsland] = useState<Island | 'all'>('all');
  
  const { data: allListings = [], isLoading } = usePublicAds({
    island: selectedIsland === 'all' ? undefined : selectedIsland,
  });

  const featuredListings = allListings.filter(l => l.boost === 'vedette');
  const urgentListings = allListings.filter(l => l.boost === 'urgent');
  const boostedListings = allListings.filter(l => l.boost === 'remontee');
  const recentListings = allListings.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Hero />

        <div className="container py-12 space-y-12">
          {/* Categories */}
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6">Catégories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>

          {/* Island Filter */}
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-4">Filtrer par île</h2>
            <IslandSelector selected={selectedIsland} onSelect={setSelectedIsland} />
          </section>

          {/* Boosted Ads */}
          <BoostedAdsSection
            featuredListings={featuredListings}
            urgentListings={urgentListings}
            boostedListings={boostedListings}
          />

          {/* Recent Listings */}
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Annonces récentes</h2>
              <Link to="/annonces">
                <Button variant="ghost" className="gap-2">
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucune annonce pour le moment.</p>
                <Link to="/deposer">
                  <Button variant="hero" className="mt-4">
                    Déposer la première annonce
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
