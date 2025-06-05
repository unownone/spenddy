import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Store,
  Lightbulb,
  Moon,
  Sun,
  Award,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

import {
  SwiggyOrder,
  ProcessedOrder,
  AnalyticsData,
  TimeFilter,
} from "./types/SwiggyData";
import {
  processOrderData,
  generateAnalyticsData,
  filterOrdersByDateRange,
} from "./utils/dataProcessor";
import { subMonths, startOfYear, startOfMonth } from "date-fns";

// Import dashboard components
import SpendingDashboard from "./components/dashboards/SpendingDashboard";
import { useTheme } from "next-themes";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ThemeProvider } from "@/components/theme-provider";
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
} from "@/components/ui/sidebar";

// Import Tailwind CSS
import "./index.css";

// Components
import FileUpload from "./components/FileUpload";

// Add cache key constants
const CACHE_KEYS = {
  RAW_DATA: "swiggy_raw_data",
  PROCESSED_DATA: "swiggy_processed_data",
  ANALYTICS_DATA: "swiggy_analytics_data",
  FILE_INFO: "swiggy_file_info",
};

interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
  orderCount: number;
}

interface AppState {
  rawData: SwiggyOrder[] | null;
  processedData: ProcessedOrder[] | null;
  analyticsData: AnalyticsData | null;
  filteredData: ProcessedOrder[] | null;
  isLoading: boolean;
  error: string | null;
  activeView: string;
  timeFilter: TimeFilter;
  fileInfo: FileInfo | null; // Add file info to state
}

const initialTimeFilter: TimeFilter = {
  start: subMonths(new Date(), 12),
  end: new Date(),
  label: "Last 12 months",
};

const navigationItems = [
  {
    id: "upload",
    icon: Upload,
    label: "Upload Data",
    description: "Import your Swiggy data",
  },
  {
    id: "overview",
    icon: BarChart3,
    label: "Overview",
    description: "General statistics",
  },
  {
    id: "spending",
    icon: TrendingUp,
    label: "Spending",
    description: "Financial insights",
  },
  {
    id: "restaurants",
    icon: Store,
    label: "Restaurants",
    description: "Restaurant analytics",
  },
  {
    id: "patterns",
    icon: Clock,
    label: "Patterns",
    description: "Ordering patterns",
  },
  {
    id: "locations",
    icon: MapPin,
    label: "Locations",
    description: "Location analysis",
  },
  {
    id: "insights",
    icon: Lightbulb,
    label: "Insights",
    description: "Smart insights",
  },
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
  processedData,
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

// --- Global Time Dial Context ---
export interface TimePreset {
  label: string;
  getValue: () => { start: Date; end: Date };
}

const getTimePresets = (): TimePreset[] => {
  const now = new Date();
  return [
    {
      label: "1M",
      getValue: () => ({ start: subMonths(now, 1), end: now }),
    },
    {
      label: "3M",
      getValue: () => ({ start: subMonths(now, 3), end: now }),
    },
    {
      label: "6M",
      getValue: () => ({ start: subMonths(now, 6), end: now }),
    },
    {
      label: "12M",
      getValue: () => ({ start: subMonths(now, 12), end: now }),
    },
    {
      label: "YTD",
      getValue: () => ({ start: startOfYear(now), end: now }),
    },
    {
      label: "Lifetime",
      getValue: () => ({ start: new Date(2020, 0, 1), end: now }), // Assuming orders start from 2020
    },
  ];
};

interface TimeDialContextType {
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
  presets: TimePreset[];
  range: { start: Date; end: Date };
}
const TimeDialContext = createContext<TimeDialContextType | undefined>(
  undefined
);

export const useTimeDial = () => {
  const ctx = useContext(TimeDialContext);
  if (!ctx) throw new Error("useTimeDial must be used within TimeDialProvider");
  return ctx;
};

export const TimeDialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const presets = getTimePresets();
  const [selectedPreset, setSelectedPreset] = useState("6M");
  const presetObj =
    presets.find((p) => p.label === selectedPreset) || presets[0];
  const range = presetObj.getValue();
  return (
    <TimeDialContext.Provider
      value={{ selectedPreset, setSelectedPreset, presets, range }}
    >
      {children}
    </TimeDialContext.Provider>
  );
};

