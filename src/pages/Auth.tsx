import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Phone, Calendar } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Connexion réussie !" });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "Erreur", description: "Le nom et le prénom sont obligatoires.", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!birthDate) {
      toast({ title: "Erreur", description: "La date de naissance est obligatoire.", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!phone.trim()) {
      toast({ title: "Erreur", description: "Le numéro de téléphone est obligatoire.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    
    if (error) {
      toast({ title: "Erreur d'inscription", description: error.message, variant: "destructive" });
    } else {
      // Save profile data
      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          birth_date: birthDate,
        });
      }
      toast({ title: "Inscription réussie !", description: "Vérifiez votre email pour confirmer votre compte." });
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email envoyé !",
        description: "Vérifiez votre boîte de réception.",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌴</span>
            </div>
            <CardTitle>Le Bon Plan Comores</CardTitle>
            <CardDescription>Connectez-vous ou créez un compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Se connecter
                  </Button>
                  <Button type="button" variant="link" className="w-full" onClick={handleForgotPassword} disabled={loading}>
                    Mot de passe oublié ?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="regLastName">Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="regLastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="pl-10" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="regFirstName">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="regFirstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="pl-10" required />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regBirthDate">Date de naissance</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="regBirthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regPhone">Numéro de téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="regPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+269 3XX XX XX" className="pl-10" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="regEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="pl-10" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regPassword">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="regPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required minLength={6} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Créer un compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
