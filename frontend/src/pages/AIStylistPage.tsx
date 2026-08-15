import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, User, Volume2, Wand2, Shirt, Heart, RefreshCw } from 'lucide-react';

export default function AIStylistPage() {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "Hello darling! I'm Aria, your senior AI fashion consultant. I've analyzed your wardrobe DNA. What event, aesthetic, or weather shall we curate for today?",
      outfitRecommendation: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: query, outfitRecommendation: null }]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyContent = "I've analyzed your pieces for that vibe. I recommend an effortless monochrome layering look that balances comfort and tailored elegance.";
      let recommendation = null;

      if (query.toLowerCase().includes('date') || query.toLowerCase().includes('night')) {
        replyContent = "For an elevated evening look, pair your tailored dark blazer over the crisp white tee, paired with fitted trousers and leather boots. Accessorize with a silver watch.";
        recommendation = {
          title: 'Sleek Evening Gallery Look',
          score: '97% Match',
          items: ['Tailored Dark Blazer', 'White Cotton Crewneck', 'Black Tapered Pants', 'Leather Boots']
        };
      } else if (query.toLowerCase().includes('denim') || query.toLowerCase().includes('jacket')) {
        replyContent = "Your Blue Denim Jacket is extremely versatile! Layer it over a grey hoodie for a street-smart silhouette, or wear it over a clean white tee with black cargo pants for high-contrast minimalism.";
        recommendation = {
          title: 'High-Contrast Denim Streetwear',
          score: '95% Match',
          items: ['Blue Denim Jacket', 'Grey Hoodie', 'Black Cargo Pants', 'White Leather Sneakers']
        };
      } else {
        recommendation = {
          title: 'Minimalist Daily Capsule',
          score: '96% Match',
          items: ['White Oversized Tee', 'Black Cargo Pants', 'White Leather Sneakers']
        };
      }

      setMessages(prev => [...prev, { role: 'ai', content: replyContent, outfitRecommendation: recommendation }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleAudioVoice = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  const prompts = [
    "✨ What should I wear today?",
    "🧥 Style my denim jacket",
    "🌙 Date night outfit idea",
    "✈️ Packing list for 3 days in Paris"
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Stylist Banner Header */}
      <div className="glass-card rounded-2xl p-4 mb-4 border border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-violet-primary shadow-[0_0_20px_rgba(138,43,226,0.8)] bg-gradient-to-tr from-violet-deep via-violet-primary to-violet-light flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-lg text-white">Aria · AI Couture Consultant</h1>
            </div>
            <p className="text-xs text-white/60">Trained on 500,000+ runway looks & color harmony theory</p>
          </div>
        </div>

        <button 
          onClick={handleAudioVoice}
          className={`p-2.5 rounded-xl border border-white/10 text-xs font-medium flex items-center gap-2 transition ${
            isPlayingAudio ? 'bg-violet-primary text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-white/80'
          }`}
        >
          <Volume2 className="w-4 h-4 text-violet-light" />
          <span className="hidden sm:inline">{isPlayingAudio ? 'Speaking...' : 'Listen Voice'}</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-violet-primary/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                msg.role === 'user' ? 'bg-charcoal border border-white/10' : 'bg-gradient-to-tr from-violet-deep to-violet-primary text-white border border-violet-primary/50 shadow-[0_0_10px_rgba(138,43,226,0.5)]'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white/70" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-violet-primary text-white rounded-tr-sm shadow-[0_4px_15px_rgba(138,43,226,0.3)]' 
                    : 'bg-black/60 border border-white/10 backdrop-blur-md text-white/90 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>

                {/* Outfit Recommendation Sub-Card */}
                {msg.outfitRecommendation && (
                  <div className="glass-card p-4 rounded-xl border border-violet-primary/30 mt-1 bg-gradient-to-r from-violet-deep/30 to-black/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-light flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {msg.outfitRecommendation.title}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-primary/30 text-white">
                        {msg.outfitRecommendation.score}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.outfitRecommendation.items.map((item: string, idx: number) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%]"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-deep to-violet-primary text-white border border-violet-primary/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(138,43,226,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                <span className="text-xs text-white/50 font-medium mr-2">Aria is curating look...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-light animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-light animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-light animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar mb-2">
            {prompts.map((p, i) => (
              <motion.button 
                key={p} 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSend(p.replace(/^[^\w\s]+/, '').trim())}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-violet-primary/50 hover:bg-violet-primary/20 transition duration-200"
              >
                {p}
              </motion.button>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Aria to style an item, occasion, or trip..."
              className="w-full bg-charcoal/90 border border-white/15 rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:border-violet-primary text-white text-sm"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-violet-primary flex items-center justify-center text-white hover:bg-violet-light disabled:opacity-40 transition shadow-[0_0_15px_rgba(138,43,226,0.5)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
