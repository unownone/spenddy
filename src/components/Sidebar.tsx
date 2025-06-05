import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  BarChart3, 
  CreditCard, 
  Store, 
  Clock, 
  MapPin, 
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  hasData: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'upload',
    label: 'Upload Data',
    icon: Upload,
    description: 'Upload your Swiggy order data'
  },
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    disabled: true,
    description: 'General overview and key metrics'
  },
  {
    id: 'spending',
    label: 'Spending Analysis',
    icon: CreditCard,
    disabled: true,
    description: 'Monthly, yearly spending patterns'
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: Store,
    disabled: true,
    description: 'Favorite restaurants and cuisines'
  },
  {
    id: 'patterns',
    label: 'Order Patterns',
    icon: Clock,
    disabled: true,
    description: 'Time-based ordering behavior'
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: MapPin,
    disabled: true,
    description: 'Delivery locations and areas'
  },
  {
    id: 'insights',
    label: 'Smart Insights',
    icon: Lightbulb,
    disabled: true,
    description: 'AI-powered insights and recommendations'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, hasData }) => {
  const handleItemClick = (itemId: string, disabled: boolean) => {
    if (!disabled) {
      onViewChange(itemId);
    }
  };

  return (
    <aside className="w-64 bg-dark-800 border-r border-border min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">Analytics</h2>
          </div>
          <p className="text-sm text-gray-400">
            Explore your food ordering insights
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDisabled = (item.disabled ?? false) && !hasData;
            const isActive = activeView === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleItemClick(item.id, isDisabled)}
                  disabled={isDisabled}
                  className={clsx(
                    'sidebar-item w-full text-left group relative',
                    {
                      'active': isActive && !isDisabled,
                      'opacity-50 cursor-not-allowed': isDisabled,
                      'hover:scale-105': !isDisabled
                    }
                  )}
                  title={isDisabled ? 'Upload data first' : item.description}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  
                  {isDisabled && (
                    <div className="absolute inset-0 bg-dark-700/50 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              hasData ? 'bg-green-500' : 'bg-gray-500'
            )} />
            <span className="text-sm text-gray-400">
              {hasData ? 'Data loaded' : 'No data uploaded'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 