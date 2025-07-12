import React from "react";
import { SourceDefinition } from "../../sources/BaseSource";
import { useOutletContext, Link } from "react-router-dom";
import { AnalyticsDataset, OrderRecord } from "../../types/CommonData";
import { motion } from "framer-motion";
import { DownloadCloud, CheckCircle2 } from "lucide-react";

interface Props {
  source: SourceDefinition;
}

interface OutletCtx {
  dataset?: { records: OrderRecord[]; analytics: AnalyticsDataset };
}

const ImportTab: React.FC<Props> = ({ source }) => {
  const { dataset } = useOutletContext<OutletCtx>();

  if (dataset) {
    return (
      <section className="py-24 flex flex-col items-center text-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center space-y-6"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          <h2 className="text-4xl font-bold text-emerald-500">
            {dataset.records.length.toLocaleString()} orders synced!
          </h2>
          <p className="text-muted-foreground max-w-md">
            Your {source.name} history is ready.
          </p>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="overview"
              className="px-8 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xl"
            >
              View Dashboards →
            </Link>
          </motion.div>
        </motion.div>
        {/* Pulsating gradient background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-orange-600/10 to-purple-700/10 blur-3xl -z-10"
        />
      </section>
    );
  }

  // No data yet – show import instructions based on method
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 max-w-xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold">Import your {source.name} data</h2>
      {source.importMethods.includes("extension") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-6"
        >
          <DownloadCloud className="w-16 h-16 text-orange-500" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            Install our free browser extension and we’ll fetch your order history automatically.
          </p>
          {source.extensionLink && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              href={source.extensionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xl"
            >
              Install Spenddy-Link ↗
            </motion.a>
          )}
          <p className="text-sm text-muted-foreground max-w-sm">
            After installing, refresh this page and your data will appear automatically.
          </p>
        </motion.div>
      )}
      {source.importMethods.includes("file") && (
        <p>File upload coming soon.</p>
      )}
    </div>
  );
};

export default ImportTab; 