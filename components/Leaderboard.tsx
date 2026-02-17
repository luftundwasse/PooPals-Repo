
import React, { useState, useMemo } from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  lastResetDate: string | null;
}

const BADGE_MAP: Record<string, string> = {
  baby: '🐣',
  regular: '📅',
  super: '💨',
  centurion: '👑'
};

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, lastResetDate }) => {
  const [tab, setTab] = useState<'weekly' | 'allTime'>('weekly');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (tab === 'weekly') {
        return (b.weeklyCount || 0) - (a.weeklyCount || 0);
      }
      return b.poopCount - a.poopCount;
    });
  }, [entries, tab]);

  const formatDateWithTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      weekday: 'short'
    });
  };

  const formatJoinedDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'long', year: 'numeric', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12 relative">
      <div className="text-center">
        <div className="inline-block bg-[#FCE4EC] px-3 py-1 rounded-full border border-[#F8BBD0] mb-4 shadow-sm">
           <p className="text-[10px] font-black text-[#D81B60] uppercase tracking-widest">🇸🇬 SGT Sync Active</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-[#E0F2F1] p-1 rounded-2xl max-w-[240px] mx-auto mb-6 border-2 border-white kawaii-shadow">
          <button 
            onClick={() => setTab('weekly')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'weekly' ? 'bg-white text-[#8D6E63] shadow-sm' : 'text-[#8D6E63]/50'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTab('allTime')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'allTime' ? 'bg-white text-[#8D6E63] shadow-sm' : 'text-[#8D6E63]/50'}`}
          >
            All-Time
          </button>
        </div>

        <h2 className="text-2xl font-black text-[#5D4037] flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">{tab === 'weekly' ? '🏆' : '👑'}</span> 
          {tab === 'weekly' ? 'Weekly Battle' : 'The Pantheon'} 
          <span className="text-3xl">✨</span>
        </h2>
        
        <div className="flex flex-col items-center">
          <p className="text-[#A1887F] text-xs font-medium">
            {tab === 'weekly' ? 'Fresh board started recently!' : 'Legendary PooPals of all time'}
          </p>
          
          {tab === 'weekly' && lastResetDate && (
            <div className="mt-3 bg-white border-2 border-[#E0F2F1] px-4 py-1.5 rounded-2xl shadow-sm animate-bounce">
              <p className="text-[9px] font-black text-[#009688] uppercase tracking-widest leading-none mb-1 opacity-60">Board Restarted On</p>
              <p className="text-xs font-black text-[#00796B] uppercase tracking-tight">
                {formatDateWithTime(lastResetDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sortedEntries.map((entry, index) => {
          const rankColors = ['bg-[#FFF176]', 'bg-[#CFD8DC]', 'bg-[#FFCCBC]'];
          const isTop3 = index < 3;

          return (
            <button
              key={entry.id}
              onClick={() => setSelectedUser(entry)}
              className={`w-full bg-white rounded-2xl p-4 border-4 ${entry.isCurrentUser ? 'border-[#8D6E63]' : 'border-[#E0F2F1]'} kawaii-shadow flex items-center gap-4 relative transition-transform hover:-translate-y-1 active:scale-95 text-left`}
            >
              <div className={`w-10 h-10 min-w-10 rounded-full flex items-center justify-center font-black border-2 ${isTop3 ? rankColors[index] : 'bg-[#F5F5F5] border-gray-100'} text-[#5D4037]`}>
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-lg truncate ${entry.isCurrentUser ? 'text-[#8D6E63]' : 'text-[#5D4037]'}`}>
                    {entry.nickname}
                  </h3>
                  {entry.currentStreak && entry.currentStreak > 1 && (
                    <span className="bg-[#FFF176] text-[#5D4037] text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-sm">
                      🔥{entry.currentStreak}
                    </span>
                  )}
                </div>
                
                {entry.motto && (
                  <p className="text-[10px] text-[#AD1457] italic line-clamp-1 font-medium mb-1">
                    "{entry.motto}"
                  </p>
                )}
                
                <div className="flex gap-1 h-4 items-center">
                  {(entry.badges || []).map(bId => (
                    <span key={bId} className="text-xs" title={bId}>{BADGE_MAP[bId]}</span>
                  ))}
                  {(!entry.badges || entry.badges.length === 0) && (
                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">Rising Star</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-[#8D6E63]">
                  {tab === 'weekly' ? (entry.weeklyCount || 0) : entry.poopCount}
                </p>
                <p className="text-[8px] font-black text-[#A1887F] uppercase tracking-widest leading-none">
                  {tab === 'weekly' ? 'WEEKLY' : 'ALL-TIME'}<br/>PLOPS
                </p>
              </div>
              
              {index === 0 && <div className="absolute -top-2 -right-1 text-xl rotate-12 drop-shadow-sm">👑</div>}
            </button>
          );
        })}
        {sortedEntries.length === 0 && (
          <div className="text-center py-12 text-[#A1887F]/40 italic uppercase text-xs font-black tracking-widest">
            No plops logged yet...
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#5D4037]/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white rounded-[3rem] w-full max-w-sm border-8 border-[#FCE4EC] kawaii-shadow overflow-hidden animate-in zoom-in duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FCE4EC] text-[#D81B60] flex items-center justify-center font-black shadow-sm hover:scale-110 transition-transform"
            >
              ✕
            </button>

            <div className="bg-[#FCE4EC] p-8 text-center">
              <div className="text-6xl mb-4 floating">💩</div>
              <h3 className="text-2xl font-black text-[#D81B60] uppercase tracking-tighter">{selectedUser.nickname}</h3>
              <p className="text-sm font-medium text-[#AD1457] italic mt-1">"{selectedUser.motto || 'Just happy to be here!'}"</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFF8E1] rounded-2xl p-4 border-2 border-[#BCAAA4]/20 text-center">
                  <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest mb-1">Weekly Plops</p>
                  <p className="text-2xl font-black text-[#8D6E63]">{selectedUser.weeklyCount || 0}</p>
                </div>
                <div className="bg-[#E0F2F1] rounded-2xl p-4 border-2 border-[#80CBC4]/20 text-center">
                  <p className="text-[10px] font-black text-[#00796B] uppercase tracking-widest mb-1">All-Time</p>
                  <p className="text-2xl font-black text-[#009688]">{selectedUser.poopCount}</p>
                </div>
              </div>

              <div className="bg-white border-4 border-[#FCE4EC] rounded-2xl p-4 text-center">
                <p className="text-[10px] font-black text-[#AD1457] uppercase tracking-widest mb-3">🏅 Badge Collection</p>
                <div className="flex justify-center gap-3">
                  {(selectedUser.badges || []).length > 0 ? (selectedUser.badges || []).map(bId => (
                    <div key={bId} className="flex flex-col items-center gap-1 group">
                      <span className="text-3xl transition-transform group-hover:scale-125">{BADGE_MAP[bId]}</span>
                      <span className="text-[8px] font-black text-[#D81B60] uppercase">{bId}</span>
                    </div>
                  )) : (
                    <span className="text-[10px] font-bold text-gray-300 italic">No badges yet...</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-medium text-[#A1887F]">
                  <span className="uppercase tracking-widest font-black text-[9px]">Joined On</span>
                  <span className="text-[#5D4037]">{formatJoinedDate(selectedUser.joinedDate)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-[#A1887F]">
                  <span className="uppercase tracking-widest font-black text-[9px]">Current Streak</span>
                  <span className="text-[#D81B60] font-black">🔥 {selectedUser.currentStreak || 0} Days</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-3 bg-[#8D6E63] text-white rounded-2xl font-black uppercase tracking-widest kawaii-shadow hover:bg-[#795548] transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
