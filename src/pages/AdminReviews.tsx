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
import { Loader2, Shield, CheckCircle, XCircle, Trash2, ArrowLeft, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminReviews() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['adminReviews', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch reviewer profiles
      const reviewerIds = [...new Set((data || []).map(r => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, full_name, avatar_url')
        .in('user_id', reviewerIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      return (data || []).map(r => ({
        ...r,
        reviewer_name: profileMap.get(r.reviewer_id)?.full_name || 'Utilisateur',
        reviewer_avatar: profileMap.get(r.reviewer_id)?.avatar_url || undefined,
      }));
    },
    enabled: !!isAdmin,
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Avis mis à jour' });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Avis supprimé' });
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

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'En attente', variant: 'outline' },
      approved: { label: 'Approuvé', variant: 'default' },
      rejected: { label: 'Refusé', variant: 'destructive' },
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
          <h1 className="text-2xl font-bold text-foreground">Modération des avis</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { value: 'pending', label: 'En attente' },
            { value: 'approved', label: 'Approuvés' },
            { value: 'rejected', label: 'Refusés' },
            { value: 'all', label: 'Tous' },
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
        ) : !reviews.length ? (
          <p className="text-muted-foreground text-center py-12">Aucun avis trouvé.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-4 bg-card rounded-xl border border-border flex flex-col md:flex-row gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={review.reviewer_avatar} />
                  <AvatarFallback>{review.reviewer_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{review.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    {statusBadge(review.status)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {review.status !== 'approved' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateReviewStatus.mutate({ id: review.id, status: 'approved' })}
                      disabled={updateReviewStatus.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                    </Button>
                  )}
                  {review.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => updateReviewStatus.mutate({ id: review.id, status: 'rejected' })}
                      disabled={updateReviewStatus.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Refuser
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteReview.mutate(review.id)}
                    disabled={deleteReview.isPending}
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
    </div>
  );
}
