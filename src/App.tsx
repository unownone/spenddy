import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
  Suspense,
  lazy,
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
  Award,
} from "lucide-react";

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
import {
  toCommonOrderRecord,
  generateAnalyticsDataset,
} from "./utils/dataProcessor";
import { OrderRecord, AnalyticsDataset } from "./types/CommonData";
import { subMonths, startOfYear, startOfMonth } from "date-fns";

// Lazy load dashboard components for code splitting
const OverviewDashboard = lazy(
  () => import("./components/dashboards/OverviewDashboard")
);
const SpendingDashboard = lazy(
  () => import("./components/dashboards/SpendingDashboard")
);
const RestaurantsDashboard = lazy(
  () => import("./components/dashboards/RestaurantsDashboard")
);
const LocationsDashboard = lazy(
  () => import("./components/dashboards/LocationsDashboard")
);
const InsightsDashboard = lazy(
  () => import("./components/dashboards/InsightsDashboard")
);

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
// Upload view removed – data now comes exclusively from the browser extension
import Footer from "./components/Footer";

// Add cache key constants
const CACHE_KEYS = {
  RAW_DATA: "swiggy_raw_data",
  PROCESSED_DATA: "swiggy_processed_data",
  ANALYTICS_DATA: "swiggy_analytics_data",
  FILE_INFO: "swiggy_file_info",
  LATEST_ORDER_DATE: "swiggy_latest_order_date",
};

interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
  orderCount: number;
  source?: "plugin" | "upload";
  latestOrderDate?: string;
}

