import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, ShoppingBag, Star, MessageSquare } from 'lucide-react';
import { CATEGORIES, type Listing, type BoostType } from '@/types/listing';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

function transformAdToListing(ad: any, profile?: { full_name?: string | null; avatar_url?: string | null } | null): Listing {
  const category = CATEGORIES.find(c => c.slug === ad.category) || CATEGORIES[0];
  return {
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: ad.price,
    currency: 'KMF',
    category,
    island: ad.island,
    city: ad.city || '',
    images: ad.images || ['/placeholder.svg'],
    createdAt: new Date(ad.created_at),
    updatedAt: new Date(ad.updated_at),
    status: ad.status,
    boost: ad.boost as BoostType,
    userId: ad.user_id,
    userName: profile?.full_name || '',
    userAvatarUrl: profile?.avatar_url || undefined,
    views: ad.views || 0,
  };
}

export default function SellerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['sellerProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: listings, isLoading: adsLoading } = useQuery({
    queryKey: ['sellerAds', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_public')
        .select('*')
        .eq('user_id', userId!)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(ad => transformAdToListing(ad, profile));
    },
    enabled: !!userId && !profileLoading,
  });

  // Fetch all approved reviews for this seller
  const { data: sellerReviews = [] } = useQuery({
    queryKey: ['sellerReviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', userId!)
        .eq('status', 'approved');
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const averageRating = sellerReviews.length > 0
    ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
    : 0;

  const isLoading = profileLoading || adsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !profile ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-2">Utilisateur introuvable</h1>
            <p className="text-muted-foreground">Ce profil n'existe pas.</p>
          </div>
        ) : (
          <>
            {/* Seller header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 p-6 bg-card rounded-xl border border-border">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ''} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{profile.full_name || 'Utilisateur'}</h1>
                <p className="text-sm text-muted-foreground">
                  Membre depuis {formatDistanceToNow(new Date(profile.created_at!), { locale: fr })}
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  {listings?.length || 0} annonce(s) en ligne
                </div>
                {sellerReviews.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({sellerReviews.length} avis)</span>
                  </div>
                )}
              </div>
              {user && user.id !== userId && (
                <Button
                  onClick={() => navigate(`/contact?vendeur=${encodeURIComponent(profile.full_name || 'Vendeur')}`)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Button>
              )}
            </div>

            {/* Listings grid */}
            <h2 className="text-xl font-semibold text-foreground mb-4">Annonces de {profile.full_name || 'cet utilisateur'}</h2>
            {listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">Aucune annonce pour le moment.</p>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}