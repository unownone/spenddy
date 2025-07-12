import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface HeroProps {
  onGetStarted: () => void;
  githubStars: number | null;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, githubStars }) => {
  return (
    <section className="relative flex flex-col items-center justify-center py-24 md:py-32 overflow-hidden">
      {/* Gradient background blob */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-700/30 via-purple-700/20 to-transparent blur-3xl" />
      <motion.img
        src="/logo.png"
        alt="Spenddy Logo"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-24 h-24 mb-6"
      />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl text-center"
      >
        Know <span className="text-orange-500">exactly</span> where your money goes.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl text-center"
      >
        Spenddy turns raw statements from food & shopping platforms into beautiful private dashboards—no servers, no sign-up.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-8 flex gap-4"
      >
        <button
          onClick={onGetStarted}
          className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg"
        >
          Get Started
        </button>
        <a
          href="https://github.com/unownone/spenddy"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-lg border border-border hover:bg-muted/30 font-semibold flex items-center gap-2"
        >
          ⭐ {githubStars !== null ? githubStars.toLocaleString() : "Star on GitHub"}
        </a>
      </motion.div>
    </section>
  );
};

export default Hero; 