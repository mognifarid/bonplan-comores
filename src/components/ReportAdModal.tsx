import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ReportAdModalProps {
  adId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Contenu inapproprié',
  'Arnaque ou fraude',
  'Produit illégal',
  'Annonce en double',
  'Mauvaise catégorie',
  'Autre',
];

export function ReportAdModal({ adId, isOpen, onClose }: ReportAdModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une raison.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reports').insert({
        ad_id: adId,
        reason,
        details: details || null,
      });

      if (error) throw error;

      toast({ title: "Signalement envoyé", description: "Merci pour votre signalement." });
      onClose();
      setReason('');
      setDetails('');
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler cette annonce</DialogTitle>
          <DialogDescription>Indiquez la raison du signalement</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={r} />
                <Label htmlFor={r}>{r}</Label>
              </div>
            ))}
          </RadioGroup>

          <div>
            <Label htmlFor="details">Détails (optionnel)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ajoutez des détails..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Envoyer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
