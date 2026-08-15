import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const DNA_DATA = [
  { label: 'Minimal', value: 82 },
  { label: 'Casual', value: 74 },
  { label: 'Streetwear', value: 61 },
  { label: 'Formal', value: 34 },
];

const INSIGHTS = [
  "You seem to prefer neutral colors.",
  "You frequently choose relaxed fits.",
  "You love sneakers.",
  "You rarely choose bright colors."
];

export default function StyleProfilePage() {
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-2">Your Style DNA</h1>
        <p className="text-white/60">How StyleMatch AI understands your fashion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* DNA Chart */}
        <motion.div 
          className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-violet-primary/30 hover:shadow-[0_0_40px_-10px_rgba(138,43,226,0.2)] transition transform-gpu duration-500"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-violet-primary/5 rounded-full blur-[80px] group-hover:bg-violet-primary/10 transition-colors duration-500" />
          <h2 className="text-xl font-medium mb-8 flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5 text-violet-primary" />
            Style Composition
          </h2>
          
          <div className="space-y-6 relative z-10">
            {DNA_DATA.map((item, i) => (
              <motion.div key={item.label} variants={itemVariants}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">{item.label}</span>
                  <span className="text-violet-light font-medium">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-deep to-violet-primary"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-violet-primary/30 hover:shadow-[0_0_40px_-10px_rgba(138,43,226,0.2)] transition transform-gpu duration-500"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-primary/10 rounded-full blur-[80px] group-hover:bg-violet-primary/20 transition-colors duration-500" />
          
          <h2 className="text-xl font-medium mb-8 relative z-10">Your Style Is Evolving</h2>
          
          <div className="space-y-4 relative z-10">
            {INSIGHTS.map((insight, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-4 rounded-2xl bg-charcoal/50 border border-white/5 flex items-start gap-4 hover:bg-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-violet-primary/20 text-violet-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-white/80 text-sm leading-relaxed pt-1 group-hover:text-white transition-colors duration-300">
                  {insight}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
