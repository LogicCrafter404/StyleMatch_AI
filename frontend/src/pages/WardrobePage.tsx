import { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Search, Filter, X, Wand2, Tag, Calendar, Layers, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DEMO_ITEMS = [
  { id: 1, name: 'Blue Denim Jacket', category: 'Jackets', color: 'Blue', season: 'Spring', favorite: true, wearCount: 18, brand: 'Acne Studios', fabric: '100% Organic Cotton Denim', image: 'https://images.unsplash.com/photo-1551028719-01c1eb56211d?auto=format&fit=crop&q=80&w=400&h=500' },
  { id: 2, name: 'White Oversized T-Shirt', category: 'Tops', color: 'White', season: 'Summer', favorite: false, wearCount: 24, brand: 'COS', fabric: 'Heavyweight Cotton', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400&h=500' },
  { id: 3, name: 'Black Cargo Pants', category: 'Bottoms', color: 'Black', season: 'All', favorite: true, wearCount: 15, brand: 'Carhartt WIP', fabric: 'Ripstop Cotton', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400&h=500' },
  { id: 4, name: 'White Leather Sneakers', category: 'Shoes', color: 'White', season: 'All', favorite: true, wearCount: 32, brand: 'Common Projects', fabric: 'Nappa Leather', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?auto=format&fit=crop&q=80&w=400&h=500' },
  { id: 5, name: 'Grey Fleece Hoodie', category: 'Tops', color: 'Grey', season: 'Winter', favorite: false, wearCount: 12, brand: 'Reigning Champ', fabric: 'French Terry', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400&h=500' },
  { id: 6, name: 'Beige Tapered Chinos', category: 'Bottoms', color: 'Beige', season: 'Summer', favorite: false, wearCount: 9, brand: 'Uniqlo U', fabric: 'Stretch Cotton Twill', image: 'https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?auto=format&fit=crop&q=80&w=400&h=500' },
];

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Jackets', 'Shoes', 'Accessories'];

export default function WardrobePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof DEMO_ITEMS[0] | null>(null);
  const [items, setItems] = useState(DEMO_ITEMS);
  const navigate = useNavigate();

  const toggleFavorite = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
    }
  };

  const filteredItems = items.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-2">My Wardrobe</h1>
          <p className="text-white/60">6 scanned items · AI style matrix ready</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search clothes, brand, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-charcoal/80 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary text-white w-full md:w-72"
            />
          </div>
          <Link to="/app/wardrobe/add">
            <button className="px-4 py-2.5 rounded-full bg-violet-primary hover:bg-violet-light text-white font-medium text-sm transition shadow-[0_0_20px_rgba(138,43,226,0.4)] flex items-center gap-1.5 whitespace-nowrap">
              + Add Item
            </button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? items.length : items.filter(i => i.category === cat).length;
          return (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition transform-gpu duration-300 flex items-center gap-2 ${
                activeCategory === cat 
                  ? 'bg-violet-primary text-white box-glow' 
                  : 'bg-charcoal border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      <motion.div 
        layout 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-20"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => (
            <motion.div
              layout
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-violet-primary/60 hover:shadow-[0_0_35px_-5px_rgba(138,43,226,0.3)] transition transform-gpu duration-300 cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden bg-charcoal-light relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button 
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-red-400 border border-white/10 transition"
                  >
                    <Heart className={`w-4 h-4 ${item.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                {/* AI Badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-violet-primary/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-light" />
                  <span className="text-[10px] uppercase tracking-wider text-violet-light font-bold">AI Scanned</span>
                </div>
              </div>

              <div className="p-4 relative">
                <h3 className="font-medium text-sm text-white/90 truncate">{item.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/50 font-medium">{item.category} · {item.brand}</span>
                  <div className="flex items-center gap-1 text-[11px] text-violet-light">
                    <span>{item.wearCount} wears</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Add New Card */}
        <Link to="/app/wardrobe/add">
          <motion.div
            layout
            variants={itemVariants}
            className="h-full min-h-[280px] rounded-2xl border-2 border-dashed border-white/15 hover:border-violet-primary/50 hover:bg-violet-primary/5 transition transform-gpu duration-300 flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-violet-primary/20 transition text-white/50 group-hover:text-violet-light">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">Add New Clothing</span>
          </motion.div>
        </Link>
      </motion.div>

      {filteredItems.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white/40 py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg">No clothes found.</p>
          <p className="text-sm">Try a different search or filter.</p>
        </div>
      )}

      {/* Item Detail Inspector Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card rounded-3xl border border-white/20 max-w-2xl w-full overflow-hidden relative shadow-[0_0_50px_rgba(138,43,226,0.3)]"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/2 h-72 sm:h-auto relative bg-charcoal">
                  <img src={selectedItem.image} alt={selectedItem.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-violet-primary/80 text-white font-bold text-xs">
                    {selectedItem.category}
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="text-xs text-violet-light font-bold uppercase tracking-wider mb-1">{selectedItem.brand}</div>
                    <h2 className="text-2xl font-display font-medium text-white mb-3">{selectedItem.name}</h2>
                    
                    <div className="space-y-2 text-xs text-white/70">
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Color</span>
                        <span className="text-white font-medium">{selectedItem.color}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Fabric</span>
                        <span className="text-white font-medium">{selectedItem.fabric}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Season</span>
                        <span className="text-white font-medium">{selectedItem.season}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Wear Stats</span>
                        <span className="text-violet-light font-semibold">{selectedItem.wearCount} times worn</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-violet-primary/15 border border-violet-primary/30 text-xs leading-relaxed text-white/90">
                      <div className="font-bold text-violet-light flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Styling Insight
                      </div>
                      Versatile piece! Combines best with dark bottoms and layered outerwear.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedItem(null);
                        navigate('/app/outfits/generate');
                      }}
                      className="flex-1 py-3 rounded-xl bg-violet-primary hover:bg-violet-light text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-[0_0_20px_rgba(138,43,226,0.4)]"
                    >
                      <Wand2 className="w-4 h-4" /> Style This Piece
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
