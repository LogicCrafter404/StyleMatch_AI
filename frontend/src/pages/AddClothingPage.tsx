import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, ImageIcon, ScanLine, Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function AddClothingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      // Simulate scan
      setTimeout(() => {
        setScanning(true);
        setTimeout(() => {
          setScanning(false);
          setScanComplete(true);
        }, 3000);
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center">
      <div className="text-center mb-10 w-full">
        <h1 className="text-3xl md:text-4xl font-display font-medium text-white/90 mb-2">Add a new piece.</h1>
        <p className="text-white/60">Upload a photo or take one right now.</p>
      </div>

      <div className="w-full flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-violet-primary/50 transition-colors group cursor-pointer bg-charcoal/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-primary/20 transition transform-gpu">
                <Upload className="w-8 h-8 text-white/50 group-hover:text-violet-light" />
              </div>
              <h3 className="text-2xl font-medium mb-8">Upload Photo</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button variant="secondary" className="flex-1" icon={<Camera className="w-4 h-4"/>}>
                  Take Photo
                </Button>
                <Button variant="secondary" className="flex-1" icon={<ImageIcon className="w-4 h-4"/>}>
                  Device
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col md:flex-row gap-8 items-center md:items-start justify-center"
            >
              {/* Image Container with Scanner */}
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                
                {/* Scanner overlay */}
                {scanning && (
                  <>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <motion.div 
                      className="absolute top-[-100%] left-0 right-0 h-full border-b-2 border-violet-primary shadow-[0_10px_30px_rgba(138,43,226,1)] z-20 bg-gradient-to-b from-transparent to-violet-primary/20 transform-gpu will-change-transform"
                      animate={{ y: ['0%', '200%'] }}
                      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <ScanLine className="w-10 h-10 text-violet-primary mb-4 animate-pulse" />
                        <span className="text-sm font-display tracking-widest text-violet-light bg-black/50 px-4 py-1 rounded-full border border-violet-primary/30">Understanding your garment...</span>
                      </div>
                    </div>
                  </>
                )}
                
                {scanComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-4 border-violet-primary rounded-2xl pointer-events-none"
                  >
                    {/* Detection Points */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute top-[30%] left-[40%] w-3 h-3 bg-violet-primary rounded-full box-glow" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute top-[60%] left-[50%] w-3 h-3 bg-violet-primary rounded-full box-glow" />
                  </motion.div>
                )}
              </div>

              {/* Results Panel */}
              <div className="w-full max-w-sm">
                <AnimatePresence>
                  {scanComplete ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-panel p-6 rounded-2xl"
                    >
                      <div className="flex items-center gap-2 mb-6 text-violet-light">
                        <Check className="w-5 h-5" />
                        <span className="text-sm tracking-wider uppercase font-medium">Scan Complete</span>
                      </div>
                      
                      <h3 className="text-2xl font-medium mb-6">Blue Denim Jacket</h3>
                      
                      <motion.div 
                        className="space-y-4 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Category</span>
                          <span className="font-medium">Jacket</span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Color</span>
                          <span className="font-medium flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span> Blue
                          </span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Season</span>
                          <span className="font-medium">Spring / Fall</span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/50">Style</span>
                          <span className="font-medium">Casual</span>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex justify-between">
                          <span className="text-white/50">Confidence</span>
                          <span className="font-medium text-violet-light">96%</span>
                        </motion.div>
                      </motion.div>

                      <div className="flex flex-col gap-3">
                        <Button className="w-full" icon={<ArrowRight className="w-4 h-4"/>}>Looks Right</Button>
                        <Button variant="ghost" className="w-full">Edit Details</Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full min-h-[300px] flex items-center justify-center text-white/30 border border-dashed border-white/10 rounded-2xl p-6 text-center">
                      Analysis results will appear here...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
