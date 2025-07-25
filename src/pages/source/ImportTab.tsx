import React, { useState } from "react";
import { SourceDefinition } from "../../sources/BaseSource";
import { useOutletContext, Link } from "react-router-dom";
import { AnalyticsDataset, OrderRecord } from "../../types/CommonData";
import { motion } from "framer-motion";
import { DownloadCloud, CheckCircle2, RefreshCw } from "lucide-react";
import { useSourceData } from "../../contexts/SourceDataContext";
// Re-use landing page sections for richer context
import HowItWorks from "../home/components/HowItWorks";
import DemoSection from "../home/components/DemoSection";

interface Props {
  source: SourceDefinition;
}

interface OutletCtx {
  dataset?: { records: OrderRecord[]; analytics: AnalyticsDataset };
}

const ImportTab: React.FC<Props> = ({ source }) => {
  const { dataset } = useOutletContext<OutletCtx>();
  const { refreshFromIndexedDB } = useSourceData();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          <motion.div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="overview"
                className="px-8 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xl"
              >
                View Dashboards →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    // Trigger the extension to fetch fresh data
                    window.dispatchEvent(
                      new CustomEvent("spenddy-fetch-orders")
                    );

                    // Wait a bit for the extension to process
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // Then refresh from IndexedDB
                    await refreshFromIndexedDB(source.id);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className="px-6 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold shadow-xl flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh Data
              </button>
            </motion.div>
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
    <>
      {/* Spenddy for Swiggy hero */}
      <section className="pt-16 pb-8 text-center space-y-4 max-w-2xl mx-auto px-4">
        <img
          src="/logo.png"
          alt="Spenddy logo"
          className="w-14 h-14 mx-auto rounded-lg shadow"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
          Spenddy for {source.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Visualise your {source.name} spending habits, uncover hidden patterns,
          and get clarity on where your food budget really goes – all securely
          in your browser.
        </p>
      </section>

      {/* Import instructions */}
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-8 max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold">
          Import your {source.name} data
        </h2>
        {source.importMethods.includes("extension") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-6"
          >
            <DownloadCloud className="w-16 h-16 text-orange-500" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Install our free browser extension and we’ll fetch your order
              history automatically.
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
              After installing, refresh this page and your data will appear
              automatically.
            </p>
            <motion.div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Already installed the extension? Try refreshing the data:
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    // Trigger the extension to fetch fresh data
                    window.dispatchEvent(
                      new CustomEvent("spenddy-fetch-orders")
                    );

                    // Wait a bit for the extension to process
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // Then refresh from IndexedDB
                    await refreshFromIndexedDB(source.id);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold shadow-lg flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh from Extension"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {source.importMethods.includes("file") && (
          <p>File upload coming soon.</p>
        )}
      </div>

      {/* Spenddy-Link walkthrough + demo */}
      <HowItWorks />
      <DemoSection />
    </>
  );
};

export default ImportTab;
