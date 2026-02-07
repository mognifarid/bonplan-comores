import { Link } from 'react-router-dom';
import { MapPin, Clock, Eye, Star, Zap, ArrowUp } from 'lucide-react';
import { Listing, ISLANDS } from '@/types/listing';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
}

export function ListingCard({ listing, featured = false }: ListingCardProps) {
  const islandLabel = ISLANDS.find(i => i.value === listing.island)?.label || listing.island;
  
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(price) + ' KMF';
  };

  const getBoostBadge = () => {
    switch (listing.boost) {
      case 'vedette':
        return <Badge className="bg-gradient-premium text-accent-foreground gap-1 border-0"><Star className="h-3 w-3" />Vedette</Badge>;
      case 'urgent':
        return <Badge className="bg-gradient-urgent text-destructive-foreground gap-1 border-0"><Zap className="h-3 w-3" />Urgent</Badge>;
      case 'remontee':
        return <Badge variant="secondary" className="gap-1"><ArrowUp className="h-3 w-3" />Remonté</Badge>;
      default:
        return null;
    }
  };

  return (
    <Link
      to={`/annonce/${listing.id}`}
      className={`group block rounded-xl overflow-hidden bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 ${featured ? 'ring-2 ring-amber-300' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {listing.boost && <div className="absolute top-2 left-2">{getBoostBadge()}</div>}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">{listing.category.icon} {listing.category.name}</Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{listing.title}</h3>
        <p className="text-xl font-bold text-primary">{formatPrice(listing.price)}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.city}, {islandLabel}</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.views}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(listing.createdAt, { addSuffix: true, locale: fr })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
