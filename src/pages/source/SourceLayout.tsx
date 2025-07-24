import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import { useSourceData } from "../../contexts/SourceDataContext";
import ImportTab from "./ImportTab";
import { TimeDialProvider, GlobalTimeDial } from "../../App";
import { cn } from "../../lib/utils";

// Inspired by shadcn/ui TabsTrigger styling
const navLinkClasses = (isActive: boolean) =>
  cn(
    "shrink-0 rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isActive
      ? "bg-primary text-primary-foreground shadow"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  );

const SourceLayout: React.FC = () => {
  const { source: sourceId } = useParams<{ source: string }>();
  const { sources, dataMap, loadSourceData, isDataLoaded, unloadSourceData } =
    useSourceData();
  const [isLoading, setIsLoading] = useState(false);
  const sourceDef = sourceId ? sources[sourceId] : undefined;
  const dataset = sourceId ? dataMap[sourceId] : undefined;

  // Load data when component mounts if not already loaded
  useEffect(() => {
    if (sourceId && !isDataLoaded(sourceId)) {
      setIsLoading(true);
      loadSourceData(sourceId).finally(() => setIsLoading(false));
    }
  }, [sourceId, loadSourceData, isDataLoaded]);

  // Cleanup effect - unload data when navigating away (with delay to avoid quick navigation issues)
  useEffect(() => {
    // Only unload if we have a sourceId and it's loaded
    if (sourceId && isDataLoaded(sourceId)) {
      // Delay unloading to avoid issues with quick navigation
      const timeoutId = setTimeout(() => {
        // Check if we're still not on this source (double-check to be safe)
        if (!window.location.pathname.includes(`/${sourceId}`)) {
          console.log(`Unloading data for ${sourceId} after navigation`);
          unloadSourceData(sourceId);
        }
      }, 30000); // 30 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [sourceId, isDataLoaded, unloadSourceData]);

  if (!sourceDef) return <div className="p-8">Unknown source.</div>;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <NavLink to="/" className="text-sm text-muted-foreground">
            ← Back
          </NavLink>
          <h1 className="text-2xl font-bold">{sourceDef.name}</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <NavLink to="/" className="text-sm text-muted-foreground">
          ← Back
        </NavLink>
        <h1 className="text-2xl font-bold">{sourceDef.name}</h1>
      </header>
      {/* Horizontally scrollable tab bar */}
      <nav className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-inner">
        <div className="max-w-screen-lg mx-auto flex overflow-x-auto no-scrollbar gap-1 h-10 items-center px-4">
          <NavLink
            to=""
            end
            className={({ isActive }) => navLinkClasses(isActive)}
          >
            Import
          </NavLink>
          {dataset && (
            <>
              <NavLink
                to="overview"
                className={({ isActive }) => navLinkClasses(isActive)}
              >
                Overview
              </NavLink>
              <NavLink
                to="spending"
                className={({ isActive }) => navLinkClasses(isActive)}
              >
                Spending
              </NavLink>
              {/* Swiggy food delivery nav items */}
              {sourceDef.id === "swiggy" && (
                <>
                  <NavLink
                    to="restaurants"
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    Restaurants
                  </NavLink>
                  <NavLink
                    to="locations"
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    Locations
                  </NavLink>
                </>
              )}

              {/* Instamart nav item */}
              {sourceDef.id === "swiggy-instamart" && (
                <NavLink
                  to="items"
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  Items
                </NavLink>
              )}

              {/* Dineout nav items */}
              {sourceDef.id === "swiggy-dineout" && (
                <>
                  <NavLink
                    to="restaurants"
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    Restaurants
                  </NavLink>
                  <NavLink
                    to="reservation-timeline"
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    Timeline
                  </NavLink>
                  <NavLink
                    to="group-size"
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    Group Size
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>
      </nav>
      <TimeDialProvider>
        {/* Global date range picker */}
        <GlobalTimeDial />
        <main className="flex-1 overflow-auto">
          <Outlet context={{ sourceDef, dataset }} />
        </main>
      </TimeDialProvider>
    </div>
  );
};

export default SourceLayout;