interface AppState {
  rawData: SwiggyOrder[] | null;
  processedData: ProcessedOrder[] | null;
  analyticsData: AnalyticsData | null;
  filteredData: ProcessedOrder[] | null;
  commonOrders: OrderRecord[] | null;
  commonAnalytics: AnalyticsDataset | null;
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

// App Sidebar Component
function AppSidebar({
  activeView,
  setActiveView,
  processedData,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
  processedData: OrderRecord[] | null;
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <TrendingUp className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Spenddy</span>
          <span className="truncate text-xs">Food Analytics</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={activeView === item.id}
                  onClick={() => setActiveView(item.id)}
                >
                  <button className="flex items-center gap-2 w-full">
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {processedData && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {processedData.length} orders loaded
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export interface TimePreset {
  label: string;
  getValue: () => { start: Date; end: Date };
}

const getTimePresets = (): TimePreset[] => {
  const now = new Date();
  return [
    {
      label: "1M",
      getValue: () => ({
        start: subMonths(now, 1),
        end: now,
      }),
    },
    {
      label: "3M",
      getValue: () => ({
        start: subMonths(now, 3),
        end: now,
      }),
    },
    {
      label: "6M",
      getValue: () => ({
        start: subMonths(now, 6),
        end: now,
      }),
    },
    {
      label: "12M",
      getValue: () => ({
        start: subMonths(now, 12),
        end: now,
      }),
    },
    {
      label: "YTD",
      getValue: () => ({
        start: startOfYear(now),
        end: now,
      }),
    },
    {
      label: "All",
      getValue: () => ({
        start: new Date(0),
        end: now,
      }),
    },
    {
      label: "Custom",
      getValue: () => ({
        start: subMonths(now, 1),
        end: now,
      }),
    },
  ];
};

interface TimeDialContextType {
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
  presets: TimePreset[];
  range: { start: Date; end: Date };
  setCustomRange: (start: Date, end: Date) => void;
}

const TimeDialContext = createContext<TimeDialContextType | undefined>(
  undefined
);

export const useTimeDial = () => {
  const context = useContext(TimeDialContext);
  if (!context)
    throw new Error("useTimeDial must be used within TimeDialProvider");
  return context;
};

export const TimeDialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("3M");
  const [customRange, setCustomRangeState] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const presets = getTimePresets();

  const range = useMemo(() => {
    if (selectedPreset === "Custom" && customRange) {
      return customRange;
    }
    const preset = presets.find((p) => p.label === selectedPreset);
    return preset ? preset.getValue() : presets[1].getValue(); // default to 3M
  }, [selectedPreset, presets, customRange]);

  const setCustomRange = (start: Date, end: Date) => {
    setCustomRangeState({ start, end });
    setSelectedPreset("Custom");
  };

  return (
    <TimeDialContext.Provider
      value={{
        selectedPreset,
        setSelectedPreset,
        presets,
        range,
        setCustomRange,
      }}
    >
      {children}
    </TimeDialContext.Provider>
  );
};

export const GlobalTimeDial: React.FC = () => {
  const { selectedPreset, setSelectedPreset, presets, range, setCustomRange } =
    useTimeDial();

  const [startInput, setStartInput] = useState<string>(() =>
    range.start.toISOString().slice(0, 10)
  );
  const [endInput, setEndInput] = useState<string>(() =>
    range.end.toISOString().slice(0, 10)
  );

  useEffect(() => {
    // sync inputs when preset changes
    if (selectedPreset !== "Custom") {
      setStartInput(range.start.toISOString().slice(0, 10));
      setEndInput(range.end.toISOString().slice(0, 10));
    }
  }, [selectedPreset, range]);

  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          range.start.getFullYear() !== range.end.getFullYear()
            ? "numeric"
            : undefined,
      });
    };

    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted/30 border-b">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Time Range:
        </span>
        <span className="text-sm text-foreground">{formatDateRange()}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1 bg-muted rounded-lg p-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={selectedPreset === preset.label ? "default" : "ghost"}
            size="sm"
            className={`h-8 px-3 text-xs font-medium transition-all ${
              selectedPreset === preset.label
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
            onClick={() => setSelectedPreset(preset.label)}
          >
            {preset.label}
          </Button>
        ))}

        {selectedPreset === "Custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              aria-label="Start date"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              aria-label="End date"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs"
            />
            <Button
              size="sm"
              variant="secondary"
              className="px-2"
              onClick={() => {
                const start = new Date(startInput);
                const end = new Date(endInput);
                if (start <= end) {
                  setCustomRange(start, end);
                }
              }}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    rawData: null,
    processedData: null,
    analyticsData: null,
    filteredData: null,
    commonOrders: null,
    commonAnalytics: null,
    isLoading: false,
    error: null,
    activeView: "overview",
    timeFilter: initialTimeFilter,
    fileInfo: null,
  });

  // Load cached data on component mount
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
          const processedData: ProcessedOrder[] = JSON.parse(
            cachedProcessedData,
            (key, value) => {
              if (key === "orderTime") {
                return new Date(value);
              }
              return value;
            }
          );
          const analyticsData: AnalyticsData = JSON.parse(
            cachedAnalyticsData,
            (key, value) => {
              if (key === "orderTime") {
                return new Date(value);
              }
              return value;
            }
          );
          const fileInfo: FileInfo = JSON.parse(cachedFileInfo);

          const orderRecords = toCommonOrderRecord(processedData);
          const commonAnalytics = generateAnalyticsDataset(orderRecords);

          setState((prev) => ({
            ...prev,
            rawData,
            processedData,
            analyticsData,
            filteredData: processedData,
            commonOrders: orderRecords,
            commonAnalytics,
            fileInfo,
            activeView: "overview", // Switch to overview if data exists
          }));

          console.log("Loaded cached data successfully");
        }
        // NEW: If only raw data exists (e.g. provided by the Chrome extension), re-process it automatically
        else if (cachedRawData && !cachedProcessedData) {
          try {
            const rawOrders: SwiggyOrder[] = JSON.parse(cachedRawData);
            if (Array.isArray(rawOrders) && rawOrders.length > 0) {
              const processedData = processOrderData(rawOrders);
              const analyticsData = generateAnalyticsData(processedData);
              const orderRecords = toCommonOrderRecord(processedData);
              const commonAnalytics = generateAnalyticsDataset(orderRecords);
              const latestOrderDateISO =
                analyticsData.dateRange.end.toISOString();

              const fileInfo: FileInfo = {
                name: "Plugin Data",
                size: cachedRawData.length,
                uploadDate: new Date().toISOString(),
                orderCount: rawOrders.length,
                source: "plugin",
                latestOrderDate: latestOrderDateISO,
              };

              // Cache the newly generated data so subsequent reloads are fast
              localStorage.setItem(
                CACHE_KEYS.PROCESSED_DATA,
                JSON.stringify(processedData)
              );
              localStorage.setItem(
                CACHE_KEYS.ANALYTICS_DATA,
                JSON.stringify(analyticsData)
              );
              localStorage.setItem(
                CACHE_KEYS.FILE_INFO,
                JSON.stringify(fileInfo)
              );
              localStorage.setItem(
                CACHE_KEYS.LATEST_ORDER_DATE,
                latestOrderDateISO
              );

              setState((prev) => ({
                ...prev,
                rawData: rawOrders,
                processedData,
                analyticsData,
                filteredData: processedData,
                commonOrders: orderRecords,
                commonAnalytics,
                fileInfo,
                activeView: "overview",
              }));
            }
          } catch (err) {
            console.error(
              "Failed to process cached raw data from extension",
              err
            );
            // If parsing fails, clear invalid raw data so user can upload again
            localStorage.removeItem(CACHE_KEYS.RAW_DATA);
          }
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
        // Clear corrupted cache
        localStorage.removeItem(CACHE_KEYS.RAW_DATA);
        localStorage.removeItem(CACHE_KEYS.PROCESSED_DATA);
        localStorage.removeItem(CACHE_KEYS.ANALYTICS_DATA);
        localStorage.removeItem(CACHE_KEYS.FILE_INFO);
      }
    };

    loadCachedData();
  }, []);

  // Save data to cache whenever it changes
  useEffect(() => {
    if (state.rawData && state.processedData && state.analyticsData) {
      try {
        localStorage.setItem(
          CACHE_KEYS.RAW_DATA,
          JSON.stringify(state.rawData)
        );
        localStorage.setItem(
          CACHE_KEYS.PROCESSED_DATA,
          JSON.stringify(state.processedData)
        );
        localStorage.setItem(
          CACHE_KEYS.ANALYTICS_DATA,
          JSON.stringify(state.analyticsData)
        );
        if (state.fileInfo) {
          localStorage.setItem(
            CACHE_KEYS.FILE_INFO,
            JSON.stringify(state.fileInfo)
          );
        }
        // NEW: persist latest order date whenever analytics data is cached
        if (state.analyticsData?.dateRange?.end) {
          localStorage.setItem(
            CACHE_KEYS.LATEST_ORDER_DATE,
            state.analyticsData.dateRange.end.toISOString()
          );
        }
        console.log("Data cached successfully");
      } catch (error) {
        console.error("Error caching data:", error);
      }
    }
  }, [state.rawData, state.processedData, state.analyticsData, state.fileInfo]);

  const handleFileUpload = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const text = await file.text();
      let orders: SwiggyOrder[];

      try {
        orders = JSON.parse(text);
      } catch (parseError) {
        throw new Error(
          "Invalid JSON format. Please upload a valid Swiggy data file."
        );
      }

      if (!Array.isArray(orders)) {
        throw new Error(
          "Data should be an array of orders. Please check your file format."
        );
      }

      if (orders.length === 0) {
        throw new Error("No orders found in the uploaded file.");
      }

      // Validate the structure of the first order
      const firstOrder = orders[0];
      const requiredFields = [
        "order_id",
        "order_total",
        "restaurant_name",
        "order_time",
        "delivery_address",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in firstOrder)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields: ${missingFields.join(
            ", "
          )}. Please check your Swiggy data format.`
        );
      }

      const processedData = processOrderData(orders);
      const analyticsData = generateAnalyticsData(processedData);
      const orderRecords = toCommonOrderRecord(processedData);
      const commonAnalytics = generateAnalyticsDataset(orderRecords);

      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        orderCount: orders.length,
        source: "upload",
        latestOrderDate: analyticsData.dateRange.end.toISOString(),
      };

      setState((prev) => ({
        ...prev,
        rawData: orders,
        processedData,
        analyticsData,
        commonOrders: orderRecords,
        commonAnalytics,
        filteredData: processedData,
        isLoading: false,
        error: null,
        fileInfo,
        activeView: "overview", // Switch to overview after successful upload
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }, []);

  const clearCachedData = useCallback(() => {
    localStorage.removeItem(CACHE_KEYS.RAW_DATA);
    localStorage.removeItem(CACHE_KEYS.PROCESSED_DATA);
    localStorage.removeItem(CACHE_KEYS.ANALYTICS_DATA);
    localStorage.removeItem(CACHE_KEYS.FILE_INFO);

    setState({
      rawData: null,
      processedData: null,
      analyticsData: null,
      filteredData: null,
      commonOrders: null,
      commonAnalytics: null,
      isLoading: false,
      error: null,
      activeView: "overview",
      timeFilter: initialTimeFilter,
      fileInfo: null,
    });

    console.log("Cached data cleared");
  }, []);

  const setActiveView = (view: string) => {
    setState((prev) => ({ ...prev, activeView: view }));
  };

  const renderContent = () => {
    switch (state.activeView) {
      // Upload view removed – data now comes exclusively from the browser extension
      case "overview":
        return (
          <Suspense
            fallback={<div className="p-8 text-center">Loading...</div>}
          >
            <OverviewDashboard data={state.commonAnalytics} />
          </Suspense>
        );
      case "spending":
        return state.commonOrders && state.commonAnalytics ? (
          <Suspense
            fallback={<div className="p-8 text-center">Loading...</div>}
          >
            <SpendingDashboard
              data={state.commonOrders}
              analytics={state.commonAnalytics}
            />
          </Suspense>
        ) : (
          <div className="p-8 text-center">No data available</div>
        );
      case "restaurants":
        return (
          <Suspense
            fallback={<div className="p-8 text-center">Loading...</div>}
          >
            <RestaurantsDashboard data={state.commonOrders || []} />
          </Suspense>
        );
      case "locations":
        return (
          <Suspense
            fallback={<div className="p-8 text-center">Loading...</div>}
          >
            <LocationsDashboard data={state.commonAnalytics} />
          </Suspense>
        );
      case "insights":
        return (
          <Suspense
            fallback={<div className="p-8 text-center">Loading...</div>}
          >
            <InsightsDashboard data={state.commonAnalytics} />
          </Suspense>
        );
      default:
        return <div className="p-8 text-center">View not found</div>;
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TimeDialProvider>
        <SidebarProvider>
          <AppSidebar
            activeView={state.activeView}
            setActiveView={setActiveView}
            processedData={state.commonOrders}
          />
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {state.commonOrders && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="hidden sm:flex">
                      {state.commonOrders.length.toLocaleString()} orders
                    </Badge>
                    <Badge variant="outline" className="hidden md:flex">
                      ₹
                      {state.commonAnalytics?.totalSpent.toLocaleString(
                        "en-IN"
                      )}{" "}
                      total
                    </Badge>
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-2 px-4">
                {/* Theme toggle removed - dark mode only */}
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
        {/* Global footer */}
        <Footer />
      </TimeDialProvider>
    </ThemeProvider>
  );
};

export default App;
