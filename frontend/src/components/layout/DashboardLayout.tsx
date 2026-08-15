import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Layers, Wand2, MessageSquare, 
  PieChart, Heart, Plane, Plus, Menu, X, LogOut, User, Save 
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { icon: <PieChart className="w-5 h-5" />, label: 'Dashboard', path: '/app' },
  { icon: <Layers className="w-5 h-5" />, label: 'Wardrobe', path: '/app/wardrobe' },
  { icon: <Wand2 className="w-5 h-5" />, label: 'Outfits', path: '/app/outfits/generate' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'AI Stylist', path: '/app/stylist' },
  { icon: <Heart className="w-5 h-5" />, label: 'Saved Looks', path: '/app/outfits' },
  { icon: <Sparkles className="w-5 h-5" />, label: 'Style DNA', path: '/app/style' },
  { icon: <Plane className="w-5 h-5" />, label: 'Travel', path: '/app/travel' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Core profile state
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@stylematch.ai',
    bio: 'Minimalist fashion enthusiast curating an effortless, aesthetic wardrobe.',
    stylePreference: 'Minimalist, Streetwear',
    shirtSize: 'M',
    shoeSize: 'US 10',
    avatarInitials: 'AM',
  });

  // Draft profile state used when editing in the modal
  const [draftProfile, setDraftProfile] = useState(userProfile);

  // Load profile data on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('stylematch_user_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        // Fallback: If onboarding details exist, pre-fill style preference
        const savedOnboarding = localStorage.getItem('stylematch_onboarding');
        if (savedOnboarding) {
          const onboarding = JSON.parse(savedOnboarding);
          setUserProfile(prev => ({
            ...prev,
            stylePreference: onboarding.styles?.join(', ') || prev.stylePreference
          }));
        }
      }
    } catch (e) {
      console.warn('Could not read user profile from localStorage', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('stylematch_onboarding');
    navigate('/');
  };

  const openProfileModal = () => {
    setDraftProfile(userProfile);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate initials from the edited name
    const initials = draftProfile.name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updatedProfile = {
      ...draftProfile,
      avatarInitials: initials || '??'
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('stylematch_user_profile', JSON.stringify(updatedProfile));
    setIsProfileModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-black">
      
      {/* Desktop Sidebar: Locked sticky layout to keep profile visible at all times */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Sparkles className="w-5 h-5 text-violet-primary" />
            <span className="font-display font-semibold tracking-wider uppercase">
              StyleMatch<span className="text-violet-primary">AI</span>
            </span>
          </Link>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-violet-primary/20 border border-violet-primary/50 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10 font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM CONTAINER: Add Clothing button + Interactive Profile card */}
        <div className="mt-auto p-6 border-t border-white/5 space-y-4 bg-black/40">
          <Link to="/app/wardrobe/add" className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-white">
            <Plus className="w-4 h-4" />
            Add Clothing
          </Link>

          {/* Clickable Profile Card */}
          <div 
            onClick={openProfileModal}
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-primary/30 hover:bg-white/[0.05] cursor-pointer transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-semibold text-white shadow-[0_0_15px_rgba(138,43,226,0.35)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                {userProfile.avatarInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate leading-tight group-hover:text-violet-light transition-colors">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-white/40 truncate leading-tight mt-0.5">
                  {userProfile.email}
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering profile card modal
                handleLogout();
              }}
              className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-primary" />
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/80 p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-black/95 backdrop-blur-xl pt-24 px-6 flex flex-col"
          >
            <nav className="space-y-4 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 text-xl font-display transition-colors ${
                    location.pathname === item.path ? 'text-violet-primary' : 'text-white/70'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Profile & Logout */}
            <div className="py-8 border-t border-white/5 space-y-4">
              <div 
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfileModal();
                }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 active:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-sm font-semibold text-white shadow-[0_0_15px_rgba(138,43,226,0.35)] shrink-0">
                    {userProfile.avatarInitials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">
                      {userProfile.name}
                    </span>
                    <span className="text-xs text-white/40 truncate mt-0.5">
                      {userProfile.email}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-3 rounded-xl text-white/50 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pt-16 md:pt-0 overflow-x-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-violet-primary/10 rounded-full blur-[100px] transform-gpu"
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[20%] left-[5%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] bg-fuchsia-600/5 rounded-full blur-[120px] transform-gpu"
            animate={{ 
              x: [0, 100, 0], 
              y: [0, -50, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div 
            className="absolute top-[40%] left-[40%] w-[20vw] h-[20vw] min-w-[200px] min-h-[200px] bg-blue-600/5 rounded-full blur-[80px] transform-gpu"
            animate={{ 
              x: [0, -80, 0], 
              y: [0, -80, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="flex-1 p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <Link 
        to="/app/wardrobe/add"
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-violet-primary text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.5)] z-40"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* INTERACTIVE PROFILE MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0b0713] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg relative z-10 shadow-[0_0_50px_rgba(138,43,226,0.3)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-primary/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-400/40 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-display font-medium text-white">Your Style Profile</h3>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 relative z-10 overflow-y-auto max-h-[70vh] pr-1">
                {/* Visual Avatar Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_20px_rgba(138,43,226,0.5)]">
                    {draftProfile.name ? draftProfile.name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) : '??'}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{draftProfile.name || 'Your Name'}</h4>
                    <p className="text-xs text-white/40">{draftProfile.email || 'your.email@example.com'}</p>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={draftProfile.name}
                      onChange={(e) => setDraftProfile({...draftProfile, name: e.target.value})}
                      className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={draftProfile.email}
                      onChange={(e) => setDraftProfile({...draftProfile, email: e.target.value})}
                      className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                    />
                  </div>
                </div>

                {/* Bio / Motto */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Style Bio & Motto</label>
                  <textarea 
                    rows={2}
                    value={draftProfile.bio}
                    onChange={(e) => setDraftProfile({...draftProfile, bio: e.target.value})}
                    placeholder="E.g., Minimalism and high quality essentials over quantity..."
                    className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 resize-none transition-all"
                  />
                </div>

                {/* Aesthetic Preferences */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Aesthetic / Style Preferences</label>
                  <input 
                    type="text"
                    value={draftProfile.stylePreference}
                    onChange={(e) => setDraftProfile({...draftProfile, stylePreference: e.target.value})}
                    placeholder="E.g., Casual, Retro, Streetwear, Avant-Garde"
                    className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                  />
                </div>

                {/* Size Guides */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Shirt/Top Size</label>
                    <select 
                      value={draftProfile.shirtSize}
                      onChange={(e) => setDraftProfile({...draftProfile, shirtSize: e.target.value})}
                      className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white select-custom transition-all"
                    >
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <option key={size} value={size} className="bg-[#0b0713]">{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Shoe Size</label>
                    <input 
                      type="text"
                      value={draftProfile.shoeSize}
                      placeholder="E.g. US 10, EU 43"
                      onChange={(e) => setDraftProfile({...draftProfile, shoeSize: e.target.value})}
                      className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-medium text-white/80 hover:text-white transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl text-xs font-medium text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}