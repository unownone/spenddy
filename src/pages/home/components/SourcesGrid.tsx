import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SourceDefinition } from "../../../sources/BaseSource";

interface Props {
  sources: Record<string, SourceDefinition>;
}

const SourcesGrid: React.FC<Props> = ({ sources }) => (
  <section id="sources" className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Supported Sources</h2>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {Object.values(sources).map((src, idx) => (
          <motion.div
            key={src.id}
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ y: -4, rotate: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              to={`/${src.id}`}
              className="group block border rounded-xl p-6 bg-background/60 backdrop-blur hover:shadow-xl transition"
            >
              {src.logo && (
                <img src={src.logo} alt={src.name} className="h-10 mb-4" />
              )}
              <h3 className="text-xl font-semibold mb-1 group-hover:text-orange-500 transition-colors">
                {src.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{src.description}</p>
              <span className="inline-block text-xs rounded-full bg-muted px-3 py-1">
                {src.importMethods.join(" · ")}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SourcesGrid; 