
import React, { useState, useEffect } from 'react';
import { analyzeMarketData } from './services/geminiService';

// Icons
const RadarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 12 19 12"/><path d="M12 12 12 5"/></svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const App: React.FC = () => {
  const [coinName, setCoinName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const BSC_ADDRESS = "0xd05c436e783caedcb0145d6f7c2fdb6f5e1ec2d9";

  useEffect(() => {
    const count = localStorage.getItem('alphaGuard_usage');
    const paidStatus = localStorage.getItem('alphaGuard_isPaid');
    if (count) setUsageCount(parseInt(count));
    if (paidStatus === 'true') setIsPaid(true);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShareTool = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) return;
    if (usageCount >= 1 && !isPaid) return;

    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const response = await analyzeMarketData({ coinName });
      setResult(response);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('alphaGuard_usage', newCount.toString());
    } catch (error) {
      setResult({ text: "审计失败，请重试。", sources: [] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showPayment = usageCount >= 1 && !isPaid;

  const formatOutput = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} className="text-2xl sm:text-3xl font-black text-white mt-8 mb-4 border-l-4 border-emerald-500 pl-4 italic">{line.replace('# ', '')}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-black text-emerald-400 mt-8 mb-3 uppercase tracking-widest">{line.replace('## ', '')}</h3>;
      if (line.startsWith('> ')) {
        const content = line.replace('> ', '');
        const isBullish = content.includes('做多') || content.includes('LONG');
        const isBearish = content.includes('做空') || content.includes('SHORT');
        return (
          <div key={i} className={`p-6 rounded-2xl my-6 flex items-center justify-between border-2 ${isBullish ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isBearish ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-zinc-900 border-zinc-800'}`}>
            <span className="font-black text-2xl italic tracking-tighter">{content}</span>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
          </div>
        );
      }
      if (line.startsWith('---')) return <hr key={i} className="border-zinc-800 my-8" />;
      if (line.startsWith('- ')) return <div key={i} className="flex gap-2 text-sm text-zinc-400 mb-2 ml-2"><span className="text-emerald-500">•</span><span>{line.replace('- ', '')}</span></div>;
      return <p key={i} className="text-sm text-zinc-500 leading-relaxed mb-4 pl-4 border-l border-zinc-900">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top Ticker - 专业感 */}
      <div className="h-8 bg-emerald-500/10 border-b border-emerald-500/5 flex items-center overflow-hidden whitespace-nowrap sticky top-0 z-[60] backdrop-blur-md">
         <div className="animate-ticker text-[9px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] mono">
            {Array(10).fill(" ALPHA GUARD PRO ENGINE ACTIVE • BINANCE REAL-TIME AUDIT • MM DETECTION ON • ").join("")}
         </div>
      </div>

      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-900 bg-black/50 backdrop-blur-xl sticky top-8 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500 rounded-lg text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"><RadarIcon /></div>
          <span className="font-black tracking-tighter text-lg italic">ALPHAGUARD</span>
        </div>
        <button 
          onClick={handleShareTool}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold uppercase hover:bg-zinc-800 transition-colors"
        >
          {shareSuccess ? '已复制链接' : <><ShareIcon /> 推广</>}
        </button>
      </header>

      <main className="flex-1 px-6 py-12 max-w-2xl mx-auto w-full space-y-16">
        
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic leading-none">
            庄家行为<br/><span className="text-emerald-500 underline decoration-zinc-800 underline-offset-8">深度审计</span>
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base font-medium">
            专为 Alpha 币设计的决策引擎。捕捉主力洗盘完成后的爆发机会。
          </p>

          {!showPayment ? (
            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              <div className="relative group">
                <input 
                  required
                  placeholder="代币名称 (如: MOODENG)"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-5 text-xl font-bold focus:border-emerald-500/50 outline-none transition-all placeholder:text-zinc-800"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  disabled={isAnalyzing}
                />
                <button 
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full mt-4 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]"
                >
                  {isAnalyzing ? '正在检索审计...' : '立即审计此币'}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">目前系统状态: 稳定运行中</p>
            </form>
          ) : (
            <div className="bg-zinc-950 border border-amber-500/20 rounded-[2rem] p-8 space-y-8 shadow-2xl animate-in zoom-in duration-500">
               <div className="flex justify-center"><div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl"><LockIcon /></div></div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-black italic">首单体验已结束</h2>
                 <p className="text-xs text-zinc-500 leading-relaxed">
                   维护全网实时大单检索服务器需要高昂成本。支付一次性费用即可永久获得 AlphaGuard 所有未来更新。
                 </p>
               </div>
               <div className="bg-black border border-zinc-900 rounded-2xl p-6 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <span className="text-xs font-bold text-zinc-500">永久授权费用</span>
                    <span className="text-emerald-500 font-black text-xl mono">10.00 USDT</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">BSC 接收地址 (BEP20)</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-zinc-900 p-3 rounded-xl text-[9px] break-all border border-zinc-800 text-zinc-400 mono">
                        {BSC_ADDRESS}
                      </code>
                      <button 
                        onClick={() => handleCopy(BSC_ADDRESS)}
                        className="p-3 bg-zinc-800 rounded-xl hover:text-emerald-500 transition-colors"
                      >
                        {copySuccess ? '√' : <CopyIcon />}
                      </button>
                    </div>
                  </div>
               </div>
               <div className="text-[9px] text-zinc-700 font-bold tracking-widest uppercase">仅支持 BSC (Binance Smart Chain) 转账</div>
            </div>
          )}
        </section>

        {/* Results */}
        {isAnalyzing && (
          <div className="py-12 flex flex-col items-center gap-6">
             <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">正在执行深度量价审计...</p>
          </div>
        )}

        {result && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="px-8 py-6 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
               <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">审计报告已生成</span>
               <span className="text-[9px] mono text-zinc-600 uppercase">ID: {Math.random().toString(36).substr(2,6)}</span>
            </div>
            <div className="p-8 sm:p-12">
               <article className="max-w-none">
                 {formatOutput(result.text)}
               </article>

               {result.sources.length > 0 && (
                 <div className="mt-12 pt-8 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.sources.map((s, i) => (
                      <a key={i} href={s.web?.uri} target="_blank" className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] text-zinc-500 truncate hover:text-emerald-500 transition-colors">
                        {s.web?.title || s.web?.uri}
                      </a>
                    ))}
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-zinc-950 text-center space-y-6">
        <button 
          onClick={handleShareTool}
          className="mx-auto flex items-center gap-3 px-8 py-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-sm font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-xl"
        >
          <ShareIcon /> 分享此工具给好友
        </button>
        <div className="space-y-2">
          <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em]">AlphaGuard Proprietary Engine</p>
          <p className="text-[8px] text-zinc-800 max-w-xs mx-auto px-4 italic leading-relaxed">
            注意：高波动币审计结果仅供参考。系统建议杠杆不超 3 倍。请严格遵守风险管理策略。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
