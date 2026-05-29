import { useState, useEffect, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { ChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  Send,
  Loader2,
  AlertTriangle,
  MessageCircle,
  RefreshCw,
  User,
} from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.getMessages();
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    setSending(true);
    try {
      await mockApi.sendMessage(user.id, user.fullName, trimmed);
      setText('');
      await loadMessages(); // recarrega mensagens
    } catch (err: any) {
      
      alert(err.message || 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          Chat
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Comunicação em tempo real com a equipa
        </p>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-4 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <Loader2 size={32} className="animate-spin mr-3" />
            <span>Carregando mensagens...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-rose-500 gap-3">
            <AlertTriangle size={32} />
            <p>{error}</p>
            <button
              onClick={loadMessages}
              className="inline-flex items-center gap-2 text-sm underline hover:text-rose-600"
            >
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle size={48} className="mb-3" />
            <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
            <p className="text-sm">Inicie uma conversa!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isMine ? 'bg-blue-400' : 'bg-gray-300'}`}>
                      <User size={12} />
                    </div>
                    <span className="text-xs font-semibold">
                      {isMine ? 'Você' : msg.senderName}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-2 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input de envio */}
      <div className="bg-white rounded-xl shadow-sm p-3 flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva a sua mensagem... (Enter para enviar)"
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          rows={2}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          Enviar
        </button>
      </div>
    </div>
  );
}