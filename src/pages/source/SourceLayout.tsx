import React from "react";
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
  const { sources, dataMap } = useSourceData();
  const sourceDef = sourceId ? sources[sourceId] : undefined;
  const dataset = sourceId ? dataMap[sourceId] : undefined;

  if (!sourceDef) return <div className="p-8">Unknown source.</div>;

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