import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send, ArrowLeft, Shield, CheckCircle, PenSquare, Mail, Search, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Conversation {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New message/email dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendMode, setSendMode] = useState<'message' | 'email'>('message');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeSending, setComposeSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchConversations();
  }, [isAdmin]);

  // Handle ?user= param: find existing open conversation or create one
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (!targetUserId || !isAdmin || !user || loading) return;

    const openConvForUser = async () => {
      // Check if there's an existing open conversation with this user
      const existingConv = conversations.find(c => c.user_id === targetUserId && c.status === 'open');
      if (existingConv) {
        setSelectedConversation(existingConv.id);
      } else {
        // Create a new conversation
        const { data: conv, error } = await supabase
          .from('conversations')
          .insert({ user_id: targetUserId, subject: 'Nouveau message' })
          .select()
          .single();
        if (conv && !error) {
          setConversations(prev => [conv, ...prev]);
          setSelectedConversation(conv.id);
        }
      }
      // Clear the param so it doesn't re-trigger
      setSearchParams({}, { replace: true });
    };

    openConvForUser();
  }, [searchParams, isAdmin, user, loading, conversations.length]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      const channel = supabase
        .channel(`admin-messages-${selectedConversation}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      // Mark unread messages from others as read
      const unreadIds = data.filter(m => !m.is_read && m.sender_id !== user?.id).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'envoyer.", variant: "destructive" });
    } else {
      setNewMessage('');
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', selectedConversation);
    }
    setSending(false);
  };

  const closeConversation = async (convId: string) => {
    await supabase.from('conversations').update({ status: 'closed' }).eq('id', convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, status: 'closed' } : c));
    toast({ title: "Conversation fermée" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Fetch users for the compose dialog
  const fetchUsers = async (search?: string) => {
    setUsersLoading(true);
    let query = supabase.from('profiles').select('user_id, full_name, avatar_url');
    if (search?.trim()) {
      query = query.ilike('full_name', `%${search.trim()}%`);
    }
    const { data } = await query.limit(50);
    setUsers(data || []);
    setUsersLoading(false);
  };

  const openComposeDialog = () => {
    setDialogOpen(true);
    setSelectedUsers([]);
    setComposeSubject('');
    setComposeContent('');
    setSendMode('message');
    fetchUsers();
  };

  const toggleUserSelection = (userProfile: UserProfile) => {
    setSelectedUsers(prev =>
      prev.some(u => u.user_id === userProfile.user_id)
        ? prev.filter(u => u.user_id !== userProfile.user_id)
        : [...prev, userProfile]
    );
  };

  const handleComposeSearch = (value: string) => {
    setUserSearch(value);
    fetchUsers(value);
  };

  const handleComposeSend = async () => {
    if (!selectedUsers.length || !composeSubject.trim() || !composeContent.trim() || !user) return;
    setComposeSending(true);

    try {
      if (sendMode === 'message') {
        // Create a conversation + first message for each selected user
        for (const selectedUser of selectedUsers) {
          const { data: conv, error: convError } = await supabase
            .from('conversations')
            .insert({
              user_id: selectedUser.user_id,
              subject: composeSubject.trim(),
            })
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
        fetchConversations();
      } else {
        // Send email via edge function - need to get emails
        // We'll fetch emails from auth via edge function
        const { data, error } = await supabase.functions.invoke('send-admin-email', {
          body: {
            userIds: selectedUsers.map(u => u.user_id),
            emails: selectedUsers.map(u => u.user_id), // Will be resolved server-side
            subject: composeSubject.trim(),
            content: composeContent.trim(),
          },
        });

        if (error) throw error;
        toast({ title: 'Emails envoyés', description: `Email envoyé à ${selectedUsers.length} utilisateur(s).` });
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Impossible d'envoyer.", variant: "destructive" });
    }

    setComposeSending(false);
  };

  if (authLoading || adminLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Messages des utilisateurs</h1>
          </div>
          <Button onClick={openComposeDialog} className="gap-2">
            <PenSquare className="h-4 w-4" />
            Nouveau message
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: 'calc(100vh - 250px)', minHeight: '400px' }}>
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">{conversations.length} conversation(s)</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedConversation === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <p className="font-medium text-sm text-foreground truncate">{conv.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(conv.updated_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    conv.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {conv.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation && selectedConv ? (
              <>
                <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <p className="font-medium text-sm text-foreground">{selectedConv.subject}</p>
                      <p className="text-xs text-muted-foreground">ID: {selectedConv.user_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  {selectedConv.status === 'open' && (
                    <Button variant="outline" size="sm" onClick={() => closeConversation(selectedConv.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Fermer
                    </Button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {selectedConv.status === 'open' && (
                  <div className="p-3 border-t border-border flex gap-2">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Répondre..." disabled={sending} />
                    <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Compose Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenSquare className="h-5 w-5 text-primary" />
              Nouveau message
            </DialogTitle>
            <DialogDescription>
              Sélectionnez des utilisateurs et envoyez-leur un message ou un email
            </DialogDescription>
          </DialogHeader>

          <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as 'message' | 'email')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="message" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Selected users badges */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map(u => (
                <Badge key={u.user_id} variant="secondary" className="gap-1 pr-1">
                  {u.full_name || 'Utilisateur'}
                  <button onClick={() => toggleUserSelection(u)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* User search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={userSearch}
              onChange={(e) => handleComposeSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto border border-border rounded-lg max-h-40 min-h-[100px]">
            {usersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun utilisateur trouvé</p>
            ) : (
              users.map(u => {
                const isSelected = selectedUsers.some(s => s.user_id === u.user_id);
                return (
                  <button
                    key={u.user_id}
                    onClick={() => toggleUserSelection(u)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-medium truncate">{u.full_name || 'Utilisateur sans nom'}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Subject & Content */}
          <Input
            placeholder="Sujet..."
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
          />
          <Textarea
            placeholder={sendMode === 'message' ? 'Votre message...' : 'Contenu de l\'email...'}
            value={composeContent}
            onChange={(e) => setComposeContent(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleComposeSend}
              disabled={composeSending || !selectedUsers.length || !composeSubject.trim() || !composeContent.trim()}
              className="gap-2"
            >
              {composeSending ? <Loader2 className="h-4 w-4 animate-spin" /> : sendMode === 'message' ? <Send className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {sendMode === 'message' ? 'Envoyer le message' : 'Envoyer l\'email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
