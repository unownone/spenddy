import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Store,
  Lightbulb,
  Moon,
  Sun
} from 'lucide-react';

import { SwiggyOrder, ProcessedOrder, AnalyticsData, TimeFilter } from './types/SwiggyData';
import { processOrderData, generateAnalyticsData } from './utils/dataProcessor';
import { subMonths } from 'date-fns';
import { useTheme } from 'next-themes';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/theme-provider';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Import Tailwind CSS
import './index.css';

// Components
import FileUpload from './components/FileUpload';

interface AppState {
  rawData: SwiggyOrder[] | null;
  processedData: ProcessedOrder[] | null;
  analyticsData: AnalyticsData | null;
  filteredData: ProcessedOrder[] | null;
  isLoading: boolean;
  error: string | null;
  activeView: string;
  timeFilter: TimeFilter;
}

const initialTimeFilter: TimeFilter = {
  start: subMonths(new Date(), 12),
  end: new Date(),
  label: 'Last 12 months'
};

const navigationItems = [
  { id: 'upload', icon: Upload, label: 'Upload Data', description: 'Import your Swiggy data' },
  { id: 'overview', icon: BarChart3, label: 'Overview', description: 'General statistics' },
  { id: 'spending', icon: TrendingUp, label: 'Spending', description: 'Financial insights' },
  { id: 'restaurants', icon: Store, label: 'Restaurants', description: 'Restaurant analytics' },
  { id: 'patterns', icon: Clock, label: 'Patterns', description: 'Ordering patterns' },
  { id: 'locations', icon: MapPin, label: 'Locations', description: 'Location analysis' },
  { id: 'insights', icon: Lightbulb, label: 'Insights', description: 'Smart insights' },
];

// Theme Toggle Component
function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// App Sidebar Component
function AppSidebar({ 
  activeView, 
  setActiveView, 
  processedData 
}: { 
  activeView: string; 
  setActiveView: (view: string) => void;
  processedData: ProcessedOrder[] | null;
}) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white">
            🍕
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Spenddy</span>
            <span className="truncate text-xs text-muted-foreground">
              Food Analytics
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isDisabled = item.id !== "upload" && !processedData;

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => !isDisabled && setActiveView(item.id)}
                    disabled={isDisabled}
                    isActive={isActive}
                    tooltip={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-xs text-muted-foreground">
            Privacy First • Data Local
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    rawData: null,
    processedData: null,
    analyticsData: null,
    filteredData: null,
    isLoading: false,
    error: null,
    activeView: 'upload',
    timeFilter: initialTimeFilter,
  });

  const handleFileUpload = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const text = await file.text();
      const rawData: SwiggyOrder[] = JSON.parse(text);
      
      if (!Array.isArray(rawData)) {
        throw new Error('Invalid file format. Expected an array of orders.');
      }

      if (rawData.length === 0) {
        throw new Error('No orders found in the file.');
      }

      // Process the data
      const processedData = processOrderData(rawData);
      const analyticsData = generateAnalyticsData(processedData);

      setState(prev => ({
        ...prev,
        rawData,
        processedData,
        analyticsData,
        isLoading: false,
        activeView: 'overview'
      }));

    } catch (error) {
      console.error('Error processing file:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to process file'
      }));
    }
  }, []);

  const setActiveView = (view: string) => {
    setState(prev => ({ ...prev, activeView: view }));
  };

  const renderContent = () => {
    switch (state.activeView) {
      case 'upload':
        return (
          <FileUpload 
            onFileUpload={handleFileUpload} 
            isLoading={state.isLoading} 
            error={state.error} 
          />
        );
      case 'overview':
        return <OverviewDashboard data={state.analyticsData} />;
      case 'spending':
        return <SpendingDashboard data={state.analyticsData} />;
      case 'restaurants':
        return <RestaurantsDashboard data={state.analyticsData} />;
      case 'patterns':
        return <PatternsDashboard data={state.analyticsData} />;
      case 'locations':
        return <LocationsDashboard data={state.analyticsData} />;
      case 'insights':
        return <InsightsDashboard data={state.analyticsData} />;
      default:
        return <div className="p-8 text-center">View not found</div>;
    }
  };

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem 
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar 
          activeView={state.activeView}
          setActiveView={setActiveView}
          processedData={state.processedData}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              
              {state.processedData && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="hidden sm:flex">
                    {state.processedData.length.toLocaleString()} orders
                  </Badge>
                  <Badge variant="outline" className="hidden md:flex">
                    ₹{state.analyticsData?.totalSpent.toLocaleString('en-IN')} total
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="ml-auto flex items-center gap-2 px-4">
              <ThemeToggle />
            </div>
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
};

// Updated Dashboard Components with shadcn/ui
const OverviewDashboard = ({ data }: { data: AnalyticsData | null }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      <p className="text-muted-foreground">
        Get a comprehensive view of your Swiggy ordering patterns
      </p>
    </div>
    
    {data ? (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                ₹{data.totalSpent.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{data.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                ₹{Math.round(data.averageOrderValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <Store className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{data.uniqueRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                Unique venues
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Your food ordering trends over time</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Average</span>
                  <span className="font-medium">₹{Math.round(data.totalSpent / 12).toLocaleString()}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Orders per Month</span>
                  <span className="font-medium">{Math.round(data.totalOrders / 12)}</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    ) : (
      <Card className="flex flex-col items-center justify-center h-96">
        <CardContent className="text-center space-y-4 pt-6">
          <Upload className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground">Upload your Swiggy data to see detailed insights</p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

const SpendingDashboard = ({ data }: { data: AnalyticsData | null }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Spending Analysis</h1>
      <p className="text-muted-foreground">
        Deep dive into your food expenses and spending patterns
      </p>
    </div>
    
    <Card className="flex flex-col items-center justify-center h-96">
      <CardContent className="text-center space-y-4 pt-6">
        <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">Detailed spending analytics are being developed</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const RestaurantsDashboard = ({ data }: { data: AnalyticsData | null }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Restaurant Analysis</h1>
      <p className="text-muted-foreground">
        Discover your favorite restaurants and cuisine preferences
      </p>
    </div>
    
    <Card className="flex flex-col items-center justify-center h-96">
      <CardContent className="text-center space-y-4 pt-6">
        <Store className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">Restaurant analytics dashboard is in development</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PatternsDashboard = ({ data }: { data: AnalyticsData | null }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Ordering Patterns</h1>
      <p className="text-muted-foreground">
        Analyze when and how you order food
      </p>
    </div>
    
    <Card className="flex flex-col items-center justify-center h-96">
      <CardContent className="text-center space-y-4 pt-6">
        <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">Pattern analysis features are being built</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const LocationsDashboard = ({ data }: { data: AnalyticsData | null }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Location Analysis</h1>
      <p className="text-muted-foreground">
        Explore where you order from most frequently
      </p>
    </div>
    
    <Card className="flex flex-col items-center justify-center h-96">
      <CardContent className="text-center space-y-4 pt-6">
        <MapPin className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">Location analytics are being developed</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const InsightsDashboard = ({ data }: { data: AnalyticsData | null }) => (
  <div className="space-y-6">
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Smart Insights</h1>
      <p className="text-muted-foreground">
        AI-powered insights and recommendations from your data
      </p>
    </div>
    
    <Card className="flex flex-col items-center justify-center h-96">
      <CardContent className="text-center space-y-4 pt-6">
        <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">AI-powered insights are being developed</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default App; 