const GlobalTimeDial: React.FC = () => {
  const { selectedPreset, setSelectedPreset, presets } = useTimeDial();
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => setSelectedPreset(preset.label)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedPreset === preset.label
              ? "bg-orange-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    rawData: null,
    processedData: null,
    analyticsData: null,
    filteredData: null,
    isLoading: false,
    error: null,
    activeView: "upload",
    timeFilter: initialTimeFilter,
    fileInfo: null,
  });

  // Load cached data on startup
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedRawData = localStorage.getItem(CACHE_KEYS.RAW_DATA);
        const cachedProcessedData = localStorage.getItem(
          CACHE_KEYS.PROCESSED_DATA
        );
        const cachedAnalyticsData = localStorage.getItem(
          CACHE_KEYS.ANALYTICS_DATA
        );
        const cachedFileInfo = localStorage.getItem(CACHE_KEYS.FILE_INFO);

        if (
          cachedRawData &&
          cachedProcessedData &&
          cachedAnalyticsData &&
          cachedFileInfo
        ) {
          const rawData: SwiggyOrder[] = JSON.parse(cachedRawData);
          const processedData: ProcessedOrder[] =
            JSON.parse(cachedProcessedData);
          const analyticsData: AnalyticsData = JSON.parse(cachedAnalyticsData);
          const fileInfo: FileInfo = JSON.parse(cachedFileInfo);

          // Restore dates in processed data
          const restoredProcessedData = processedData.map((order) => ({
            ...order,
            orderTime: new Date(order.orderTime),
          }));

          // Restore dates in analytics data
          const restoredAnalyticsData = {
            ...analyticsData,
            orders: restoredProcessedData,
            dateRange: {
              start: new Date(analyticsData.dateRange.start),
              end: new Date(analyticsData.dateRange.end),
            },
          };

          setState((prev) => ({
            ...prev,
            rawData,
            processedData: restoredProcessedData,
            analyticsData: restoredAnalyticsData,
            fileInfo,
            activeView: "overview", // Auto-navigate to overview if data exists
          }));
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
        // Clear corrupted cache
        clearCachedData();
      }
    };

    loadCachedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cache data to localStorage
  const cacheData = useCallback(
    (
      rawData: SwiggyOrder[],
      processedData: ProcessedOrder[],
      analyticsData: AnalyticsData,
      fileInfo: FileInfo
    ) => {
      try {
        localStorage.setItem(CACHE_KEYS.RAW_DATA, JSON.stringify(rawData));
        localStorage.setItem(
          CACHE_KEYS.PROCESSED_DATA,
          JSON.stringify(processedData)
        );
        localStorage.setItem(
          CACHE_KEYS.ANALYTICS_DATA,
          JSON.stringify(analyticsData)
        );
        localStorage.setItem(CACHE_KEYS.FILE_INFO, JSON.stringify(fileInfo));
      } catch (error) {
        console.error("Error caching data:", error);
        // Handle storage quota exceeded
        if (error instanceof Error && error.name === "QuotaExceededError") {
          alert(
            "Storage quota exceeded. Please clear browser data and try again."
          );
        }
      }
    },
    []
  );

  // Clear cached data
  const clearCachedData = useCallback(() => {
    try {
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      setState((prev) => ({
        ...prev,
        rawData: null,
        processedData: null,
        analyticsData: null,
        filteredData: null,
        fileInfo: null,
        activeView: "upload",
        error: null,
      }));
    } catch (error) {
      console.error("Error clearing cached data:", error);
    }
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const text = await file.text();
        const rawData: SwiggyOrder[] = JSON.parse(text);

        if (!Array.isArray(rawData)) {
          throw new Error("Invalid file format. Expected an array of orders.");
        }

        if (rawData.length === 0) {
          throw new Error("No orders found in the file.");
        }

        // Process the data
        const processedData = processOrderData(rawData);
        const analyticsData = generateAnalyticsData(processedData);

        // Create file info
        const fileInfo: FileInfo = {
          name: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          orderCount: rawData.length,
        };

        // Cache the data
        cacheData(rawData, processedData, analyticsData, fileInfo);

        setState((prev) => ({
          ...prev,
          rawData,
          processedData,
          analyticsData,
          fileInfo,
          isLoading: false,
          activeView: "overview",
        }));
      } catch (error) {
        console.error("Error processing file:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to process file",
        }));
      }
    },
    [cacheData]
  );

  const setActiveView = (view: string) => {
    setState((prev) => ({ ...prev, activeView: view }));
  };

  const renderContent = () => {
    switch (state.activeView) {
      case "upload":
        return (
          <FileUpload
            onFileUpload={handleFileUpload}
            isLoading={state.isLoading}
            error={state.error}
            fileInfo={state.fileInfo}
            onClearData={clearCachedData}
          />
        );
      case "overview":
        return <OverviewDashboard data={state.analyticsData} />;
      case "spending":
        return state.processedData && state.analyticsData ? (
          <SpendingDashboard
            data={state.processedData}
            analytics={state.analyticsData}
          />
        ) : (
          <div className="p-8 text-center">No data available</div>
        );
      case "restaurants":
        return <RestaurantsDashboard data={state.processedData} />;
      case "patterns":
        return <PatternsDashboard data={state.analyticsData} />;
      case "locations":
        return <LocationsDashboard data={state.analyticsData} />;
      case "insights":
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
      <TimeDialProvider>
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
                      ₹{state.analyticsData?.totalSpent.toLocaleString("en-IN")}{" "}
                      total
                    </Badge>
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-2 px-4">
                <ThemeToggle />
              </div>
            </header>
            {/* Global Time Dial */}
            <GlobalTimeDial />
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
      </TimeDialProvider>
    </ThemeProvider>
  );
};

