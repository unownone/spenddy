import React from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import { useSourceData } from "../../contexts/SourceDataContext";
import ImportTab from "./ImportTab";
import { TimeDialProvider } from "../../App";
import { cn } from "../../lib/utils";

const navLinkClasses = (isActive: boolean) =>
  cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors",
    isActive
      ? "bg-background text-foreground shadow"
      : "text-muted-foreground hover:bg-background/50"
  );

const SourceLayout: React.FC = () => {
  const { source: sourceId } = useParams<{ source: string }>();
  const { sources, dataMap } = useSourceData();
  const sourceDef = sourceId ? sources[sourceId] : undefined;
  const dataset = sourceId ? dataMap[sourceId] : undefined;

  if (!sourceDef) return <div className="p-8">Unknown source.</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 flex items-center gap-4">
        <NavLink to="/" className="text-sm text-muted-foreground">← Back</NavLink>
        <h1 className="text-2xl font-bold">{sourceDef.name}</h1>
      </header>
      <nav className="border-b p-2 flex flex-wrap gap-2 bg-muted/20">
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
      </nav>
      <main className="flex-1 overflow-auto">
        <TimeDialProvider>
          <Outlet context={{ sourceDef, dataset }} />
        </TimeDialProvider>
      </main>
    </div>
  );
};

export default SourceLayout; 