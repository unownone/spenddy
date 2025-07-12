import React from "react";
import { motion } from "framer-motion";

const DemoSection: React.FC = () => (
  <section className="py-24">
    <div className="max-w-5xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-8">See it in action</h2>
      <motion.img
        src="/demo.gif"
        alt="Spenddy Demo"
        className="rounded-xl shadow-lg mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
    </div>
  </section>
);

export default DemoSection; 