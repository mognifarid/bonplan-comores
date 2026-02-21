import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useStats } from '@/hooks/useStats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Users, FileText, TrendingUp, Search, Check, X,
  MessageSquare, Mail, Send, CheckSquare, Square,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export default function AdminStats() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats } = useStats();
  const { toast } = useToast();

  // Users tab state
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Compose dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendMode, setSendMode] = useState<'message' | 'email'>('message');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeSending, setComposeSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, phone, created_at')
      .order('created_at', { ascending: false });
    setAllUsers(data || []);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const filteredUsers = allUsers.filter(u => {
    if (!userSearch.trim()) return true;
    const search = userSearch.toLowerCase();
    return (u.full_name?.toLowerCase().includes(search)) ||
           (u.phone?.toLowerCase().includes(search));
  });

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.user_id)));
    }
  };

  const selectedUsers = allUsers.filter(u => selectedUserIds.has(u.user_id));

  const handleMessageRedirect = async () => {
    if (selectedUsers.length === 0) {
      toast({ title: 'Aucun utilisateur sélectionné', description: 'Cochez au moins un utilisateur.', variant: 'destructive' });
      return;
    }
    if (selectedUsers.length === 1) {
      // Single user: navigate directly to admin messages for that user
      navigate(`/admin/messages?user=${selectedUsers[0].user_id}`);
    } else {
      toast({ title: 'Sélection multiple', description: 'Veuillez sélectionner un seul utilisateur pour envoyer un message.', variant: 'destructive' });
    }
  };

  const openComposeDialog = (mode: 'message' | 'email') => {
    if (selectedUsers.length === 0) {
      toast({ title: 'Aucun utilisateur sélectionné', description: 'Cochez au moins un utilisateur.', variant: 'destructive' });
      return;
    }
    setSendMode(mode);
    setComposeSubject('');
    setComposeContent('');
    setDialogOpen(true);
  };

  const handleComposeSend = async () => {
    if (!selectedUsers.length || !composeSubject.trim() || !composeContent.trim() || !user) return;
    setComposeSending(true);

    try {
      if (sendMode === 'message') {
        for (const selectedUser of selectedUsers) {
          const { data: conv, error: convError } = await supabase
            .from('conversations')
            .insert({ user_id: selectedUser.user_id, subject: composeSubject.trim() })
            .select()
            .single();
          if (convError) throw convError;

          const { error: msgError } = await supabase.from('messages').insert({
            conversation_id: conv.id,
            sender_id: user.id,
            content: composeContent.trim(),
          });
          if (msgError) throw msgError;
        }
        toast({ title: 'Messages envoyés', description: `${selectedUsers.length} conversation(s) créée(s).` });
      } else {
        const { error } = await supabase.functions.invoke('send-admin-email', {
          body: {
            userIds: selectedUsers.map(u => u.user_id),
            emails: selectedUsers.map(u => u.user_id),
            subject: composeSubject.trim(),
            content: composeContent.trim(),
          },
        });
        if (error) throw error;
        toast({ title: 'Emails envoyés', description: `Email envoyé à ${selectedUsers.length} utilisateur(s).` });
      }
      setDialogOpen(false);
      setSelectedUserIds(new Set());
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || "Impossible d'envoyer.", variant: 'destructive' });
    }
    setComposeSending(false);
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const allSelected = filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Administration</h1>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Annonces actives</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeAds ?? 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Îles couvertes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              {/* Actions bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou téléphone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedUsers.length === 0}
                    onClick={handleMessageRedirect}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message ({selectedUserIds.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedUsers.length === 0}
                    onClick={() => openComposeDialog('email')}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email ({selectedUserIds.size})
                  </Button>
                </div>
              </div>

              {/* Users table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left w-10">
                          <button onClick={toggleAll} className="flex items-center justify-center">
                            {allSelected ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-muted-foreground">Nom complet</th>
                        <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Téléphone</th>
                        <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                            Aucun utilisateur trouvé
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const isSelected = selectedUserIds.has(u.user_id);
                          return (
                            <tr
                              key={u.user_id}
                              onClick={() => toggleUser(u.user_id)}
                              className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                                isSelected ? 'bg-primary/5' : ''
                              }`}
                            >
                              <td className="p-3">
                                {isSelected ? (
                                  <CheckSquare className="h-5 w-5 text-primary" />
                                ) : (
                                  <Square className="h-5 w-5 text-muted-foreground" />
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium text-foreground">
                                    {u.full_name || 'Sans nom'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">
                                {u.phone || '—'}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
                                {format(new Date(u.created_at), 'dd MMM yyyy', { locale: fr })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                  {filteredUsers.length} utilisateur(s) • {selectedUserIds.size} sélectionné(s)
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Compose Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {sendMode === 'message' ? (
                <MessageSquare className="h-5 w-5 text-primary" />
              ) : (
                <Mail className="h-5 w-5 text-primary" />
              )}
              {sendMode === 'message' ? 'Envoyer un message' : 'Envoyer un email'}
            </DialogTitle>
            <DialogDescription>
              À {selectedUsers.length} utilisateur(s) sélectionné(s)
            </DialogDescription>
          </DialogHeader>

          {/* Selected users preview */}
          <div className="flex flex-wrap gap-1.5">
            {selectedUsers.slice(0, 10).map(u => (
              <Badge key={u.user_id} variant="secondary" className="text-xs">
                {u.full_name || 'Sans nom'}
              </Badge>
            ))}
            {selectedUsers.length > 10 && (
              <Badge variant="outline" className="text-xs">+{selectedUsers.length - 10} autres</Badge>
            )}
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Sujet"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />
            <Textarea
              placeholder="Votre message..."
              value={composeContent}
              onChange={(e) => setComposeContent(e.target.value)}
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleComposeSend}
              disabled={composeSending || !composeSubject.trim() || !composeContent.trim()}
              className="gap-2"
            >
              {composeSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
