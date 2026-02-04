import { useState } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReportAdModalProps {
  adId: string;
  adTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: 'scam', label: 'Arnaque / Fraude', icon: '🚨' },
  { id: 'inappropriate', label: 'Contenu inapproprié', icon: '🔞' },
  { id: 'duplicate', label: 'Annonce en double', icon: '📋' },
  { id: 'fake', label: 'Annonce fausse / Trompeuse', icon: '❌' },
  { id: 'other', label: 'Autre raison', icon: '📝' },
];

export function ReportAdModal({ adId, adTitle, isOpen, onClose }: ReportAdModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Raison requise",
        description: "Veuillez sélectionner une raison pour le signalement.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          ad_id: adId,
          user_id: user?.id || null,
          reason,
          details: details.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Signalement envoyé ✓",
        description: "Merci pour votre signalement. Notre équipe va examiner cette annonce.",
      });

      onClose();
      setReason('');
      setDetails('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le signalement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Signaler cette annonce
          </DialogTitle>
          <DialogDescription>
            Signalez l'annonce "{adTitle}" si elle enfreint nos règles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Raison du signalement *</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    reason === r.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setReason(r.id)}
                >
                  <RadioGroupItem value={r.id} id={r.id} />
                  <Label htmlFor={r.id} className="flex items-center gap-2 cursor-pointer flex-1">
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Détails supplémentaires (optionnel)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{details.length}/500</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Signaler
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
