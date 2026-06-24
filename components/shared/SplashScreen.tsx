"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Only run on the client side
    const seen = sessionStorage.getItem("cha_splash_seen");
    if (!seen) {
      setShowSplash(true);
      sessionStorage.setItem("cha_splash_seen", "true");

      // Dismiss after 2.5s max, or 0.5s if reduced motion
      const timeout = shouldReduceMotion ? 500 : 2500;
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [shouldReduceMotion]);

  // Handle manual dismiss if they tap/click
  const handleDismiss = () => {
    setShowSplash(false);
  };

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 10px rgba(0, 174, 255, 0)", "0 0 40px rgba(0, 174, 255, 0.4)", "0 0 10px rgba(0, 174, 255, 0)"] 
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="rounded-full p-4 mb-6"
            >
              <ShieldCheck className="w-24 h-24 text-[#00AEFF]" />
            </motion.div>
            
            <motion.h1
              className="text-3xl font-black tracking-tight flex"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
                hidden: {},
              }}
            >
              {"Community Hero AI".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-2"
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 15 },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.div 
              className="w-32 h-1 mt-8 rounded-full overflow-hidden bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="h-full bg-[#00FFE0]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
