import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Sparkles, Heart, Search, X, Wand2, Loader2, Pencil, Trash2, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  brand: string;
  style_tag: string;
  image_url: string;
  wears_count: number;
  is_favorite: boolean;
}

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Dresses'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function WardrobePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Edit/Delete operational states
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClothingItem>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWardrobe = async () => {
    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/wardrobe', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error("Failed to load wardrobe", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const toggleFavorite = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/wardrobe/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, is_favorite: !item.is_favorite } : item));
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite on Supabase", err);
    }
  };

  // 1. DELETE ITEM HANDLER
  const handleDeleteItem = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item from your digital wardrobe?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/wardrobe/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        setSelectedItem(null); // Close modal
      } else {
        alert('Failed to delete the clothing item.');
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 2. INIT EDIT FORM HANDLER
  const handleStartEdit = () => {
    if (!selectedItem) return;
    setEditForm({ ...selectedItem });
    setIsEditingModal(true);
  };

  // 3. SAVE EDIT HANDLER
  const handleSaveEdit = async () => {
    if (!selectedItem || !editForm.id) return;
    setIsSavingEdit(true);

    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/wardrobe/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          subcategory: editForm.subcategory,
          color: editForm.color,
          style_tag: editForm.style_tag,
          brand: editForm.brand,
          image_url: editForm.image_url
        })
      });

      if (res.ok) {
        const updatedItem = await res.json();
        // Update both local list and modal preview state
        setItems(prev => prev.map(item => item.id === editForm.id ? updatedItem : item));
        setSelectedItem(updatedItem);
        setIsEditingModal(false);
      } else {
        alert('Failed to save edited details.');
      }
    } catch (e) {
      console.error("Edit save failed", e);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        (item.brand && item.brand.toLowerCase().includes(search.toLowerCase())) ||
                        (item.color && item.color.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-violet-primary animate-spin" />
        <p className="text-white/40 text-sm uppercase tracking-wider">Syncing your closet with Supabase...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-2">My Wardrobe</h1>
          <p className="text-white/60">{items.length} scanned items · AI style matrix ready</p>
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
              onClick={() => {
                setIsEditingModal(false); // Reset edit view on select
                setSelectedItem(item);
              }}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-violet-primary/60 hover:shadow-[0_0_35px_-5px_rgba(138,43,226,0.3)] transition transform-gpu duration-300 cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden bg-charcoal-light relative">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button 
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-red-400 border border-white/10 transition"
                  >
                    <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
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
                  <span className="text-xs text-white/50 font-medium">{item.category} {item.brand ? `· ${item.brand}` : ''}</span>
                  <div className="flex items-center gap-1 text-[11px] text-violet-light">
                    <span>{item.wears_count} wears</span>
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
                onClick={() => {
                  setSelectedItem(null);
                  setIsEditingModal(false);
                }}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/2 h-72 sm:h-auto relative bg-charcoal">
                  <img src={selectedItem.image_url} alt={selectedItem.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-violet-primary/80 text-white font-bold text-xs">
                    {selectedItem.category}
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between gap-4">
                  
                  {isEditingModal ? (
                    /* DYNAMIC EDIT INTERFACE PANEL */
                    <div className="space-y-4 text-sm flex-1 flex flex-col justify-center">
                      <h3 className="text-lg font-display font-medium text-white border-b border-white/10 pb-2">Edit Garment Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-white/40 mb-1 ml-1">Clothing Name</label>
                          <input 
                            type="text" 
                            value={editForm.name || ''} 
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1 ml-1">Category</label>
                            <select 
                              value={editForm.category || 'Tops'} 
                              onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                              className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-primary"
                            >
                              <option value="Tops">Tops</option>
                              <option value="Bottoms">Bottoms</option>
                              <option value="Outerwear">Outerwear</option>
                              <option value="Shoes">Shoes</option>
                              <option value="Accessories">Accessories</option>
                              <option value="Dresses">Dresses</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1 ml-1">Brand</label>
                            <input 
                              type="text" 
                              value={editForm.brand || ''} 
                              onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                              className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-primary"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1 ml-1">Color</label>
                            <input 
                              type="text" 
                              value={editForm.color || ''} 
                              onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                              className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1 ml-1">Style Tag</label>
                            <select 
                              value={editForm.style_tag || 'Casual'} 
                              onChange={(e) => setEditForm({...editForm, style_tag: e.target.value})}
                              className="w-full bg-charcoal border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-primary"
                            >
                              {['Casual', 'Minimal', 'Streetwear', 'Formal', 'Sporty', 'Vintage', 'Elegant'].map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t border-white/10">
                        <button 
                          type="button" 
                          onClick={() => setIsEditingModal(false)}
                          className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/60 hover:text-white transition"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          onClick={handleSaveEdit}
                          disabled={isSavingEdit}
                          className="flex-1 py-2.5 rounded-xl bg-violet-primary hover:bg-violet-light text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition"
                        >
                          {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* STATIC DETAILS DISPLAY PANEL (Original Display) */
                    <>
                      <div>
                        <div className="text-xs text-violet-light font-bold uppercase tracking-wider mb-1">{selectedItem.brand || 'No Brand Listed'}</div>
                        <h2 className="text-2xl font-display font-medium text-white mb-3">{selectedItem.name}</h2>
                        
                        <div className="space-y-2 text-xs text-white/70">
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Color</span>
                            <span className="text-white font-medium">{selectedItem.color}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Subcategory</span>
                            <span className="text-white font-medium">{selectedItem.subcategory || 'None'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Style Tag</span>
                            <span className="text-white font-medium">{selectedItem.style_tag || 'Casual'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Wear Stats</span>
                            <span className="text-violet-light font-semibold">{selectedItem.wears_count} times worn</span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-violet-primary/15 border border-violet-primary/30 text-xs leading-relaxed text-white/90">
                          <div className="font-bold text-violet-light flex items-center gap-1 mb-1">
                            <Sparkles className="w-3.5 h-3.5" /> AI Styling Insight
                          </div>
                          A highly versatile {selectedItem.style_tag.toLowerCase()} piece! Pairs dynamically with neutral items.
                        </div>
                      </div>

                      {/* Dynamic Action Buttons Grid */}
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            setSelectedItem(null);
                            navigate('/app/outfits/generate');
                          }}
                          className="w-full py-3 rounded-xl bg-violet-primary hover:bg-violet-light text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-[0_0_20px_rgba(138,43,226,0.4)] animate-fade-in"
                        >
                          <Wand2 className="w-4 h-4" /> Style This Piece
                        </button>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={handleStartEdit}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Pencil className="w-4 h-4" /> Edit Details
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(selectedItem.id)}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 font-medium text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Piece
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}