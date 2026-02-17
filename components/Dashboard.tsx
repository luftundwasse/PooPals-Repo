
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, PoopRecord } from '../types';

interface DashboardProps {
  user: UserProfile;
  lastResetDate: string | null;
  onLog: () => void;
  onDeleteLog: (logId: string) => void;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

const BADGE_MAP: Record<string, string> = {
  baby: '🐣',
  regular: '📅',
  super: '💨',
  centurion: '👑'
};

const Dashboard: React.FC<DashboardProps> = ({ user, lastResetDate, onLog, onDeleteLog, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMotto, setEditedMotto] = useState(user.motto || '');

  useEffect(() => {
    if (!isEditing) {
      setEditedMotto(user.motto || '');
    }
  }, [user.motto, isEditing]);

  const handleSaveMotto = () => {
    onUpdateUser({ motto: editedMotto });
    setIsEditing(false);
  };

  // Fix: Explicitly type logsArray and cast Object.values to PoopRecord[] to avoid 'unknown' type inference issues
  const logsArray = useMemo<PoopRecord[]>(() => {
    if (!user.logs) return [];
    return (Object.values(user.logs) as PoopRecord[]).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [user.logs]);

  // Fix: Explicitly type groupedLogs to ensure 'logs' in the entries map is not inferred as 'unknown'
  const groupedLogs = useMemo<Record<string, PoopRecord[]>>(() => {
    const groups: Record<string, PoopRecord[]> = {};
    logsArray.forEach(log => {
      const date = new Date(log.timestamp);
      const dateKey = date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [logsArray]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateWithTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const latestUpdates = useMemo(() => {
    const updates = [
      { id: 1, text: "Sync active with Singapore Time (SGT) for the community board! 🇸🇬", date: "System" },
      { id: 4, text: "Join our Telegram for feature requests & secret updates! ✈️", date: "Social", link: "https://t.me/+5KzV3zhbK5JhMDJl" },
    ];
    
    if (lastResetDate) {
      updates.unshift({ 
        id: 3, 
        text: `THE WEEKLY LOG HAS BEEN RESTARTED ON ${formatDateWithTime(lastResetDate)}. GOOD LUCK! 🧹`, 
        date: "RESTART",
        link: undefined
      });
    }
    
    return updates;
  }, [lastResetDate]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Latest Scoops (News Box) */}
      <div className="bg-[#E0F2F1] rounded-[2rem] p-5 border-4 border-white kawaii-shadow overflow-hidden relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl animate-pulse">📢</span>
          <h3 className="text-sm font-black text-[#00796B] uppercase tracking-tighter">The Weekly Scoop</h3>
        </div>
        <div className="space-y-3">
          {latestUpdates.map(news => (
            <div key={news.id} className={`flex gap-2 items-start text-[11px] leading-tight font-medium ${news.date === 'RESTART' ? 'text-[#D32F2F]' : 'text-[#004D40]'}`}>
               <span className={`${news.date === 'RESTART' ? 'bg-red-500 text-white shadow-sm' : 'bg-white/60 text-[#009688]'} px-2 py-0.5 rounded text-[8px] font-black uppercase min-w-[60px] text-center shrink-0`}>
                 {news.date}
               </span>
               {news.link ? (
                 <a href={news.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                   {news.text} <span className="text-[10px]">🔗</span>
                 </a>
               ) : (
                 <p className={news.date === 'RESTART' ? 'font-black' : ''}>{news.text}</p>
               )}
            </div>
          ))}
        </div>
        <div className="absolute -bottom-4 -right-4 text-5xl opacity-10 rotate-12">📰</div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 border-4 border-[#E0F2F1] kawaii-shadow text-center relative overflow-hidden">
        <div className="absolute top-4 left-4 bg-[#FFF176] px-2 py-1 rounded-full border-2 border-[#FBC02D] flex items-center gap-1 shadow-sm z-10">
          <span className="text-xs">🔥</span>
          <span className="text-[10px] font-black text-[#5D4037]">{user.currentStreak || 0}d</span>
        </div>

        <h2 className="text-3xl font-black text-[#5D4037] mb-1 break-words px-4 mt-4">{user.nickname}</h2>

        <div className="flex justify-center gap-1 mb-4 h-6">
          {(user.badges || []).map(bId => (
            <span key={bId} className="text-lg hover:scale-125 transition-transform" title={bId}>{BADGE_MAP[bId]}</span>
          ))}
          {(!user.badges || user.badges.length === 0) && <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-2">Newbie PooPal</span>}
        </div>

        <div className="mt-4 relative group">
          <div className="bg-[#FCE4EC] rounded-2xl p-4 border-2 border-[#F8BBD0] relative cursor-pointer hover:bg-[#FCE4EC]/80 transition-all" onClick={() => !isEditing && setIsEditing(true)}>
            <p className="text-[8px] font-black text-[#D81B60] uppercase tracking-widest mb-1">✨ My Daily Vibe ✨</p>
            {isEditing ? (
              <input
                autoFocus
                className="w-full bg-transparent border-b-2 border-[#D81B60] text-center font-bold text-[#AD1457] focus:outline-none py-1"
                value={editedMotto}
                onChange={(e) => setEditedMotto(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveMotto()}
                onBlur={handleSaveMotto}
              />
            ) : (
              <p className="text-sm font-medium text-[#AD1457] italic">"{user.motto || 'Tap to edit...'}"</p>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex gap-3 justify-center">
          <div className="bg-[#FFF8E1] rounded-2xl p-4 border-2 border-[#BCAAA4] flex-1">
            <p className="text-[8px] uppercase font-black tracking-widest text-[#A1887F] mb-1">Weekly</p>
            <p className="text-3xl font-black text-[#8D6E63]">{user.weeklyCount || 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border-2 border-[#E0F2F1] flex-1">
            <p className="text-[8px] uppercase font-black tracking-widest text-[#A1887F] mb-1">All-Time</p>
            <p className="text-3xl font-black text-[#BCAAA4]">{user.poopCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center py-4">
        <button onClick={onLog} className="group relative">
          <div className="absolute inset-0 bg-[#E0F2F1] rounded-full scale-125 opacity-20 group-active:scale-150 transition-transform duration-500"></div>
          <div className="relative w-44 h-44 bg-[#8D6E63] border-8 border-[#BCAAA4] rounded-full flex flex-col items-center justify-center kawaii-shadow bouncy z-10 hover:bg-[#795548] transition-colors">
            <span className="text-7xl mb-1 group-active:scale-110 transition-transform">💩</span>
            <span className="text-white font-black text-xl leading-tight uppercase">LOG IT</span>
          </div>
          <div className="mt-8 bg-white px-6 py-2 rounded-full border-2 border-[#E0F2F1] text-[#8D6E63] font-bold text-sm animate-bounce">Log your business! ✨</div>
        </button>
      </div>

      {/* Telegram Link Box */}
      <a 
        href="https://t.me/+5KzV3zhbK5JhMDJl" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-[#0088cc]/10 border-4 border-white rounded-[2rem] p-5 text-center kawaii-shadow hover:scale-[1.02] transition-transform active:scale-95 group"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl group-hover:rotate-12 transition-transform">✈️</span>
          <div className="text-left">
            <p className="text-[10px] font-black text-[#0088cc] uppercase tracking-widest leading-none mb-1">Community Hub</p>
            <p className="text-sm font-black text-[#004d66]">Join the Telegram Channel! ✨</p>
          </div>
        </div>
      </a>

      {/* Grouped History Log */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border-4 border-white kawaii-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[#5D4037] flex items-center gap-2"><span>📜</span> Recent Plops</h3>
        </div>
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {Object.keys(groupedLogs).length > 0 ? (Object.entries(groupedLogs) as [string, PoopRecord[]][]).map(([dateKey, logs]) => (
            <div key={dateKey} className="space-y-2">
              <div className="sticky top-0 z-10 bg-[#FFF8E1]/90 backdrop-blur-sm py-1 px-3 rounded-full border border-[#BCAAA4]/20 inline-block shadow-sm">
                <span className="text-[10px] font-black text-[#8D6E63] uppercase tracking-widest">{dateKey}</span>
              </div>
              <div className="space-y-2 pl-2">
                {logs.map(log => (
                  <div key={log.id} className="bg-white rounded-2xl p-3 border-2 border-[#FCE4EC] flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-left-2 duration-300 group/item">
                     <div className="flex flex-col">
                        <span className="text-lg font-bold text-[#5D4037]">{formatTime(log.timestamp)}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onDeleteLog(log.id)}
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-400 p-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
                          title="Delete log"
                        >
                          🗑️
                        </button>
                        <div className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">💩</div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-300 font-bold uppercase text-[10px] tracking-widest italic">No plops in the archives yet...</div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #BCAAA4; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
