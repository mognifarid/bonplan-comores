import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicAd, useIsAdSaved, useSaveAd, useUnsaveAd } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ISLANDS } from '@/types/listing';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  MapPin, Clock, Eye, Phone, Heart, Share2, Flag, 
  ChevronLeft, ChevronRight, Star, Zap, ArrowUp, Loader2 
} from 'lucide-react';
import { useState } from 'react';
import { ReportAdModal } from '@/components/ReportAdModal';
import { ShareMenu } from '@/components/ShareMenu';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data: listing, isLoading, error } = usePublicAd(id!);
  const { data: isSaved } = useIsAdSaved(id!);
  const saveAd = useSaveAd();
  const unsaveAd = useUnsaveAd();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Annonce non trouvée</h1>
          <p className="text-muted-foreground mb-6">Cette annonce n'existe pas ou a été supprimée.</p>
          <Link to="/annonces">
            <Button>Voir toutes les annonces</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const islandLabel = ISLANDS.find(i => i.value === listing.island)?.label || listing.island;

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(price) + ' KMF';
  };

  const handleShowPhone = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour voir le numéro du vendeur.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setLoadingPhone(true);
    try {
      const { data, error } = await supabase.rpc('get_ad_phone_number', { ad_id: listing.id });
      if (error) throw error;
      setPhoneNumber(data);
      setShowPhone(true);
    } catch {
      toast({ title: "Erreur", description: "Impossible de récupérer le numéro.", variant: "destructive" });
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour sauvegarder des annonces.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    try {
      if (isSaved) {
        await unsaveAd.mutateAsync(listing.id);
        toast({ title: "Annonce retirée des favoris" });
      } else {
        await saveAd.mutateAsync(listing.id);
        toast({ title: "Annonce sauvegardée" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    }
  };

  const getBoostBadge = () => {
    switch (listing.boost) {
      case 'vedette':
        return <Badge className="bg-gradient-premium text-accent-foreground gap-1"><Star className="h-3 w-3" />Vedette</Badge>;
      case 'urgent':
        return <Badge className="bg-gradient-urgent text-destructive-foreground gap-1"><Zap className="h-3 w-3" />Urgent</Badge>;
      case 'remontee':
        return <Badge variant="secondary" className="gap-1"><ArrowUp className="h-3 w-3" />Remonté</Badge>;
      default:
        return null;
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {listing.boost && (
                <div className="absolute top-4 left-4">{getBoostBadge()}</div>
              )}
              {listing.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {listing.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
              <Badge variant="secondary">{listing.category.icon} {listing.category.name}</Badge>
              <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
              <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.city}, {islandLabel}</span>
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{listing.views} vues</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDistanceToNow(listing.createdAt, { addSuffix: true, locale: fr })}</span>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                {showPhone && phoneNumber ? (
                  <a href={`tel:${phoneNumber}`}>
                    <Button className="w-full gap-2" size="lg">
                      <Phone className="h-4 w-4" />
                      {phoneNumber}
                    </Button>
                  </a>
                ) : (
                  <Button onClick={handleShowPhone} disabled={loadingPhone} className="w-full gap-2" size="lg">
                    {loadingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    {user ? 'Voir le numéro' : 'Connectez-vous pour voir le numéro'}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleSaveToggle}>
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-destructive' : ''}`} />
                    {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
                  </Button>
                  <ShareMenu
                    title={listing.title}
                    price={formatPrice(listing.price)}
                    url={window.location.href}
                  />
                </div>

                <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => setShowReportModal(true)}>
                  <Flag className="h-4 w-4" />
                  Signaler cette annonce
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ReportAdModal
        adId={id!}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
