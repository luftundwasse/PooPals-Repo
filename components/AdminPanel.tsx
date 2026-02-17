
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AdminPanelProps {
  users: UserProfile[];
  lastResetDate: string | null;
  onGlobalReset: () => void;
}

const BADGE_MAP: Record<string, string> = {
  baby: '🐣',
  regular: '📅',
  super: '💨',
  centurion: '👑'
};

const AdminPanel: React.FC<AdminPanelProps> = ({ users, lastResetDate, onGlobalReset }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const formatJoinedDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'long', year: 'numeric', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <div className="bg-white rounded-[2.5rem] p-6 border-4 border-red-100 kawaii-shadow text-center">
        <div className="text-6xl mb-4">🧨</div>
        <h2 className="text-2xl font-black text-red-600 mb-2 uppercase tracking-tight">Danger Zone</h2>
        <p className="text-sm text-gray-500 font-medium mb-2">Reset the weekly competition for all users globally.</p>
        
        {lastResetDate && (
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-6 bg-red-50 py-1 rounded-full">
            Last Reset: {new Date(lastResetDate).toLocaleString()}
          </p>
        )}
        
        <button 
          onClick={onGlobalReset}
          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-lg shadow-[0_6px_0_#b91c1c] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest"
        >
          Nuke Weekly Stats 🚀
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-6 border-4 border-[#E0F2F1] kawaii-shadow">
        <h3 className="text-lg font-black text-[#5D4037] mb-4 flex items-center justify-between">
          <span>👥 All PooPals</span>
          <span className="text-[10px] bg-[#E0F2F1] px-2 py-1 rounded-full uppercase">{users.length} Total</span>
        </h3>
        <div className="space-y-3">
          {users.sort((a,b) => b.poopCount - a.poopCount).map(u => (
            <button 
              key={u.id} 
              onClick={() => setSelectedUser(u)}
              className="w-full flex items-center justify-between p-3 bg-[#FFF8E1] rounded-xl border-2 border-[#BCAAA4]/20 hover:border-[#8D6E63]/40 transition-colors text-left"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[#5D4037]">{u.nickname}</span>
                <span className="text-[8px] font-black text-[#A1887F] uppercase">{u.id.split('-')[0]}</span>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Wk</p>
                  <p className="font-black text-[#8D6E63]">{u.weeklyCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Tot</p>
                  <p className="font-black text-[#BCAAA4]">{u.poopCount}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Detail Modal (Admin View) */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#5D4037]/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white rounded-[3rem] w-full max-w-sm border-8 border-red-50 shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-50 p-8 text-center">
              <div className="text-6xl mb-4 floating">👤</div>
              <h3 className="text-2xl font-black text-red-600 uppercase tracking-tighter">{selectedUser.nickname}</h3>
              <p className="text-xs font-black text-gray-400 mt-1">UUID: {selectedUser.id}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Weekly</p>
                  <p className="text-2xl font-black text-gray-700">{selectedUser.weeklyCount || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime</p>
                  <p className="text-2xl font-black text-gray-700">{selectedUser.poopCount}</p>
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">🏅 Badges</p>
                <div className="flex justify-center gap-3">
                  {(selectedUser.badges || []).map(bId => (
                    <span key={bId} className="text-2xl" title={bId}>{BADGE_MAP[bId]}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-[10px] font-black uppercase text-gray-400">
                <div className="flex justify-between">
                  <span>Joined</span>
                  <span className="text-gray-600">{formatJoinedDate(selectedUser.joinedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Active</span>
                  <span className="text-gray-600">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'Never'}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-3 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-gray-900 transition-colors"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