// Overview Chart Component
const OverviewChart: React.FC<{
  data: ProcessedOrder[];
}> = ({ data }) => {
  const { selectedPreset, range } = useTimeDial();
  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterOrdersByDateRange(data, range.start, range.end)
      .slice()
      .sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime());
  }, [data, range]);

  // Grouping logic
  const groupBy = useMemo(() => {
    if (selectedPreset === "1M") return "day";
    if (selectedPreset === "6M") return "week";
    return "month";
  }, [selectedPreset]);

  // Group and sort data
  const groupedData = useMemo(() => {
    const map = new Map<
      string,
      { totalSpent: number; orderCount: number; date: Date }
    >();
    filteredData.forEach((order) => {
      let key = "";
      let date = order.orderTime;
      if (groupBy === "day") {
        key = date.toISOString().slice(0, 10);
      } else if (groupBy === "week") {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay()); // start of week
        key = d.toISOString().slice(0, 10);
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }
      if (!map.has(key)) {
        map.set(key, { totalSpent: 0, orderCount: 0, date: new Date(date) });
      }
      const entry = map.get(key)!;
      entry.totalSpent += order.orderTotal;
      entry.orderCount += 1;
    });
    // Sort by date descending
    return Array.from(map.entries())
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredData, groupBy]);

  // Chart.js data
  const chartData = {
    labels: groupedData.map((d) => {
      if (groupBy === "day") return d.key;
      if (groupBy === "week") return "Week of " + d.key;
      return d.key;
    }),
    datasets: [
      {
        label: "Total Spent",
        data: groupedData.map((d) => d.totalSpent),
        fill: true,
        backgroundColor: "rgba(251, 146, 60, 0.2)",
        borderColor: "rgba(251, 146, 60, 1)",
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { intersect: false },
    },
    interaction: { mode: "nearest" as const, intersect: false },
    scales: {
      x: {
        title: {
          display: true,
          text:
            groupBy === "day" ? "Day" : groupBy === "week" ? "Week" : "Month",
        },
      },
      y: { title: { display: true, text: "₹ Spent" }, beginAtZero: true },
    },
  };

  return (
    <div className="space-y-4">
      <div className="bg-dark-800 rounded-lg p-2">
        <Line data={chartData} options={chartOptions} height={220} />
      </div>
      {groupedData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data for selected time range</p>
        </div>
      )}
    </div>
  );
};

