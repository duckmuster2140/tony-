
import React, { useState, useEffect } from 'react';
import { analyzeMarketData } from './services/geminiService';

// Icons components
const RadarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 12 19 12"/><path d="M12 12 12 5"/></svg>
);
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const App: React.FC = () => {
  const [coinName, setCoinName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(30);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const BSC_ADDRESS = "0xd05c436e783caedcb0145d6f7c2fdb6f5e1ec2d9";
  const TRIAL_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    let trialStart = localStorage.getItem('alphaGuard_v2_trialStart');
    const currentTime = Date.now();
    if (!trialStart) {
      localStorage.setItem('alphaGuard_v2_trialStart', currentTime.toString());
      trialStart = currentTime.toString();
    }
    const elapsed = currentTime - parseInt(trialStart);
    const remainingMs = TRIAL_PERIOD_MS - elapsed;
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
    setTrialDaysLeft(remainingDays);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'AlphaGuard PRO - 庄家审计引擎',
      text: '发现一个专门审计 Alpha 币洗盘结束入场点的工具，正在开放 30 天免费试用！',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || isAnalyzing) return;
    if (trialDaysLeft <= 0) return;

    setIsAnalyzing(true);
    setResult(null);
    try {
      const response = await analyzeMarketData({ coinName });
      setResult(response);
    } catch (error) {
      setResult({ text: "审计失败。请确保输入正确的代币代码（如 PEPE）并稍后重试。", sources: [] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatOutput = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} className="text-3xl sm:text-4xl font-black text-white mt-10 mb-6 italic tracking-tighter border-l-4 border-emerald-500 pl-4">{line.replace('# ', '')}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-black text-emerald-500 mt-10 mb-4 uppercase tracking-[0.3em]">{line.replace('## ', '')}</h3>;
      if (line.startsWith('> ')) {
        const content = line.replace('> ', '');
        const isBullish = content.includes('做多') || content.includes('LONG');
        const isBearish = content.includes('做空') || content.includes('SHORT');
        return (
          <div key={i} className={`p-8 rounded-[2rem] my-8 flex items-center justify-between border-2 shadow-2xl transition-all ${isBullish ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isBearish ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
            <span className="font-black text-3xl italic tracking-tighter">{content}</span>
            <div className={`w-3 h-3 rounded-full animate-pulse ${isBullish ? 'bg-emerald-500' : isBearish ? 'bg-rose-500' : 'bg-zinc-500'}`}></div>
          </div>
        );
      }
      if (line.startsWith('---')) return <hr key={i} className="border-zinc-900 my-10" />;
      if (line.startsWith('- ')) return <div key={i} className="flex gap-3 text-sm text-zinc-400 mb-3 ml-1"><span className="text-emerald-500 font-bold">»</span><span className="leading-relaxed">{line.replace('- ', '')}</span></div>;
      return <p key={i} className="text-sm text-zinc-500 leading-relaxed mb-4 pl-5 border-l border-zinc-900/50">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-emerald-500/30">
      {/* Dynamic Status Bar */}
      <div className="h-10 bg-emerald-500/10 border-b border-emerald-500/5 flex items-center overflow-hidden sticky top-0 z-[100] glass">
         <div className="animate-ticker text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.25em] flex items-center">
            {Array(8).fill(` SYSTEM ACTIVE • 30-DAY PRO TRIAL: ${trialDaysLeft} DAYS LEFT • BINANCE API CONNECTED • REAL-TIME WHALE TRACKING ON • `).map((t, idx) => (
              <span key={idx} className="mx-4">{t}</span>
            ))}
         </div>
      </div>

      <header className="px-6 h-20 flex items-center justify-between sticky top-10 z-[90] glass">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-black shadow-lg shadow-emerald-500/30"><RadarIcon /></div>
          <span className="font-black tracking-tighter text-2xl italic text-white">ALPHAGUARD</span>
        </div>
        <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-wider text-white transition-all active:scale-95">
          {shareSuccess ? '链接已复制' : <><ShareIcon /> 推广传播</>}
        </button>
      </header>

      <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full space-y-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 py-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-4">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">30天尊享试用已激活</span>
          </div>
          <h1 className="text-7xl sm:text-9xl font-black tracking-tighter italic leading-[0.8] text-white">
            审计<br/><span className="text-emerald-500">主力</span>行为
          </h1>
          <p className="text-zinc-500 text-base font-medium max-w-sm mx-auto leading-relaxed">
            实时分析全网成交，研判庄家洗盘与吸筹点。针对高波动币种，每日提供一单核心决策。
          </p>

          {trialDaysLeft > 0 ? (
            <form onSubmit={handleSubmit} className="mt-16 space-y-6">
              <div className="relative group">
                <input 
                  required
                  placeholder="输入币种代码 (如: BTC, PEPE)"
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem] px-8 py-7 text-2xl font-black focus:border-emerald-500 focus:ring-[12px] focus:ring-emerald-500/5 outline-none transition-all placeholder:text-zinc-800 text-white shadow-2xl"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value.toUpperCase())}
                />
                <button 
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full mt-6 py-7 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                >
                  {isAnalyzing ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>执行 AI 深度审计 <ZapIcon /></>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-zinc-950 border border-amber-500/20 rounded-[3rem] p-12 text-left space-y-8 animate-in zoom-in duration-700">
               <div className="flex justify-center"><div className="p-6 bg-amber-500/10 text-amber-500 rounded-3xl border border-amber-500/10"><RadarIcon /></div></div>
               <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-white italic">试用已到期</h2>
                 <p className="text-zinc-500 text-sm">您的 30 天试用已经结束。请支付以获得永久所有权。</p>
               </div>
               <div className="bg-black/50 border border-zinc-900 rounded-[2rem] p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-6">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">永久买断 (Lifetime)</span>
                    <span className="text-emerald-500 font-black text-3xl mono">10.00 USDT</span>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">接收地址 (BSC-BEP20)</label>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-zinc-900 p-5 rounded-2xl text-[10px] break-all border border-zinc-800 text-zinc-400 mono">
                        {BSC_ADDRESS}
                      </code>
                      <button onClick={() => handleCopy(BSC_ADDRESS)} className="p-5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl border border-zinc-700 transition-all">
                        {copySuccess ? '已复制' : <CopyIcon />}
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </section>

        {/* Results Container */}
        {isAnalyzing && (
          <div className="py-24 flex flex-col items-center gap-8">
             <div className="w-20 h-20 border-2 border-emerald-500/5 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_40px_rgba(16,185,129,0.1)]"></div>
             <p className="text-xs font-black uppercase tracking-[0.6em] text-emerald-500/80 animate-pulse">正在穿透庄家指令层...</p>
          </div>
        )}

        {result && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-20 duration-1000">
            <div className="px-10 py-8 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
               <span className="text-[11px] font-black tracking-widest text-emerald-500 uppercase flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 实时审计报告已生成
               </span>
            </div>
            
            <div className="p-10 sm:p-20">
               <article className="max-w-none">
                 {formatOutput(result.text)}
               </article>

               {result.sources.length > 0 && (
                 <div className="mt-24 pt-12 border-t border-zinc-900">
                    <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] mb-10 block text-center">审计数据源参考</span>
                    <div className="grid grid-cols-1 gap-4">
                      {result.sources.slice(0, 4).map((s, i) => (
                        <a key={i} href={s.web?.uri} target="_blank" rel="noreferrer" className="p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl text-[10px] text-zinc-600 truncate hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-4">
                          <span className="font-black opacity-30">{i+1}</span>
                          <span className="truncate font-medium">{s.web?.title || s.web?.uri}</span>
                        </a>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-32 border-t border-zinc-950 text-center">
        <div className="max-w-xs mx-auto space-y-12">
           <button 
             onClick={handleShare}
             className="w-full flex items-center justify-center gap-3 px-10 py-6 bg-zinc-900 rounded-3xl border border-white/5 text-sm font-black hover:bg-zinc-800 active:scale-95 transition-all shadow-2xl text-white italic"
           >
             <ShareIcon /> {shareSuccess ? '链接已成功复制' : '分享此工具给战友'}
           </button>
           <div className="space-y-4">
             <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.8em]">AlphaGuard Intelligence</p>
             <p className="text-[9px] text-zinc-800 max-w-xs mx-auto px-10 italic leading-loose">
               注：本系统基于概率模型，不构成投资建议。加密资产有风险，入市需谨慎。
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
