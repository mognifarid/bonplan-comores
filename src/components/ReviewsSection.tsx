import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

interface ReviewsSectionProps {
  adId: string;
  sellerId: string;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ adId, sellerId }: ReviewsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', adId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('ad_id', adId)
        .order('created_at', { ascending: false });

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
      })) as Review[];
    },
  });

  const createReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Non connecté');
      if (newRating === 0) throw new Error('Veuillez donner une note');

      const { error } = await supabase.from('reviews').insert({
        ad_id: adId,
        reviewer_id: user.id,
        seller_id: sellerId,
        rating: newRating,
        comment: newComment.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', adId] });
      setNewRating(0);
      setNewComment('');
      toast({ title: 'Avis publié !' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', adId] });
      toast({ title: 'Avis supprimé' });
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const canReview = user && user.id !== sellerId && !reviews.some(r => r.reviewer_id === user.id);

  return (
    <div className="bg-card rounded-xl p-6 border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Avis utilisateurs</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length} avis)
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      {canReview && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-foreground">Laisser un avis</p>
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <Textarea
            placeholder="Votre commentaire (optionnel)..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button
            onClick={() => createReview.mutate()}
            disabled={newRating === 0 || createReview.isPending}
            size="sm"
          >
            {createReview.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publier l'avis
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">Connectez-vous pour laisser un avis.</p>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3 p-3 rounded-lg border border-border/50">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={review.reviewer_avatar} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{review.reviewer_name}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  {user?.id === review.reviewer_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteReview.mutate(review.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground/70">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
