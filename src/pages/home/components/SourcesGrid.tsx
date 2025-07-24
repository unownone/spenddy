import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SourceDefinition } from "../../../sources/BaseSource";

interface Props {
  sources: Record<string, SourceDefinition>;
}

// Helper function to check if a source is new
const isNewSource = (sourceId: string): boolean => {
  return sourceId === "swiggy-instamart" || sourceId === "swiggy-dineout";
};

const SourcesGrid: React.FC<Props> = ({ sources }) => (
  <section id="sources" className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Supported Sources
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {Object.values(sources).map((src, idx) => (
          <motion.div
            key={src.id}
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ y: -4, rotate: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            {/* NEW Badge */}
            {isNewSource(src.id) && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{
                  delay: 0.3 + idx * 0.1,
                  type: "spring",
                  stiffness: 500,
                }}
                className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white"
              >
                NEW
              </motion.div>
            )}

            <Link
              to={`/${src.id}`}
              className="group h-full flex flex-col border rounded-xl p-6 bg-background/60 backdrop-blur hover:shadow-xl transition"
            >
              <div className="flex items-start gap-4 flex-1 w-full">
                {src.logo && (
                  <img
                    src={src.logo}
                    alt={src.name}
                    className="h-12 w-12 object-contain flex-shrink-0"
                  />
                )}
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-orange-500 transition-colors">
                    {src.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex-1">
                    {src.description}
                  </p>
                </div>
              </div>
              <span className="inline-block text-xs rounded-full bg-muted px-3 py-1 mt-4 self-start">
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