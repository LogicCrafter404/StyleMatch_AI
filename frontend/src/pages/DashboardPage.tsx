import { motion } from 'motion/react';
import { Sun, Cloud, Layers, Wand2, MessageSquare, Plus, Plane, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickActions = [
  { icon: <Plus />, label: 'Add Clothing', desc: 'Build your digital wardrobe', path: '/app/wardrobe/add' },
  { icon: <Wand2 />, label: 'Generate Outfit', desc: 'Let AI curate your look', path: '/app/outfits/generate' },
  { icon: <MessageSquare />, label: 'AI Stylist', desc: 'Ask your personal stylist', path: '/app/stylist' },
  { icon: <Layers />, label: 'My Wardrobe', desc: 'Explore your clothes', path: '/app/wardrobe' },
  { icon: <Plane />, label: 'Pack for Travel', desc: 'Build a trip-ready wardrobe', path: '/app/travel' },
];

export default function DashboardPage() {
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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header section */}
      <motion.div 
        variants={itemVariants}
        className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-medium text-white/90 mb-1 sm:mb-2">
            Good morning.
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl text-white/60">
            What are we wearing today?
          </h2>
        </div>
        
        {/* Weather Card */}
        <div className="flex items-center gap-3.5 bg-charcoal/50 border border-white/10 p-3.5 sm:p-4 rounded-2xl glass-panel self-start sm:self-auto w-full sm:w-auto">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-violet-primary/20 flex items-center justify-center text-violet-light shrink-0">
            <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-medium text-white">28°C</div>
            <div className="text-xs sm:text-sm text-white/60">Sunny · Low Humidity</div>
          </div>
        </div>
      </motion.div>

      {/* Today's Recommendation Banner */}
      <motion.div variants={itemVariants} className="mb-8 md:mb-12">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-primary/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start lg:items-center justify-between relative z-10">
            <div className="flex-1 w-full text-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-violet-primary/20 border border-violet-primary/40 text-violet-light text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> TODAY'S AI MATCH · 98% MATCH
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-white mb-2.5 sm:mb-3">
                Monochrome Autumn Flatlay Look
              </h2>
              <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 max-w-xl">
                Tailored black blazer paired with crisp cotton crewneck, tapered trousers, and sleek leather boots. Perfect for your 28°C sunny afternoon.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                <Link to="/app/stylist" className="w-full lg:w-auto">
                  <button className="w-full lg:w-auto h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-violet-primary hover:bg-violet-light text-white font-medium text-xs sm:text-sm transition shadow-[0_0_25px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Ask AI Stylist</span>
                  </button>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-72 h-48 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden relative border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0">
              <img 
                src="/src/assets/images/curated_outfit_board_1786447675731.jpg" 
                alt="Today's Look" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                4 Pieces Combined
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main CTA */}
      <motion.div
        variants={itemVariants}
        className="mb-12"
      >
        <Link to="/app/outfits/generate">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-10 group cursor-pointer border border-violet-primary/40 shadow-[0_0_40px_-15px_rgba(138,43,226,0.3)] hover:shadow-[0_0_60px_-15px_rgba(138,43,226,0.6)] transition transform-gpu duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-deep via-violet-primary to-violet-deep opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div 
              animate={{ 
                x: ['0%', '-50%'],
                y: ['0%', '-50%']
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
              className="absolute top-0 left-0 w-[200%] h-[200%] bg-mesh mix-blend-overlay opacity-50 bg-[length:50%_50%] transform-gpu will-change-transform" 
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-display font-medium mb-2">✨ Custom Outfit Generator</h3>
                <p className="text-white/80 text-sm md:text-base">Pick your vibe, weather, or event and let Gemini curate a head-turning look.</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Wand2 className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mb-12">
        <h3 className="text-lg font-medium text-white/80 mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-light" /> Quick Actions
        </h3>
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          variants={containerVariants}
        >
          {quickActions.map((action) => (
            <motion.div
              key={action.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <Link to={action.path} className="block h-full">
                <div className="glass-panel h-full p-5 rounded-2xl border-white/10 hover:border-violet-primary/50 hover:bg-white/5 transition transform-gpu group flex flex-col justify-between gap-4">
                  <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center text-violet-light group-hover:scale-110 group-hover:bg-violet-primary/20 transition transform-gpu">
                    {action.icon}
                  </div>
                  <div>
                    <div className="font-medium mb-1 text-sm">{action.label}</div>
                    <div className="text-xs text-white/50">{action.desc}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Recent Wardrobe Items Showcase */}
      <motion.div
        variants={itemVariants}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white/80">Your Wardrobe Highlights</h3>
          <Link to="/app/wardrobe" className="text-xs text-violet-light hover:text-white transition-colors font-medium">
            View All Items →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Blue Denim Jacket', category: 'Outerwear', img: 'https://images.unsplash.com/photo-1551028719-01c1eb56211d?auto=format&fit=crop&q=80&w=300' },
            { name: 'White Oversized Tee', category: 'Tops', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=300' },
            { name: 'Black Cargo Pants', category: 'Bottoms', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=300' },
            { name: 'White Leather Sneakers', category: 'Shoes', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?auto=format&fit=crop&q=80&w=300' },
          ].map((item, i) => (
            <div key={i} className="glass-panel rounded-2xl overflow-hidden border border-white/10 group hover:border-violet-primary/50 transition duration-300">
              <div className="h-36 overflow-hidden relative bg-charcoal">
                <img src={item.img} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100" />
              </div>
              <div className="p-3">
                <div className="text-xs font-medium text-white/90 truncate">{item.name}</div>
                <div className="text-[11px] text-white/50">{item.category}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
