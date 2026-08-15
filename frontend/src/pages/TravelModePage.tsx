import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, MapPin, Calendar, Sun, Wand2, PackageOpen, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

export default function TravelModePage() {
  const [packing, setPacking] = useState(false);
  const [result, setResult] = useState(false);

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

  const handlePack = () => {
    setPacking(true);
    setTimeout(() => {
      setPacking(false);
      setResult(true);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-2">Pack My Wardrobe</h1>
        <p className="text-white/60">Tell us about your trip, we'll pack the perfect looks.</p>
      </div>

      <AnimatePresence mode="wait">
        {!packing && !result && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl mx-auto"
          >
            <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input type="text" placeholder="e.g. Paris, France" className="w-full bg-charcoal border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-violet-primary/50 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Duration</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input type="text" placeholder="5 Days" className="w-full bg-charcoal border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-violet-primary/50 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Trip Type</label>
                  <div className="relative">
                    <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <select className="w-full bg-charcoal border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-violet-primary/50 text-white appearance-none">
                      <option>Leisure</option>
                      <option>Business</option>
                      <option>Adventure</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full mt-4" onClick={handlePack} icon={<PackageOpen className="w-5 h-5"/>}>
                Build My Packing List
              </Button>
            </div>
          </motion.div>
        )}

        {packing && (
          <motion.div
            key="packing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative"
          >
            <div className="relative">
              <PackageOpen className="w-16 h-16 text-violet-primary mb-8 animate-bounce" />
              <div className="absolute inset-0 bg-violet-primary/50 blur-[50px] rounded-full z-[-1] animate-pulse" />
            </div>
            <h2 className="text-2xl font-display text-white">Packing your perfect wardrobe...</h2>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {[
                { label: 'Tops', count: 5 },
                { label: 'Bottoms', count: 3 },
                { label: 'Shoes', count: 2 },
                { label: 'Jackets', count: 1 },
              ].map(cat => (
                <motion.div variants={itemVariants} key={cat.label} className="glass-panel p-6 rounded-2xl text-center border border-white/5 hover:border-violet-primary/30 hover:bg-violet-primary/5 transition-colors">
                  <div className="text-3xl font-display font-medium text-violet-light mb-1">{cat.count}</div>
                  <div className="text-sm text-white/60">{cat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="glass-panel rounded-3xl p-8 border border-white/5 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 text-violet-light bg-violet-primary/10 px-3 py-1 rounded-full border border-violet-primary/20">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">4 Complete Looks</span>
                </div>
              </div>
              
              <h3 className="text-xl font-medium mb-8">Your Paris Itinerary Wardrobe</h3>
              
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {[1, 2, 3, 4].map(day => (
                  <motion.div variants={itemVariants} key={day} className="flex items-center gap-6 p-4 rounded-xl bg-charcoal border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 shrink-0 font-display group-hover:scale-110 group-hover:bg-violet-primary/20 group-hover:text-violet-light transition transform-gpu">
                      D{day}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium group-hover:text-white transition-colors">Day {day} Exploration</h4>
                      <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">White Tee + Beige Chinos + Sneakers + Denim Jacket</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
