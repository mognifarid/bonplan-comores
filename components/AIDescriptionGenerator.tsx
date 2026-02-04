import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIDescriptionGeneratorProps {
  title: string;
  category: string;
  island: string;
  city: string;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
}

export function AIDescriptionGenerator({
  title,
  category,
  island,
  city,
  onDescriptionGenerated,
  disabled = false,
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez d'abord saisir un titre pour votre annonce.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Catégorie requise",
        description: "Veuillez d'abord sélectionner une catégorie.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { title, category, island, city },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.description) {
        onDescriptionGenerated(data.description);
        toast({
          title: "Description générée !",
          description: "Vous pouvez modifier la description générée selon vos besoins.",
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer la description.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !title.trim() || !category}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Générer avec IA
        </>
      )}
    </Button>
  );
}
