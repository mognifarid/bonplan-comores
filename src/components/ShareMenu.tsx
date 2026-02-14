import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareMenuProps {
  title: string;
  price: string;
  url: string;
}

export function ShareMenu({ title, price, url }: ShareMenuProps) {
  const { toast } = useToast();
  const text = `${title} - ${price}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const networks = [
    { name: 'WhatsApp', icon: '💬', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Facebook', icon: '📘', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Twitter / X', icon: '🐦', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'Telegram', icon: '✈️', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'Email', icon: '📧', href: `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}` },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast({ title: 'Lien copié !' });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1 gap-2">
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="center">
        <div className="space-y-1">
          {networks.map((n) => (
            <a
              key={n.name}
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <span className="text-lg">{n.icon}</span>
              {n.name}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
          >
            <span className="text-lg">🔗</span>
            Copier le lien
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