// Updated Dashboard Components with shadcn/ui
const OverviewDashboard = ({ data }: { data: AnalyticsData | null }) => {
  const { range } = useTimeDial();
  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterOrdersByDateRange(data.orders, range.start, range.end)
      .slice()
      .sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime());
  }, [data, range]);

  // Calculate discount metrics from filtered data
  const discountMetrics = useMemo(() => {
    if (!filteredData.length)
      return { totalDiscounts: 0, discountPercentage: 0 };

    const totalDiscounts = filteredData.reduce((sum, order) => {
      return sum + order.orderDiscount + order.couponDiscount;
    }, 0);

    const totalSpentForFiltered = filteredData.reduce((sum, order) => {
      return sum + order.orderTotal;
    }, 0);

    const discountPercentage =
      totalSpentForFiltered > 0
        ? (totalDiscounts / totalSpentForFiltered) * 100
        : 0;

    return { totalDiscounts, discountPercentage };
  }, [filteredData]);

  if (!data) {
    return (
      <Card className="flex flex-col items-center justify-center h-96">
        <CardContent className="text-center space-y-4 pt-6">
          <Upload className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground">
              Upload your Swiggy data to see analytics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Food Delivery Analytics
        </h1>
        <p className="text-muted-foreground">
          Your comprehensive Swiggy ordering insights
        </p>
      </div>

      {/* Order Activity Heatmap */}
      <OrderActivityHeatmap data={data.orders} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              ₹{data.totalSpent.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">Across all orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {data.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ₹{Math.round(data.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discounts
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ₹{discountMetrics.totalDiscounts.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              ({discountMetrics.discountPercentage.toFixed(1)}% of spending)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
            <Store className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {data.uniqueRestaurants}
            </div>
            <p className="text-xs text-muted-foreground">Unique venues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>
              Your food ordering trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart data={filteredData} />
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
                <span className="font-medium">
                  ₹{Math.round(data.totalSpent / 12).toLocaleString()}
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Orders per Month</span>
                <span className="font-medium">
                  {Math.round(data.totalOrders / 12)}
                </span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Spending Breakdown</CardTitle>
          <CardDescription>
            Complete breakdown of your total spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Spent</span>
                <span className="text-lg font-bold text-orange-500">
                  ₹{data.totalSpent.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Food Items</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹
                      {data.orders
                        .reduce((sum, order) => sum + order.itemTotal, 0)
                        .toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {(
                        (data.orders.reduce(
                          (sum, order) => sum + order.itemTotal,
                          0
                        ) /
                          data.totalSpent) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">Delivery Charges</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹
                      {data.orders
                        .reduce((sum, order) => sum + order.deliveryCharges, 0)
                        .toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {(
                        (data.orders.reduce(
                          (sum, order) => sum + order.deliveryCharges,
                          0
                        ) /
                          data.totalSpent) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">GST</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹
                      {data.orders
                        .reduce((sum, order) => sum + order.gst, 0)
                        .toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {(
                        (data.orders.reduce(
                          (sum, order) => sum + order.gst,
                          0
                        ) /
                          data.totalSpent) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Tips</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ₹{data.totalTips.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {((data.totalTips / data.totalSpent) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm">Discounts Received</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-emerald-500">
                      -₹{discountMetrics.totalDiscounts.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {discountMetrics.discountPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium mb-2">Fee Impact</h4>
                <div className="text-2xl font-bold text-yellow-500">
                  {((data.totalFees / data.totalSpent) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  of total spending
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg. Order Value</span>
                  <span className="font-medium">
                    ₹{Math.round(data.averageOrderValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fees per Order</span>
                  <span className="font-medium">
                    ₹{Math.round(data.totalFees / data.totalOrders)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tips per Order</span>
                  <span className="font-medium">
                    ₹{Math.round(data.totalTips / data.totalOrders)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discounts per Order</span>
                  <span className="font-medium text-emerald-500">
                    ₹
                    {Math.round(
                      discountMetrics.totalDiscounts /
                        Math.max(data.totalOrders, 1)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RestaurantsDashboard = ({ data }: { data: ProcessedOrder[] | null }) => {
  const { range } = useTimeDial();

  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterOrdersByDateRange(data, range.start, range.end);
  }, [data, range]);

  // Restaurant Analytics
  const restaurantAnalytics = useMemo(() => {
    if (!filteredData.length) return null;

    // Top restaurants by orders
    const restaurantOrderCount = new Map<string, number>();
    const restaurantSpending = new Map<string, number>();
    const restaurantDiscounts = new Map<string, number>();
    const restaurantFirstOrder = new Map<string, Date>();
    const restaurantLastOrder = new Map<string, Date>();
    const restaurantAreas = new Map<string, string>();

    filteredData.forEach((order) => {
      const name = order.restaurantName;

      // Order counts
      restaurantOrderCount.set(name, (restaurantOrderCount.get(name) || 0) + 1);

      // Spending
      restaurantSpending.set(
        name,
        (restaurantSpending.get(name) || 0) + order.orderTotal
      );

      // Discounts
      const totalDiscount = order.orderDiscount + order.couponDiscount;
      restaurantDiscounts.set(
        name,
        (restaurantDiscounts.get(name) || 0) + totalDiscount
      );

      // First and last order dates
      const currentFirst = restaurantFirstOrder.get(name);
      const currentLast = restaurantLastOrder.get(name);
      if (!currentFirst || order.orderTime < currentFirst) {
        restaurantFirstOrder.set(name, order.orderTime);
      }
      if (!currentLast || order.orderTime > currentLast) {
        restaurantLastOrder.set(name, order.orderTime);
      }

      // Areas
      restaurantAreas.set(name, order.restaurantLocality);
    });

    // Top restaurants by orders (top 3)
    const topByOrders = Array.from(restaurantOrderCount.entries())
      .map(([name, count]) => ({
        name,
        orders: count,
        spending: restaurantSpending.get(name) || 0,
        avgOrder: (restaurantSpending.get(name) || 0) / count,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3);

    // Top restaurants by spending (top 3)
    const topBySpending = Array.from(restaurantSpending.entries())
      .map(([name, spending]) => ({
        name,
        spending,
        orders: restaurantOrderCount.get(name) || 0,
        avgOrder: spending / (restaurantOrderCount.get(name) || 1),
      }))
      .sort((a, b) => b.spending - a.spending)
      .slice(0, 3);

    // Loyalty score (percentage of orders from top 5 restaurants)
    const top5Orders = Array.from(restaurantOrderCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((sum, [, count]) => sum + count, 0);
    const loyaltyScore = (top5Orders / filteredData.length) * 100;

    // New vs repeat ratio
    const uniqueRestaurants = new Set(filteredData.map((o) => o.restaurantName))
      .size;
    const totalOrders = filteredData.length;
    const newRestaurantRatio = (uniqueRestaurants / totalOrders) * 100;

    // Best discount restaurants
    const bestDiscountRestaurants = Array.from(restaurantDiscounts.entries())
      .map(([name, totalDiscount]) => ({
        name,
        totalDiscount,
        orders: restaurantOrderCount.get(name) || 0,
        avgDiscount: totalDiscount / (restaurantOrderCount.get(name) || 1),
      }))
      .filter((r) => r.totalDiscount > 0)
      .sort((a, b) => b.avgDiscount - a.avgDiscount)
      .slice(0, 5);

    // Abandoned restaurants (no orders in last 3 months from full dataset)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentOrders =
      data?.filter((order) => order.orderTime >= threeMonthsAgo) || [];
    const recentRestaurants = new Set(
      recentOrders.map((o) => o.restaurantName)
    );
    const allTimeRestaurants = new Set(
      data?.map((o) => o.restaurantName) || []
    );

    const abandonedRestaurants = Array.from(allTimeRestaurants)
      .filter((name) => !recentRestaurants.has(name))
      .map((name) => {
        const lastOrder = restaurantLastOrder.get(name);
        const totalOrders = restaurantOrderCount.get(name) || 0;
        return { name, lastOrder, totalOrders };
      })
      .slice(0, 5);

    // Hit and miss (only ordered once)
    const hitAndMiss = Array.from(restaurantOrderCount.entries())
      .filter(([, count]) => count === 1)
      .map(([name]) => ({
        name,
        area: restaurantAreas.get(name) || "Unknown",
      }))
      .slice(0, 10);

    return {
      topByOrders,
      topBySpending,
      loyaltyScore,
      newRestaurantRatio,
      bestDiscountRestaurants,
      abandonedRestaurants,
      hitAndMiss,
      uniqueRestaurants,
      totalOrders,
    };
  }, [filteredData, data]);

  // Cuisine Analytics
  const cuisineAnalytics = useMemo(() => {
    if (!filteredData.length) return null;

    // Cuisine preferences by spending
    const cuisineSpending = new Map<string, number>();
    const cuisineOrders = new Map<string, number>();
    const cuisineByTime = new Map<string, Map<number, number>>();
    const cuisineByDay = new Map<string, Map<string, number>>();
    const cuisineAreas = new Map<string, Set<string>>();

    filteredData.forEach((order) => {
      order.restaurantCuisine.forEach((cuisine) => {
        cuisineSpending.set(
          cuisine,
          (cuisineSpending.get(cuisine) || 0) + order.orderTotal
        );
        cuisineOrders.set(cuisine, (cuisineOrders.get(cuisine) || 0) + 1);

        // Time patterns
        if (!cuisineByTime.has(cuisine)) {
          cuisineByTime.set(cuisine, new Map());
        }
        const hourMap = cuisineByTime.get(cuisine)!;
        hourMap.set(order.hour, (hourMap.get(order.hour) || 0) + 1);

        // Day patterns
        if (!cuisineByDay.has(cuisine)) {
          cuisineByDay.set(cuisine, new Map());
        }
        const dayMap = cuisineByDay.get(cuisine)!;
        const isWeekend =
          order.dayOfWeek === "Saturday" || order.dayOfWeek === "Sunday";
        const dayType = isWeekend ? "Weekend" : "Weekday";
        dayMap.set(dayType, (dayMap.get(dayType) || 0) + 1);

        // Geographic spread
        if (!cuisineAreas.has(cuisine)) {
          cuisineAreas.set(cuisine, new Set());
        }
        cuisineAreas.get(cuisine)!.add(order.restaurantLocality);
      });
    });

    // Top cuisines by preference
    const topCuisines = Array.from(cuisineSpending.entries())
      .map(([cuisine, spending]) => ({
        cuisine,
        spending,
        orders: cuisineOrders.get(cuisine) || 0,
        avgOrder: spending / (cuisineOrders.get(cuisine) || 1),
        areas: cuisineAreas.get(cuisine)?.size || 0,
      }))
      .sort((a, b) => b.spending - a.spending)
      .slice(0, 8);

    // Comfort food analysis (most ordered cuisine)
    const comfortFood = Array.from(cuisineOrders.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Weekend vs weekday preferences
    const weekendVsWeekday = Array.from(cuisineByDay.entries())
      .map(([cuisine, dayMap]) => {
        const weekend = dayMap.get("Weekend") || 0;
        const weekday = dayMap.get("Weekday") || 0;
        const total = weekend + weekday;
        return {
          cuisine,
          weekendRatio: total > 0 ? (weekend / total) * 100 : 0,
          total,
        };
      })
      .filter((c) => c.total >= 3)
      .sort((a, b) => b.weekendRatio - a.weekendRatio)
      .slice(0, 5);

    // Time preferences
    const timePreferences = Array.from(cuisineByTime.entries())
      .map(([cuisine, hourMap]) => {
        const hours = Array.from(hourMap.entries());
        const mostActiveHour = hours.sort((a, b) => b[1] - a[1])[0];
        return {
          cuisine,
          peakHour: mostActiveHour ? mostActiveHour[0] : 0,
          peakOrders: mostActiveHour ? mostActiveHour[1] : 0,
        };
      })
      .filter((c) => c.peakOrders >= 2)
      .slice(0, 6);

    // Geographic spread
    const geoSpread = Array.from(cuisineAreas.entries())
      .map(([cuisine, areas]) => ({
        cuisine,
        areaCount: areas.size,
        areas: Array.from(areas),
      }))
      .sort((a, b) => b.areaCount - a.areaCount)
      .slice(0, 5);

    return {
      topCuisines,
      comfortFood: comfortFood
        ? { name: comfortFood[0], orders: comfortFood[1] }
        : null,
      weekendVsWeekday,
      timePreferences,
      geoSpread,
    };
  }, [filteredData]);

  if (!data) {
    return (
      <Card className="flex flex-col items-center justify-center h-96">
        <CardContent className="text-center space-y-4 pt-6">
          <Upload className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground">
              Upload your Swiggy data to see restaurant insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!restaurantAnalytics || !cuisineAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Restaurant Analysis
          </h1>
          <p className="text-muted-foreground">
            No data available for selected time period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Restaurant Analysis
        </h1>
        <p className="text-muted-foreground">
          Discover your favorite restaurants and cuisine preferences
        </p>
      </div>

      {/* Restaurant Performance Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Restaurant Performance</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Loyalty Score */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Loyalty Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {restaurantAnalytics.loyaltyScore.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Orders from top 5 restaurants
              </p>
            </CardContent>
          </Card>

          {/* Exploration Rate */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Exploration Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {restaurantAnalytics.newRestaurantRatio.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                New restaurants per order
              </p>
            </CardContent>
          </Card>

          {/* Unique Restaurants */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Restaurants Tried
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {restaurantAnalytics.uniqueRestaurants}
              </div>
              <p className="text-xs text-muted-foreground">Different venues</p>
            </CardContent>
          </Card>

          {/* Hit & Miss Count */}
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                One-Time Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {restaurantAnalytics.hitAndMiss.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Restaurants tried once
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Restaurants Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top by Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Top Restaurants by Orders</CardTitle>
              <CardDescription>Most frequently ordered from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {restaurantAnalytics.topByOrders.map((restaurant, index) => (
                <div
                  key={restaurant.name}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-300 text-black"
                          : "bg-orange-400 text-black"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{Math.round(restaurant.avgOrder)} avg order
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{restaurant.orders} orders</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{restaurant.spending.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top by Spending */}
          <Card>
            <CardHeader>
              <CardTitle>Top Restaurants by Spending</CardTitle>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {restaurantAnalytics.topBySpending.map((restaurant, index) => (
                <div
                  key={restaurant.name}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-300 text-black"
                          : "bg-orange-400 text-black"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₹{restaurant.spending.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Math.round(restaurant.avgOrder)} avg
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cuisine Analysis Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cuisine Analysis</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Cuisine Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Preferences</CardTitle>
              <CardDescription>By spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {cuisineAnalytics.topCuisines
                .slice(0, 5)
                .map((cuisine, index) => (
                  <div
                    key={cuisine.cuisine}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">
                      {cuisine.cuisine}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold">
                        ₹{cuisine.spending.toLocaleString("en-IN")}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {cuisine.orders} orders
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Comfort Food */}
          <Card>
            <CardHeader>
              <CardTitle>Your Comfort Food</CardTitle>
              <CardDescription>Most ordered cuisine</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {cuisineAnalytics.comfortFood && (
                <>
                  <div className="text-3xl">🍽️</div>
                  <div>
                    <p className="text-lg font-bold">
                      {cuisineAnalytics.comfortFood.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cuisineAnalytics.comfortFood.orders} orders
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Weekend vs Weekday */}
          <Card>
            <CardHeader>
              <CardTitle>Weekend Preferences</CardTitle>
              <CardDescription>Cuisines you love on weekends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {cuisineAnalytics.weekendVsWeekday.slice(0, 3).map((pref) => (
                <div
                  key={pref.cuisine}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium">{pref.cuisine}</span>
                  <span className="text-sm font-bold">
                    {pref.weekendRatio.toFixed(0)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Time Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Time Patterns</CardTitle>
              <CardDescription>When you crave what</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cuisineAnalytics.timePreferences.map((pref) => (
                <div
                  key={pref.cuisine}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <span className="text-sm font-medium">{pref.cuisine}</span>
                  <span className="text-sm">
                    {pref.peakHour}:00 ({pref.peakOrders} orders)
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Best Discount Restaurants */}
          <Card>
            <CardHeader>
              <CardTitle>Best Discount Restaurants</CardTitle>
              <CardDescription>Where you save the most</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {restaurantAnalytics.bestDiscountRestaurants
                .slice(0, 4)
                .map((restaurant) => (
                  <div
                    key={restaurant.name}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{restaurant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant.orders} orders
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-500">
                      ₹{Math.round(restaurant.avgDiscount)}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Problem Areas */}
      {(restaurantAnalytics.abandonedRestaurants.length > 0 ||
        restaurantAnalytics.hitAndMiss.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Insights & Patterns</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Abandoned Restaurants */}
            {restaurantAnalytics.abandonedRestaurants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Forgotten Favorites</CardTitle>
                  <CardDescription>
                    Restaurants you haven't ordered from recently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {restaurantAnalytics.abandonedRestaurants
                    .slice(0, 5)
                    .map((restaurant) => (
                      <div
                        key={restaurant.name}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {restaurant.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {restaurant.totalOrders} orders total
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {restaurant.lastOrder?.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Hit and Miss */}
            {restaurantAnalytics.hitAndMiss.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>One-Time Experiments</CardTitle>
                  <CardDescription>
                    Restaurants you tried only once
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {restaurantAnalytics.hitAndMiss
                    .slice(0, 5)
                    .map((restaurant) => (
                      <div
                        key={restaurant.name}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <p className="text-sm font-medium">{restaurant.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {restaurant.area}
                        </span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
          <p className="text-muted-foreground">
            Pattern analysis features are being built
          </p>
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
          <p className="text-muted-foreground">
            Location analytics are being developed
          </p>
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
          <p className="text-muted-foreground">
            AI-powered insights are being developed
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Order Activity Heatmap Component (GitHub-style)
const OrderActivityHeatmap: React.FC<{ data: ProcessedOrder[] }> = ({
  data,
}) => {
  // Generate last 365 days regardless of global time dial
  const heatmapData = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364); // 365 days including today

    // Create array of all days in the last 365 days
    const days: Array<{ date: Date; orders: number; dayOfWeek: number }> = [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d),
        orders: 0,
        dayOfWeek: d.getDay(),
      });
    }

    // Count orders per day
    const orderCountByDate = new Map<string, number>();
    data.forEach((order) => {
      const dateStr = order.orderTime.toDateString();
      orderCountByDate.set(dateStr, (orderCountByDate.get(dateStr) || 0) + 1);
    });

    // Apply order counts to days
    days.forEach((day) => {
      const dateStr = day.date.toDateString();
      day.orders = orderCountByDate.get(dateStr) || 0;
    });

    return days;
  }, [data]);

  // Get color intensity based on order count
  const getColorIntensity = (orderCount: number): string => {
    if (orderCount === 0) return "bg-gray-100 dark:bg-gray-800";
    if (orderCount === 1) return "bg-orange-200 dark:bg-orange-900/60";
    if (orderCount === 2) return "bg-orange-300 dark:bg-orange-800/70";
    if (orderCount === 3) return "bg-orange-400 dark:bg-orange-700/80";
    if (orderCount >= 4) return "bg-orange-500 dark:bg-orange-600";
    return "bg-gray-100 dark:bg-gray-800";
  };

  // Group days by weeks
  const weeks = useMemo(() => {
    const weeksArray: Array<
      Array<{ date: Date; orders: number; dayOfWeek: number }>
    > = [];
    let currentWeek: Array<{ date: Date; orders: number; dayOfWeek: number }> =
      [];

    heatmapData.forEach((day, index) => {
      // Start a new week on Sunday (dayOfWeek === 0)
      if (day.dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArray.push([...currentWeek]);
        currentWeek = [];
      }
      currentWeek.push(day);

      // Push the last week
      if (index === heatmapData.length - 1) {
        weeksArray.push(currentWeek);
      }
    });

    return weeksArray;
  }, [heatmapData]);

  const totalOrders = heatmapData.reduce((sum, day) => sum + day.orders, 0);
  const activeDays = heatmapData.filter((day) => day.orders > 0).length;
  const maxOrdersInDay = Math.max(...heatmapData.map((day) => day.orders));

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Order Activity</CardTitle>
            <CardDescription>
              {totalOrders} orders in the last year • {activeDays} active days
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Max: {maxOrdersInDay} orders/day</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs">Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-black dark:border-gray-400"></div>
                <div className="w-3 h-3 rounded-sm bg-orange-200 dark:bg-orange-900/60 border border-black dark:border-gray-400"></div>
                <div className="w-3 h-3 rounded-sm bg-orange-300 dark:bg-orange-800/70 border border-black dark:border-gray-400"></div>
                <div className="w-3 h-3 rounded-sm bg-orange-400 dark:bg-orange-700/80 border border-black dark:border-gray-400"></div>
                <div className="w-3 h-3 rounded-sm bg-orange-500 dark:bg-orange-600 border border-black dark:border-gray-400"></div>
              </div>
              <span className="text-xs">More</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col text-xs text-muted-foreground mr-2 pt-4">
            <div className="h-3 mb-1"></div>
            <div className="h-3 mb-1">Mon</div>
            <div className="h-3 mb-1"></div>
            <div className="h-3 mb-1">Wed</div>
            <div className="h-3 mb-1"></div>
            <div className="h-3 mb-1">Fri</div>
            <div className="h-3 mb-1"></div>
          </div>

          {/* Heatmap grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="inline-flex flex-col space-y-1">
              {/* Month labels */}
              <div className="flex text-xs text-muted-foreground mb-2">
                {Array.from({ length: Math.ceil(weeks.length / 4) }, (_, i) => {
                  const weekIndex = i * 4;
                  if (weekIndex < weeks.length && weeks[weekIndex].length > 0) {
                    const month = weeks[weekIndex][0].date.toLocaleDateString(
                      "en-US",
                      { month: "short" }
                    );
                    return (
                      <div key={i} className="w-16 text-center">
                        {month}
                      </div>
                    );
                  }
                  return <div key={i} className="w-16"></div>;
                })}
              </div>

              {/* Days grid */}
              <div className="flex space-x-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col space-y-1">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = week.find((d) => d.dayOfWeek === dayIndex);
                      return (
                        <div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm border border-black dark:border-gray-400 ${
                            day
                              ? getColorIntensity(day.orders)
                              : "bg-transparent"
                          }`}
                          title={
                            day
                              ? `${day.date.toLocaleDateString()}: ${
                                  day.orders
                                } order${day.orders !== 1 ? "s" : ""}`
                              : ""
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default App;
