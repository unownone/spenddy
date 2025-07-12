import React from "react";
import { motion } from "framer-motion";
import { Download, Play, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Download,
    title: "Install the Extension",
    text: "Grab Spenddy-Link from the Chrome Web Store and fetch your statements with one click.",
  },
  {
    icon: Play,
    title: "Open Spenddy",
    text: "Data syncs instantly inside your browser – zero configuration.",
  },
  {
    icon: BarChart3,
    title: "Explore Dashboards",
    text: "Slice & dice your spending by month, restaurant, location, and more.",
  },
];

const HowItWorks: React.FC = () => (
  <section className="py-24 bg-muted/5">
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>
      <div className="relative border-l pl-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="mb-12 last:mb-0 flex gap-4"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-600/90 text-white shadow-lg">
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{s.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks; 