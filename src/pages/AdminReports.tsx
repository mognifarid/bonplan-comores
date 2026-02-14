import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Shield, Eye, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminReports() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, ads_public(id, title, images, status)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast({ title: 'Signalement supprimé' });
    },
  });

  const deleteAd = useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase.from('ads').delete().eq('id', adId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['publicAds'] });
      toast({ title: 'Annonce supprimée suite au signalement' });
    },
  });

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  const reasonLabels: Record<string, string> = {
    spam: 'Spam',
    inappropriate: 'Contenu inapproprié',
    fraud: 'Arnaque/Fraude',
    duplicate: 'Doublon',
    other: 'Autre',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Signalements</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !reports?.length ? (
          <p className="text-muted-foreground text-center py-12">Aucun signalement.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 bg-card rounded-xl border border-border flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {report.ads_public && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={(report.ads_public as any)?.images?.[0] || '/placeholder.svg'}
                        alt={(report.ads_public as any)?.title || 'Annonce'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {(report.ads_public as any)?.title || 'Annonce supprimée'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">Raison :</span> {reasonLabels[report.reason] || report.reason}
                  </p>
                  {report.details && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium">Détails :</span> {report.details}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {report.ad_id && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/annonce/${report.ad_id}`)}>
                      <Eye className="h-4 w-4 mr-1" /> Voir l'annonce
                    </Button>
                  )}
                  {report.ad_id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAd.mutate(report.ad_id)}
                      disabled={deleteAd.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer l'annonce
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReport.mutate(report.id)}
                    disabled={deleteReport.isPending}
                  >
                    Ignorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
