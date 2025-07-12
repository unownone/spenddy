import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Eye, Layers } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "All processing happens in your browser – data never leaves your device.",
    color: "purple",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Charts, maps, and breakdowns appear the moment the data arrives.",
    color: "orange",
  },
  {
    icon: Eye,
    title: "Actionable Visuals",
    description: "Interactive dashboards help you understand spending patterns at a glance.",
    color: "emerald",
  },
  {
    icon: Layers,
    title: "Multi-Source",
    description: "Plug-in support for any platform – Swiggy today, more tomorrow.",
    color: "blue",
  },
];

const FeaturesGrid: React.FC = () => (
  <section className="py-20 bg-muted/10">
    <div className="max-w-5xl mx-auto px-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="p-6 border rounded-xl bg-background/60 backdrop-blur"
        >
          <div className={`w-12 h-12 mb-4 rounded-lg flex items-center justify-center bg-${f.color}-500/20`}>
            <f.icon className={`w-6 h-6 text-${f.color}-500`} />
          </div>
          <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesGrid; 