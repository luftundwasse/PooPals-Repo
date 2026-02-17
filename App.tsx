
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, LeaderboardEntry, PoopRecord } from './types';
import { STORAGE_KEY_USER_ID, FIREBASE_DB_URL } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, push, remove } from 'firebase/database';

const BADGE_MILESTONES = [
  { count: 1, id: 'baby', name: 'Baby Step', icon: '🐣' },
  { count: 10, id: 'regular', name: 'Regular Regular', icon: '📅' },
  { count: 50, id: 'super', name: 'Super Stinker', icon: '💨' },
  { count: 100, id: 'centurion', name: 'Centurion', icon: '👑' },
];

const getSgtWeeklyResetTimestamp = () => {
  const now = new Date();
  const sgtOffset = 8 * 60 * 60 * 1000;
  const sgtNow = new Date(now.getTime() + sgtOffset);
  const day = sgtNow.getUTCDay();
  const diff = sgtNow.getUTCDate() - day;
  const resetSgt = new Date(sgtNow);
  resetSgt.setUTCDate(diff);
  resetSgt.setUTCHours(0, 0, 0, 0);
  return new Date(resetSgt.getTime() - sgtOffset).toISOString();
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'dashboard' | 'leaderboard' | 'admin'>('dashboard');
  const [communityMap, setCommunityMap] = useState<Record<string, UserProfile>>({});
  const [lastGlobalReset, setLastGlobalReset] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [communityVibe, setCommunityVibe] = useState<string>('Connecting to the PooPal Hive... 🐝');
  const [isJoining, setIsJoining] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<typeof BADGE_MILESTONES[0] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pendingNickname, setPendingNickname] = useState('');

  const db = useMemo(() => {
    try {
      const app = initializeApp({
        apiKey: process.env.API_KEY,
        databaseURL: FIREBASE_DB_URL,
      });
      return getDatabase(app);
    } catch (e) {
      console.error("Firebase Initialization Failed", e);
      return null;
    }
  }, []);

  const communityList = useMemo(() => Object.values(communityMap), [communityMap]);

  const applyWeeklyResetIfNeeded = useCallback((currentUser: UserProfile) => {
    const currentResetThreshold = getSgtWeeklyResetTimestamp();
    if (!currentUser.lastResetDate || currentUser.lastResetDate < currentResetThreshold) {
      const updated = {
        ...currentUser,
        weeklyCount: 0,
        lastResetDate: currentResetThreshold
      };
      setUser(updated);
      if (db && isConnected) {
        update(ref(db, `users/${currentUser.id}`), {
          weeklyCount: 0,
          lastResetDate: currentResetThreshold
        });
      }
      return updated;
    }
    return currentUser;
  }, [db, isConnected]);

  useEffect(() => {
    if (!db) return;
    
    // Listen for users
    const communityRef = ref(db, 'users');
    onValue(communityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCommunityMap(data);
        setIsConnected(true);
        const currentUserId = localStorage.getItem(STORAGE_KEY_USER_ID);
        if (currentUserId && data[currentUserId]) {
          const syncedUser = data[currentUserId];
          if (currentUserId === 'ADMIN_SESSION') {
             setIsAdmin(true);
          } else {
             applyWeeklyResetIfNeeded(syncedUser);
             setUser(syncedUser);
          }
        } else if (currentUserId === 'ADMIN_SESSION') {
          setIsAdmin(true);
        }
      } else {
        setCommunityMap({});
        setIsConnected(true);
      }
    }, (error) => {
      console.warn("Firebase Connectivity Issue:", error);
      setIsConnected(false);
    });

    // Listen for global reset timestamp
    const resetRef = ref(db, 'system/lastResetDate');
    onValue(resetRef, (snapshot) => {
      setLastGlobalReset(snapshot.val());
    });
  }, [db, applyWeeklyResetIfNeeded]);

  const analyzeVibe = useCallback(async (users: UserProfile[]) => {
    if (users.length === 0 || !process.env.API_KEY) return;
    try {
      const totalPlops = users.reduce((acc, u) => acc + u.poopCount, 0);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Write a 1-sentence "Kawaii" community vibe check message for ${users.length} PooPals who have logged ${totalPlops} total plops. Use emojis.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      if (response.text) setCommunityVibe(response.text.trim());
    } catch (e) {
      console.warn("AI vibe check failed", e);
    }
  }, []);

  useEffect(() => {
    if (communityList.length > 0) analyzeVibe(communityList);
  }, [communityList.length, analyzeVibe]);

  const handleJoin = async (nickname: string) => {
    if (nickname.toLowerCase() === 'admin') {
      setPendingNickname(nickname);
      setShowPinInput(true);
      return;
    }

    setIsJoining(true);
    try {
      const existingUser = communityList.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
      if (existingUser) {
        localStorage.setItem(STORAGE_KEY_USER_ID, existingUser.id);
        setUser(existingUser);
        applyWeeklyResetIfNeeded(existingUser);
      } else {
        const id = crypto.randomUUID();
        const newUser: UserProfile = {
          id,
          nickname,
          joinedDate: new Date().toISOString().split('T')[0],
          poopCount: 0,
          weeklyCount: 0,
          lastActive: new Date().toISOString(),
          motto: 'Ready to sparkle! ✨',
          currentStreak: 0,
          badges: [],
          lastResetDate: getSgtWeeklyResetTimestamp()
        };
        if (db) {
          await set(ref(db, `users/${id}`), newUser);
        }
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY_USER_ID, id);
      }
    } catch (e) { 
      console.error("Login Error", e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleAdminPin = (pin: string) => {
    if (pin === '8888') {
      setIsAdmin(true);
      setView('admin');
      localStorage.setItem(STORAGE_KEY_USER_ID, 'ADMIN_SESSION');
      setShowPinInput(false);
    } else {
      alert('Invalid PIN!');
    }
  };

  const handleLogPoop = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const currentUser = applyWeeklyResetIfNeeded(user);
    const newCount = currentUser.poopCount + 1;
    const newWeeklyCount = (currentUser.weeklyCount || 0) + 1;
    let newStreak = currentUser.currentStreak || 0;
    const newBadges = [...(currentUser.badges || [])];

    if (currentUser.lastLogDate) {
      const lastLog = new Date(currentUser.lastLogDate);
      const diffHours = (now.getTime() - lastLog.getTime()) / (1000 * 60 * 60);
      if (diffHours > 48) {
        newStreak = 1;
      } else if (diffHours > 18) {
        newStreak += 1;
      } else if (newStreak === 0) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const milestone = BADGE_MILESTONES.find(m => m.count === newCount);
    if (milestone && !newBadges.includes(milestone.id)) {
      newBadges.push(milestone.id);
      setUnlockedBadge(milestone);
    }

    const logRef = push(ref(db!, `users/${currentUser.id}/logs`));
    const newLog: PoopRecord = {
      id: logRef.key!,
      timestamp: now.toISOString()
    };

    const updates = {
      poopCount: newCount,
      weeklyCount: newWeeklyCount,
      lastActive: now.toISOString(),
      lastLogDate: now.toISOString(),
      currentStreak: newStreak,
      badges: newBadges
    };

    setUser({ ...currentUser, ...updates });
    if (db && isConnected) {
      update(ref(db, `users/${currentUser.id}`), updates);
      set(logRef, newLog);
    }

    confetti({
      particleCount: 150, spread: 80, origin: { y: 0.6 },
      colors: ['#8D6E63', '#FCE4EC', '#FFF8E1']
    });
  }, [user, db, isConnected, applyWeeklyResetIfNeeded]);

  const handleDeleteLog = useCallback(async (logId: string) => {
    if (!user || !db || !isConnected) return;
    if (!confirm("Remove this log? Counts will be adjusted! 🗑️")) return;

    const newCount = Math.max(0, user.poopCount - 1);
    const newWeeklyCount = Math.max(0, (user.weeklyCount || 0) - 1);
    
    const updates = {
      poopCount: newCount,
      weeklyCount: newWeeklyCount,
    };

    if (db && isConnected) {
      await update(ref(db, `users/${user.id}`), updates);
      await remove(ref(db, `users/${user.id}/logs/${logId}`));
    }
  }, [user, db, isConnected]);

  const handleUpdateUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
    if (db && isConnected) update(ref(db, `users/${user.id}`), updates);
  }, [user, db, isConnected]);

  const handleGlobalReset = async () => {
    if (!isAdmin || !db) return;
    if (!confirm("Are you sure you want to nuke all weekly plops for EVERYONE? 🧨")) return;
    const newThreshold = getSgtWeeklyResetTimestamp();
    const updates: Record<string, any> = {
      'system/lastResetDate': new Date().toISOString()
    };
    communityList.forEach(u => {
      updates[`users/${u.id}/weeklyCount`] = 0;
      updates[`users/${u.id}/lastResetDate`] = newThreshold;
    });
    await update(ref(db), updates);
    alert("Weekly board has been sparklingly reset! ✨");
  };

  const tickerItems = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const msgs = communityList.map(u => {
      if ((u.currentStreak || 0) > 1) return `🔥 ${u.nickname} is on a ${u.currentStreak}-day streak!`;
      if (u.weeklyCount > 5) return `🏆 ${u.nickname} is crushing the weekly board with ${u.weeklyCount} plops!`;
      if (u.joinedDate === todayStr) return `🌈 Welcome new pal ${u.nickname}! Joined today! ✨`;
      return null;
    }).filter(Boolean) as string[];
    const recentMsgs = msgs.slice(-8);
    recentMsgs.unshift(`⏰ Next automatic reset: Sunday 12AM SGT! 🇸🇬`);
    if (recentMsgs.length === 1) {
      recentMsgs.push("✨ Log your business to see your name up here! 💩");
    }
    return recentMsgs;
  }, [communityList]);

  if (!user && !isAdmin) return (
    <Onboarding 
      onJoin={handleJoin} 
      isJoining={isJoining} 
      showPinInput={showPinInput} 
      onAdminPin={handleAdminPin}
      onCancelPin={() => setShowPinInput(false)}
    />
  );

  const allEntries: LeaderboardEntry[] = communityList.map(member => ({ 
    ...member, 
    isCurrentUser: user ? member.id === user.id : false
  }));

  return (
    <div className="min-h-screen bg-[#FFF8E1] text-[#5D4037] pb-24 relative overflow-x-hidden">
      <div className="bg-[#8D6E63] text-white py-1 overflow-hidden whitespace-nowrap border-b-2 border-[#5D4037] relative z-50">
        <div className="inline-block animate-[marquee_25s_linear_infinite]">
          {tickerItems.map((item, i) => (
            <span key={i} className="mx-12 font-black text-[10px] uppercase tracking-widest">{item}</span>
          ))}
          {tickerItems.map((item, i) => (
            <span key={`dup-${i}`} className="mx-12 font-black text-[10px] uppercase tracking-widest">{item}</span>
          ))}
        </div>
      </div>

      <div className={`fixed top-12 right-2 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border-2 shadow-sm ${isConnected ? 'border-[#E0F2F1]' : 'border-red-200'}`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#4ade80]' : 'bg-red-400 animate-pulse'}`}></div>
        <span className="text-[10px] font-black text-[#A1887F] uppercase tracking-tighter">
          {isConnected ? (isAdmin ? 'Admin' : 'Syncing') : 'Local'}
        </span>
      </div>

      {unlockedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 border-8 border-[#FCE4EC] text-center max-w-xs kawaii-shadow animate-in zoom-in duration-500">
            <div className="text-7xl mb-4 animate-bounce">{unlockedBadge.icon}</div>
            <h2 className="text-2xl font-black text-[#D81B60] mb-2 uppercase">New Badge!</h2>
            <p className="text-[#AD1457] font-bold mb-6 italic leading-tight">"You unlocked the {unlockedBadge.name} status!"</p>
            <button onClick={() => setUnlockedBadge(null)} className="w-full py-3 bg-[#8D6E63] text-white rounded-2xl font-black uppercase hover:bg-[#795548] transition-colors">Sweet! ✨</button>
          </div>
        </div>
      )}

      <header className="p-6 flex flex-col items-center justify-center space-y-1">
        <div className="flex items-center gap-2">
           <h1 className="text-4xl font-bold text-[#8D6E63]">💩 PooPals</h1>
           <button onClick={() => { localStorage.removeItem(STORAGE_KEY_USER_ID); window.location.reload(); }} className="text-[10px] font-black text-[#C2185B] bg-[#FCE4EC] px-2 py-1 rounded-full uppercase">Log Out</button>
        </div>
        {!isAdmin && (
          <div className="bg-white/50 px-4 py-2 rounded-2xl border-2 border-[#FCE4EC] mt-2 max-w-xs text-center kawaii-shadow">
            <p className="text-xs font-medium text-[#AD1457] italic">"{communityVibe}"</p>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto px-4">
        {isAdmin ? (
          <AdminPanel users={communityList} lastResetDate={lastGlobalReset} onGlobalReset={handleGlobalReset} />
        ) : (
          view === 'dashboard' ? (
            <Dashboard user={user!} lastResetDate={lastGlobalReset} onLog={handleLogPoop} onDeleteLog={handleDeleteLog} onUpdateUser={handleUpdateUser} />
          ) : (
            <Leaderboard entries={allEntries} lastResetDate={lastGlobalReset} />
          )
        )}

        {/* Bubbly Global Feedback Footer */}
        <footer className="mt-12 mb-8 text-center">
          <a 
            href="https://forms.gle/nbprMrEzsMb66Rv66" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#FCE4EC] border-4 border-[#F8BBD0] px-6 py-2.5 rounded-full text-[11px] font-black text-[#D81B60] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-sm group"
          >
            <span className="group-hover:animate-bounce">💝</span>
            <span>Help us grow! Give feedback</span>
            <span className="text-xs">✨</span>
          </a>
          <p className="mt-4 text-[9px] font-bold text-[#A1887F] opacity-40 uppercase tracking-[0.2em]">PooPals Community v2.0</p>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-[#E0F2F1] p-4 flex justify-around items-center z-50 shadow-lg">
        {!isAdmin ? (
          <>
            <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-[#8D6E63] scale-110' : 'text-gray-300'}`}>
              <span className="text-2xl">🏠</span>
              <span className="text-[10px] font-black uppercase">Home</span>
            </button>
            <button onClick={() => setView('leaderboard')} className={`flex flex-col items-center gap-1 transition-all ${view === 'leaderboard' ? 'text-[#8D6E63] scale-110' : 'text-gray-300'}`}>
              <span className="text-2xl">🏆</span>
              <span className="text-[10px] font-black uppercase">Board</span>
            </button>
          </>
        ) : (
           <button onClick={() => setView('admin')} className={`flex flex-col items-center gap-1 transition-all text-red-500 scale-110`}>
              <span className="text-2xl">⚡</span>
              <span className="text-[10px] font-black uppercase">Admin Panel</span>
            </button>
        )}
      </nav>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

export default App;
