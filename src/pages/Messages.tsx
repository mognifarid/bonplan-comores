import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send, ArrowLeft, Plus, Trash2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  recipient_id: string | null;
  last_message?: string;
  unread_count?: number;
  otherUserName?: string;
  otherUserAvatar?: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      const channel = supabase
        .channel(`messages-${selectedConversation}`)
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
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data && user) {
      const otherUserIds = [...new Set(data.map(c => c.user_id === user.id ? c.recipient_id : c.user_id).filter(Boolean))] as string[];
      const profilesMap: Record<string, { name: string; avatar: string | null }> = {};
      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles_public')
          .select('user_id, full_name, avatar_url')
          .in('user_id', otherUserIds);
        profiles?.forEach(p => {
          if (p.user_id) profilesMap[p.user_id] = { name: p.full_name || 'Utilisateur', avatar: p.avatar_url };
        });
      }
      setConversations(data.map(c => {
        const otherId = c.user_id === user.id ? c.recipient_id : c.user_id;
        const profile = otherId ? profilesMap[otherId] : null;
        return {
          ...c,
          otherUserName: profile?.name || 'Utilisateur',
          otherUserAvatar: profile?.avatar || null,
        };
      }));
    }
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
      toast({ title: "Erreur", description: "Impossible d'envoyer le message.", variant: "destructive" });
    } else {
      setNewMessage('');
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', selectedConversation);
    }
    setSending(false);
  };

  const handleDeleteConversation = async (convId: string) => {
    await supabase.from('messages').delete().eq('conversation_id', convId);
    const { error } = await supabase.from('conversations').delete().eq('id', convId);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la conversation.", variant: "destructive" });
    } else {
      if (selectedConversation === convId) setSelectedConversation(null);
      setConversations(prev => prev.filter(c => c.id !== convId));
      toast({ title: "Conversation supprimée" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const getInitials = (name?: string) => {
    if (!name || name === 'Utilisateur') return null;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Mes messages
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/contact')}>
            <Plus className="h-4 w-4 mr-1" /> Nouveau message
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: 'calc(100vh - 250px)', minHeight: '400px' }}>
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune conversation</p>
                  <Button variant="link" size="sm" onClick={() => navigate('/contact')}>Envoyer un message</Button>
                </div>
              ) : (
                conversations.map(conv => (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors flex items-start gap-3 ${
                        selectedConversation === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0 mt-0.5">
                        <AvatarImage src={conv.otherUserAvatar || undefined} alt={conv.otherUserName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(conv.otherUserName) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate pr-8">{conv.otherUserName || 'Utilisateur'}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(conv.updated_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                          conv.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          {conv.status === 'open' ? 'Ouvert' : 'Fermé'}
                        </span>
                      </div>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-3 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Tous les messages seront supprimés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteConversation(conv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation && selectedConv ? (
              <>
                <div className="p-3 border-b border-border bg-muted/30 flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={selectedConv.otherUserAvatar || undefined} alt={selectedConv.otherUserName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(selectedConv.otherUserName) || <User className="h-3.5 w-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-foreground">{selectedConv.otherUserName || 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground truncate">{selectedConv.subject}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <Avatar className="h-7 w-7 flex-shrink-0 mb-1">
                            <AvatarImage src={selectedConv.otherUserAvatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {getInitials(selectedConv.otherUserName) || <User className="h-3 w-3" />}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                {selectedConv.status === 'open' && (
                  <div className="p-3 border-t border-border flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Écrire un message..."
                      disabled={sending}
                    />
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
    </div>
  );
}
