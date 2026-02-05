import { useState } from 'react';
import { Star, Zap, ArrowUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListingCard } from '@/components/ListingCard';
import { Listing } from '@/types/listing';

interface BoostedAdsSectionProps {
  featuredListings: Listing[];
  urgentListings: Listing[];
  boostedListings: Listing[];
}

export function BoostedAdsSection({ featuredListings, urgentListings, boostedListings }: BoostedAdsSectionProps) {
  const [activeTab, setActiveTab] = useState('vedette');

  const hasBoostedAds = featuredListings.length > 0 || urgentListings.length > 0 || boostedListings.length > 0;

  if (!hasBoostedAds) return null;

  return (
    <section className="animate-fade-in">
      <div className="bg-gradient-to-r from-accent/10 via-primary/5 to-destructive/10 rounded-2xl p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-premium flex items-center justify-center">
            <Star className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Annonces Boostées</h2>
            <p className="text-sm text-muted-foreground">Les meilleures offres du moment</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-card/80">
            <TabsTrigger value="vedette" className="gap-2" disabled={featuredListings.length === 0}>
              <Star className="h-4 w-4" />Vedettes ({featuredListings.length})
            </TabsTrigger>
            <TabsTrigger value="urgent" className="gap-2" disabled={urgentListings.length === 0}>
              <Zap className="h-4 w-4" />Urgentes ({urgentListings.length})
            </TabsTrigger>
            <TabsTrigger value="remontee" className="gap-2" disabled={boostedListings.length === 0}>
              <ArrowUp className="h-4 w-4" />Remontées ({boostedListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vedette">
            {featuredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredListings.map((listing) => (<ListingCard key={listing.id} listing={listing} />))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucune annonce vedette</div>
            )}
          </TabsContent>

          <TabsContent value="urgent">
            {urgentListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {urgentListings.map((listing) => (<ListingCard key={listing.id} listing={listing} />))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucune annonce urgente</div>
            )}
          </TabsContent>

          <TabsContent value="remontee">
            {boostedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {boostedListings.map((listing) => (<ListingCard key={listing.id} listing={listing} />))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Aucune annonce remontée</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
