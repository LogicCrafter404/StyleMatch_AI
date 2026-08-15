import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sun, MapPin, Droplets, Wand2, RefreshCcw, Save, RotateCw } from 'lucide-react';
import Button from '../components/ui/Button';

export default function GenerateOutfitPage() {
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const steps = [
    "Analyzing your wardrobe...",
    "Checking the weather...",
    "Matching colors...",
    "Understanding your style...",
    "Curating your look..."
  ];

  const handleGenerate = () => {
    setGenerating(true);
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStepIndex(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGenerating(false);
          setResult(true);
        }, 800);
      }
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full">
      <AnimatePresence mode="wait">
        {!generating && !result && (
          <motion.div
            key="controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-4">What should I wear today?</h1>
              <p className="text-white/60 text-lg">Set your preferences and let AI curate your perfect look.</p>
            </div>

            <div className="w-full space-y-8 mb-12">
              {/* Occasion */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Occasion</label>
                <div className="flex flex-wrap gap-2">
                  {['Casual', 'College', 'Office', 'Formal', 'Party', 'Date', 'Gym', 'Travel'].map((occ, i) => (
                    <button key={occ} className={`px-4 py-2 rounded-full text-sm transition-colors border ${i === 0 ? 'bg-violet-primary/20 border-violet-primary text-white box-glow' : 'bg-charcoal border-white/10 text-white/50 hover:text-white'}`}>
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Minimal', 'Streetwear', 'Smart Casual', 'Vintage', 'Elegant'].map((style, i) => (
                    <button key={style} className={`px-4 py-2 rounded-full text-sm transition-colors border ${i === 0 ? 'bg-violet-primary/20 border-violet-primary text-white box-glow' : 'bg-charcoal border-white/10 text-white/50 hover:text-white'}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Weather Context</label>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-lg">28°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm">Low</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Current Location</span>
                    </div>
                  </div>
                  <button className="text-sm text-violet-light hover:text-violet-primary transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full sm:w-auto" onClick={handleGenerate} icon={<Wand2 className="w-5 h-5"/>}>
              ✨ Generate My Outfit
            </Button>
          </motion.div>
        )}

        {generating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative"
          >
            <motion.div 
              className="absolute w-64 h-64 bg-violet-primary/20 rounded-full blur-[100px] transform-gpu will-change-transform"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-16 h-16 text-violet-primary mb-8 drop-shadow-[0_0_15px_rgba(138,43,226,0.5)]" />
              </motion.div>
              <div className="h-8 overflow-hidden relative w-full text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl md:text-2xl font-display text-white absolute inset-x-0"
                  >
                    {steps[stepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="w-48 h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
                <motion.div 
                  className="h-full bg-violet-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-medium text-white/90">Your look is ready.</h2>
            </div>
            
            <motion.div 
              className="flex flex-col lg:flex-row gap-8 items-start"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Outfit Composition (Left) */}
              <div className="w-full lg:w-2/3 grid grid-cols-2 gap-4">
                {/* Item 1: Jacket */}
                <motion.div variants={itemVariants} className="col-span-2 md:col-span-1 aspect-square glass-panel rounded-2xl overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1551028719-01c1eb56211d?auto=format&fit=crop&q=80&w=400" alt="Jacket" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-medium">Blue Denim Jacket</p>
                    <p className="text-xs text-white/50">Outerwear</p>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-violet-light border border-white/10 hover:scale-110">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </motion.div>
                
                {/* Item 2: Top */}
                <motion.div variants={itemVariants} className="col-span-1 aspect-square glass-panel rounded-2xl overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400" alt="Top" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-medium truncate">White Oversized T-Shirt</p>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-violet-light border border-white/10 hover:scale-110">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Item 3: Bottoms */}
                <motion.div variants={itemVariants} className="col-span-1 aspect-square glass-panel rounded-2xl overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400" alt="Bottoms" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-medium truncate">Black Cargo Pants</p>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-violet-light border border-white/10 hover:scale-110">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Item 4: Shoes */}
                <motion.div variants={itemVariants} className="col-span-2 md:col-span-1 aspect-square glass-panel rounded-2xl overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?auto=format&fit=crop&q=80&w=400" alt="Shoes" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-medium truncate">White Sneakers</p>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-violet-light border border-white/10 hover:scale-110">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>

              {/* Info & Actions (Right) */}
              <motion.div variants={itemVariants} className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-primary/20 rounded-full blur-[40px]" />
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-violet-primary" />
                    <span className="font-display font-medium text-lg">92% Style Match</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6 text-xs">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Casual</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">28°C</span>
                    <span className="px-2 py-1 rounded bg-violet-primary/20 border border-violet-primary/30 text-violet-light">✨ AI Suggested</span>
                  </div>

                  <h3 className="font-medium text-white/90 mb-2">Why this works</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    "Your denim jacket adds structure while the neutral base (white tee + black cargo) keeps the outfit balanced and breathable for today's sunny 28°C weather."
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button className="w-full">Wear This</Button>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" icon={<Save className="w-4 h-4" />}>Save</Button>
                      <Button variant="secondary" className="flex-1" icon={<RefreshCcw className="w-4 h-4" />} onClick={() => setResult(false)}>Try Another</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
