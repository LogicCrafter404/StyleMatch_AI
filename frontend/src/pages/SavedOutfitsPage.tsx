import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Sparkles, Navigation } from 'lucide-react';
import Button from '../components/ui/Button';

const SAVED_LOOKS = [
  { id: 1, name: 'Casual Friday', score: 92, occasion: 'Casual', weather: '28°C', date: 'Oct 12', image: 'https://images.unsplash.com/photo-1551028719-01c1eb56211d?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Office Ready', score: 88, occasion: 'Office', weather: '22°C', date: 'Oct 10', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Night Out', score: 95, occasion: 'Party', weather: '20°C', date: 'Oct 05', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400' },
];

export default function SavedOutfitsPage() {
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const handleAction = (action: 'like' | 'dislike') => {
    setDirection(action === 'like' ? 1 : -1);
    setFeedback(action === 'like' ? "Added to your looks. ❤️" : "Got it. I'll remember that.");
    
    setTimeout(() => {
      if (currentIndex < SAVED_LOOKS.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFeedback(null);
        setDirection(0);
      } else {
        setDiscoveryMode(false);
        setCurrentIndex(0);
        setFeedback(null);
      }
    }, 1000);
  };

  if (discoveryMode) {
    const item = SAVED_LOOKS[currentIndex];
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
        <button 
          onClick={() => setDiscoveryMode(false)}
          className="absolute top-8 right-8 text-white/50 hover:text-white"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="w-full max-w-sm relative h-[600px]">
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, x: direction * -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: direction * 100, rotate: direction * 10 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 glass-panel rounded-3xl overflow-hidden border-2 border-white/10"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    handleAction('dislike');
                  } else if (swipe > 10000) {
                    handleAction('like');
                  }
                }}
              >
                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-primary" />
                    <span className="text-violet-light font-medium">{item.score}% Match</span>
                  </div>
                  <h2 className="text-3xl font-display font-medium text-white mb-2">{item.name}</h2>
                  <div className="flex gap-2 text-sm text-white/70 mb-8">
                    <span>{item.occasion}</span>
                    <span>·</span>
                    <span>{item.weather}</span>
                  </div>

                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => handleAction('dislike')}
                      className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md border border-white/10"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={() => handleAction('like')}
                      className="w-16 h-16 rounded-full bg-violet-primary flex items-center justify-center text-white shadow-[0_0_30px_rgba(138,43,226,0.5)] hover:scale-110 transition-transform"
                    >
                      <Heart className="w-8 h-8 fill-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="glass-panel p-8 rounded-3xl text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${direction === 1 ? 'bg-violet-primary/20 text-violet-light' : 'bg-white/10 text-white/50'}`}>
                    {direction === 1 ? <Heart className="w-8 h-8 fill-current" /> : <Sparkles className="w-8 h-8" />}
                  </div>
                  <p className="text-xl font-medium">{feedback}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-2">Saved Looks</h1>
          <p className="text-white/60">Your curated collection of perfect outfits.</p>
        </div>
        <Button onClick={() => setDiscoveryMode(true)} icon={<Navigation className="w-4 h-4"/>}>
          Discovery Mode
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {SAVED_LOOKS.map(look => (
          <motion.div
            key={look.id}
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="group relative rounded-3xl overflow-hidden glass-panel border-white/5 hover:border-violet-primary/40 hover:shadow-[0_10px_40px_-10px_rgba(138,43,226,0.3)] transition transform-gpu duration-300"
          >
            <div className="aspect-[3/4] relative">
              <img src={look.image} alt={look.name} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <div className="absolute top-4 right-4">
                <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-red-400 border border-white/10">
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-display font-medium text-white mb-2">{look.name}</h3>
                    <div className="flex gap-2 text-xs text-white/60 mb-2">
                      <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-md">{look.occasion}</span>
                      <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-md">{look.weather}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-violet-light font-medium text-lg">{look.score}%</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">{look.date}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
