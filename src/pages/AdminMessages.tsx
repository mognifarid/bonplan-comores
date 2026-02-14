import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export default function AdminMessages() {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchConversations();
  }, [isAdmin]);

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
    if (data) setMessages(data);
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

  if (authLoading || adminLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Messages des utilisateurs</h1>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: 'calc(100vh - 250px)', minHeight: '400px' }}>
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
    </div>
  );
}
