import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      const data = await api.getNotifications();
      setNotifications((data as any[]).map((n: any) => ({ id: n.id, userId: n.user_id, message: n.message, type: n.type, read: n.read, createdAt: n.created_at })));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotifications(); }, [user]);

  const markRead = async (id: number) => {
    try { await api.markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); }
    catch (err: any) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><Bell className="w-8 h-8 text-orange-600"/> Notificações</h1><p className="text-sm text-gray-500 mt-1">Alertas e avisos do sistema</p></div>
      {loading ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-500"><Loader2 size={40} className="animate-spin mb-4 text-orange-600"/><p>Carregando...</p></div> :
       error ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4"><AlertTriangle size={40}/><p>{error}</p><button onClick={loadNotifications} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"><RefreshCw size={16}/> Tentar novamente</button></div> :
       notifications.length === 0 ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400"><Bell size={56} className="mb-4"/><p className="text-xl font-semibold text-gray-500">Nenhuma notificação</p></div> :
       <div className="space-y-3">{notifications.map(n => <div key={n.id} className={`p-4 rounded-xl shadow flex justify-between items-center ${n.read ? 'bg-gray-50' : 'bg-white border-l-4 border-orange-500'}`}><div><p className="font-medium text-gray-800">{n.message}</p><p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('pt-PT')}</p></div>{!n.read && <button onClick={() => markRead(n.id)} className="text-sm text-orange-600 hover:underline">Marcar lida</button>}</div>)}</div>}
    </div>
  );
}