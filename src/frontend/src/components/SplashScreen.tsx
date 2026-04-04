import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const step = 100 / 25; // 25 ticks over 2500ms = 100ms each
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      setProgress(Math.min(current, 100));
      if (current >= 100) clearInterval(interval);
    }, 100);

    // Start fade-out after 2.3s, call onComplete after 2.7s
    const fadeTimer = setTimeout(() => setVisible(false), 2300);
    const doneTimer = setTimeout(() => onComplete(), 2700);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 60% 20%, oklch(0.22 0.06 280) 0%, oklch(0.12 0.04 270) 45%, oklch(0.08 0.02 260) 100%)",
          }}
        >
          {/* Ambient glow blobs */}
          <div
            className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: "oklch(0.55 0.22 280)" }}
          />
          <div
            className="absolute bottom-[20%] right-[5%] w-56 h-56 rounded-full opacity-15 blur-3xl"
            style={{ background: "oklch(0.65 0.2 320)" }}
          />

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 px-8"
          >
            {/* Logo with glow ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.55,
                delay: 0.15,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative"
            >
              {/* Outer glow pulse */}
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: "transparent",
                  boxShadow: "0 0 0 8px oklch(0.55 0.22 280 / 0.25)",
                }}
              />
              {/* Gradient ring */}
              <div
                className="absolute -inset-[3px] rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, oklch(0.7 0.22 280), oklch(0.65 0.2 320), oklch(0.55 0.22 280))",
                  filter: "blur(1px)",
                }}
              />
              <img
                src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
                alt="Aks-e-bilkees"
                className="relative h-28 w-28 rounded-full object-cover border-2"
                style={{ borderColor: "oklch(0.35 0.04 280)" }}
              />
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-center space-y-2"
            >
              <h1
                className="text-4xl font-bold tracking-tight"
                style={{
                  fontFamily: "'Playfair Display', 'Lora', Georgia, serif",
                  background:
                    "linear-gradient(135deg, oklch(0.92 0.04 280), oklch(0.78 0.16 280), oklch(0.72 0.18 320))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Aks-e-bilkees
              </h1>
              <p
                className="text-sm tracking-[0.25em] uppercase font-medium"
                style={{ color: "oklch(0.65 0.08 280)" }}
              >
                Poetry
                <span
                  className="mx-2 opacity-60"
                  style={{ color: "oklch(0.55 0.18 320)" }}
                >
                  •
                </span>
                Dua
                <span
                  className="mx-2 opacity-60"
                  style={{ color: "oklch(0.55 0.18 320)" }}
                >
                  •
                </span>
                Music
              </p>
            </motion.div>

            {/* Animated dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex items-center gap-2 mt-2"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    background: "oklch(0.6 0.16 280)",
                    animationDelay: `${i * 150}ms`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 left-8 right-8 max-w-xs mx-auto"
          >
            <div
              className="h-0.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.3 0.04 280)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, oklch(0.55 0.22 280), oklch(0.65 0.2 320))",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </motion.div>

          {/* Bottom branding */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-5 text-xs"
            style={{ color: "oklch(0.45 0.04 280)" }}
          >
            By Developer Ikhlas
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
