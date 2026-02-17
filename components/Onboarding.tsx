
import React, { useState } from 'react';

interface OnboardingProps {
  onJoin: (nickname: string) => void;
  isJoining?: boolean;
  showPinInput?: boolean;
  onAdminPin?: (pin: string) => void;
  onCancelPin?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ 
  onJoin, 
  isJoining, 
  showPinInput, 
  onAdminPin,
  onCancelPin 
}) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isJoining) {
      onJoin(name.trim());
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdminPin && pin.trim()) {
      onAdminPin(pin.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCE4EC] p-6 text-center overflow-hidden">
      <div className="absolute top-10 left-10 text-4xl opacity-20 floating">✨</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-20 floating" style={{ animationDelay: '1s' }}>🌈</div>
      
      <div className="bg-white rounded-[2rem] p-8 kawaii-shadow max-w-sm w-full border-4 border-[#F8BBD0] relative z-10">
        <div className="text-7xl mb-4 animate-bounce">💩</div>
        
        {showPinInput ? (
          <div className="animate-in zoom-in duration-300">
            <h1 className="text-2xl font-bold text-[#D81B60] mb-2 uppercase tracking-tighter">Admin Access</h1>
            <p className="text-[#AD1457] mb-6 font-medium">Please enter your 4-digit PIN</p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#FFF8E1] border-2 border-[#F8BBD0] text-center text-3xl tracking-[1rem] text-[#5D4037] focus:outline-none ring-[#F8BBD0]"
                maxLength={4}
                autoFocus
                required
              />
              <div className="flex gap-2">
                 <button type="button" onClick={onCancelPin} className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold uppercase text-xs">Cancel</button>
                 <button type="submit" className="flex-[2] py-3 bg-[#D81B60] text-white rounded-xl font-bold uppercase tracking-widest kawaii-shadow">Enter ✨</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#D81B60] mb-2">PooPals!</h1>
            <p className="text-[#AD1457] mb-8 font-medium">Log in with your nickname to sync across devices! Earn your sparkles together. ✨</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nickname (eg. SparkleButt)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isJoining}
                className={`w-full p-4 rounded-2xl bg-[#FFF8E1] border-2 border-[#F8BBD0] text-lg text-[#5D4037] placeholder-[#C2185B]/30 focus:outline-none focus:ring-4 ring-[#F8BBD0] ${isJoining ? 'opacity-50' : ''}`}
                maxLength={15}
                required
              />
              <button
                type="submit"
                disabled={isJoining}
                className={`w-full py-4 px-6 bg-[#8D6E63] hover:bg-[#795548] text-white rounded-2xl font-bold text-xl transition-all kawaii-shadow flex items-center justify-center gap-2 ${isJoining ? 'opacity-70 scale-95 cursor-not-allowed' : 'bouncy'}`}
              >
                <span>{isJoining ? 'Checking...' : 'Join or Resume'}</span>
                <span>{isJoining ? '⏳' : '💨'}</span>
              </button>
            </form>
          </>
        )}
      </div>
      
      {!showPinInput && (
        <p className="mt-8 text-[#C2185B] font-bold text-sm opacity-60">
          {isJoining ? 'Finding your plops...' : 'Use the same nickname to log in anywhere! 📱💻'}
        </p>
      )}
    </div>
  );
};

export default Onboarding;
