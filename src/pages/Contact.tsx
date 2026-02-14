import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Loader2, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      toast({ title: "Nom trop court", description: "Minimum 2 caractères.", variant: "destructive" });
      return;
    }
    if (form.subject.trim().length < 3) {
      toast({ title: "Sujet trop court", description: "Minimum 3 caractères.", variant: "destructive" });
      return;
    }
    if (form.message.trim().length < 10) {
      toast({ title: "Message trop court", description: "Minimum 10 caractères.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'envoyer le message.", variant: "destructive" });
    } else {
      toast({ title: "Message envoyé !", description: "Nous vous répondrons rapidement." });
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contactez-nous</h1>
          <p className="text-muted-foreground mb-8">
            Une question, une suggestion ou un problème ? Envoyez-nous un message et nous vous répondrons rapidement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <a href="mailto:bonplancomores@gmail.com" className="text-xs text-muted-foreground hover:text-primary">
                  bonplancomores@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Localisation</p>
                <p className="text-xs text-muted-foreground">Comores</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Réponse</p>
                <p className="text-xs text-muted-foreground">Sous 24-48h</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet *</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Sujet de votre message"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Écrivez votre message ici (minimum 10 caractères)..."
                required
                minLength={10}
                rows={6}
              />
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Envoyer le message
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
