import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ListingCard } from '@/components/ListingCard';
import { IslandSelector } from '@/components/IslandSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Island } from '@/types/listing';
import { usePublicAds } from '@/hooks/useAds';
import { Search, Filter, Loader2, X } from 'lucide-react';

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedIsland, setSelectedIsland] = useState<Island | 'all'>((searchParams.get('island') as Island) || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings = [], isLoading } = usePublicAds({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    island: selectedIsland !== 'all' ? selectedIsland : undefined,
    search: searchQuery || undefined,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedIsland !== 'all') params.set('island', selectedIsland);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedIsland, minPrice, maxPrice, setSearchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedIsland('all');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedIsland !== 'all' || minPrice || maxPrice;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Toutes les annonces</h1>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 md:hidden"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Filtres</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <X className="h-3 w-3" />
                    Effacer
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Island */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Île</label>
                <IslandSelector selected={selectedIsland} onSelect={setSelectedIsland} />
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Prix (KMF)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {listings.length} annonce{listings.length > 1 ? 's' : ''} trouvée{listings.length > 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground mb-4">Aucune annonce ne correspond à vos critères.</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
