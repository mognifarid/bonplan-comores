import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Shield, Eye, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminAds() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectAdId, setRejectAdId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: ads, isLoading } = useQuery({
    queryKey: ['adminAds', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) => {
      const updates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
      if (rejection_reason) updates.rejection_reason = rejection_reason;
      const { error } = await supabase.from('ads').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAds'] });
      toast({ title: 'Annonce mise à jour' });
    },
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAds'] });
      toast({ title: 'Annonce supprimée' });
    },
  });

  const handleReject = () => {
    if (rejectAdId) {
      updateStatus.mutate({ id: rejectAdId, status: 'rejected', rejection_reason: rejectionReason });
      setRejectDialogOpen(false);
      setRejectAdId(null);
      setRejectionReason('');
    }
  };

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

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'En attente', variant: 'outline' },
      approved: { label: 'Approuvée', variant: 'default' },
      rejected: { label: 'Refusée', variant: 'destructive' },
    };
    const s = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground">Gestion des annonces</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'pending', label: 'En attente' },
            { value: 'approved', label: 'Approuvées' },
            { value: 'rejected', label: 'Refusées' },
          ].map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !ads?.length ? (
          <p className="text-muted-foreground text-center py-12">Aucune annonce trouvée.</p>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 bg-card rounded-xl border border-border flex flex-col md:flex-row gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={ad.images?.[0] || '/placeholder.svg'}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{ad.title}</h3>
                    {statusBadge(ad.status)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{ad.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {ad.price?.toLocaleString()} KMF · {ad.island} · {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {ad.rejection_reason && (
                    <p className="text-sm text-destructive mt-1">Motif : {ad.rejection_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/annonce/${ad.id}`)}>
                    <Eye className="h-4 w-4 mr-1" /> Voir
                  </Button>
                  {ad.status !== 'approved' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: ad.id, status: 'approved' })}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                    </Button>
                  )}
                  {ad.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => { setRejectAdId(ad.id); setRejectDialogOpen(true); }}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Refuser
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAd.mutate(ad.id)}
                    disabled={deleteAd.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser l'annonce</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Motif du refus (optionnel)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleReject}>Confirmer le refus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
