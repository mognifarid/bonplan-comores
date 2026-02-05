import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/ListingCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserAds, useSavedAds, useDeleteAd } from '@/hooks/useAds';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Edit, Eye, Clock, CheckCircle, XCircle, Star, Zap, ArrowUp, Heart } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: userAds = [], isLoading: adsLoading } = useUserAds();
  const { data: savedAds = [], isLoading: savedLoading } = useSavedAds();
  const deleteAd = useDeleteAd();

  const [activeTab, setActiveTab] = useState('mes-annonces');

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setActiveTab('boosts');
      toast({
        title: "Paiement réussi !",
        description: "Votre boost a été activé avec succès.",
      });
    }
  }, [searchParams, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const pendingAds = userAds.filter(ad => ad.status === 'pending');
  const approvedAds = userAds.filter(ad => ad.status === 'approved');
  const rejectedAds = userAds.filter(ad => ad.status === 'rejected');

  const handleDelete = async (id: string) => {
    try {
      await deleteAd.mutateAsync(id);
      toast({ title: "Annonce supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'annonce.", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Mon espace</h1>
          <Link to="/deposer">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="mes-annonces" className="gap-2">
              Mes annonces
              <Badge variant="secondary">{userAds.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sauvegardees" className="gap-2">
              <Heart className="h-4 w-4" />
              Sauvegardées
              <Badge variant="secondary">{savedAds.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="boosts" className="gap-2">
              <Star className="h-4 w-4" />
              Boosts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mes-annonces">
            {adsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userAds.length > 0 ? (
              <div className="space-y-4">
                {userAds.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={ad.images[0]} 
                          alt={ad.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">{ad.title}</h3>
                              <p className="text-lg font-bold text-primary">
                                {ad.price === 0 ? 'Gratuit' : `${new Intl.NumberFormat('fr-FR').format(ad.price)} KMF`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(ad.status)}
                              <Badge variant={ad.status === 'approved' ? 'default' : ad.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {getStatusLabel(ad.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views}</span>
                            {ad.boost && (
                              <Badge variant="outline" className="gap-1">
                                {ad.boost === 'vedette' && <Star className="h-3 w-3" />}
                                {ad.boost === 'urgent' && <Zap className="h-3 w-3" />}
                                {ad.boost === 'remontee' && <ArrowUp className="h-3 w-3" />}
                                {ad.boost}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Link to={`/annonce/${ad.id}`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="h-3 w-3" />
                                Voir
                              </Button>
                            </Link>
                            <Link to={`/annonce/${ad.id}/modifier`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Edit className="h-3 w-3" />
                                Modifier
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-1">
                                  <Trash2 className="h-3 w-3" />
                                  Supprimer
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer l'annonce ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(ad.id)}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'annonces.</p>
                  <Link to="/deposer">
                    <Button>Déposer ma première annonce</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sauvegardees">
            {savedLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : savedAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedAds.map((ad) => (
                  <ListingCard key={ad.id} listing={ad} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucune annonce sauvegardée.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="boosts">
            <Card>
              <CardHeader>
                <CardTitle>Booster vos annonces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-amber-300">
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <h3 className="font-bold">Vedette</h3>
                      <p className="text-2xl font-bold text-primary">6€</p>
                      <p className="text-sm text-muted-foreground">Mise en avant premium</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-red-300">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h3 className="font-bold">Urgent</h3>
                      <p className="text-2xl font-bold text-primary">3€</p>
                      <p className="text-sm text-muted-foreground">Vente rapide</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-blue-300">
                    <CardContent className="p-4 text-center">
                      <ArrowUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-bold">Remontée</h3>
                      <p className="text-2xl font-bold text-primary">1,50€</p>
                      <p className="text-sm text-muted-foreground">Remonter en haut</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
