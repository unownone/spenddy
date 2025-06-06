import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/dataProcessor';

interface HeaderProps {
  hasData: boolean;
  totalOrders: number;
  totalSpent: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const Header: React.FC<HeaderProps> = ({ hasData, totalOrders, totalSpent, dateRange }) => {
  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Spenddy Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Spenddy</h1>
              <p className="text-gray-400 text-sm">Transform Your Data</p>
            </div>
          </motion.div>

          {/* Stats Summary */}
          {hasData && (
            <motion.div
              className="hidden md:flex items-center space-x-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center space-x-2 text-sm">
                <ShoppingBag className="w-4 h-4 text-primary-500" />
                <span className="text-gray-300">
                  {totalOrders.toLocaleString()} orders
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-gray-300">
                  {formatCurrency(totalSpent)} spent
                </span>
              </div>

              {dateRange && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-300">
                    {format(dateRange.start, "MMM yyyy")} -{" "}
                    {format(dateRange.end, "MMM yyyy")}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Mobile Stats Summary */}
          {hasData && (
            <motion.div
              className="md:hidden flex flex-col items-end text-right"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-sm text-gray-300">
                {totalOrders.toLocaleString()} orders
              </div>
              <div className="text-sm text-green-500 font-semibold">
                {formatCurrency(totalSpent)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 