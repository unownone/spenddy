# Contributing to **Spenddy**

Welcome! 🎉  We’re thrilled you’re interested in improving Spenddy. This document explains how the codebase is structured, the conventions we follow, and **exactly** what you need to do to:

1. Integrate a **new data source** (e.g. Zomato, Dunzo)
2. Create or update **visualisation tabs / dashboards**
3. Submit high-quality pull-requests that sail through review ✈️

---

## 1. Quick Start

```bash
# 1️⃣ Clone and set-up dependencies (pnpm is preferred)
pnpm install

# 2️⃣ Run the dev server
pnpm dev

# 3️⃣ Lint & type-check on save (VSCode recommended)
```

Spenddy is a **pure-frontend** React + TypeScript project; there is no backend service to spin up.

---

## 2. Project Architecture

```text
spenddy/
├── src/
│   ├── types/             # Shared TypeScript interfaces
│   │   ├── CommonData.ts  # ✨ Source-agnostic order schema
│   │   └── SwiggyData.ts  # Swiggy-specific raw + processed types
│   ├── utils/
│   │   └── dataProcessor.ts   # Data parsing / transformation helpers
│   ├── components/
│   │   ├── dashboards/        # Each analytics tab lives here
│   │   └── ui/                # Reusable primitives (Button, Card…)
│   └── App.tsx            # State management & routing
└── CONTRIBUTION.md (this file)
```

### 2.1 Data Flow  🚚 ➜ 📊

```
Raw platform data  →  Import/Transform  →  CommonData.OrderRecord[]  →  AnalyticsDataset  →  Dashboards
```

1. **Import**: Raw JSON obtained from the browser extension (or future APIs)
2. **Transform**: Convert to `OrderRecord` via a dedicated adapter
3. **Aggregate**: Produce an `AnalyticsDataset` summarising totals, ranges, etc.
4. **Visualise**: Dashboard components consume the aggregated dataset through React props / context.

---

## 3. Adding a New **Data Source**

All platforms must funnel into the **common schema** defined in `src/types/CommonData.ts`.

### 3.1 Checklist ✅

1. **Create a parser** in `src/utils/adapters/<platform>Adapter.ts`
   ```ts
   // Example: zomatoAdapter.ts
   import { RawZomatoOrder } from "../types/ZomatoData";
   import { OrderRecord } from "../types/CommonData";
   import { parseISO, getYear, getMonth, format, getHours } from "date-fns";

   export const fromZomato = (input: RawZomatoOrder[]): OrderRecord[] => {
     return input.map((z) => ({
       orderId: z.id,
       source: "zomato",
       orderTime: parseISO(z.created_at),
       orderTotal: z.total_amount,
       netTotal: z.net_amount,
       totalFees: z.delivery_fee + z.tax,
       tipAmount: z.tip ?? 0,
       paymentMethod: z.payment_mode,
       restaurantName: z.restaurant.name,
       restaurantCuisine: z.restaurant.cuisines,
       restaurantCityName: z.delivery_address.city,
       restaurantLocality: z.delivery_address.locality,
       restaurantLat: z.restaurant.lat,
       restaurantLng: z.restaurant.lng,
       deliveryLat: z.delivery_address.lat,
       deliveryLng: z.delivery_address.lng,
       year: getYear(parseISO(z.created_at)),
       month: getMonth(parseISO(z.created_at)) + 1,
       monthYear: format(parseISO(z.created_at), "yyyy-MM"),
       dayOfWeek: format(parseISO(z.created_at), "EEEE"),
       hour: getHours(parseISO(z.created_at)),
     }));
   };
   ```
2. **Unit-test** the adapter (Jest / Vitest). Place tests in `src/utils/__tests__/`.
3. **Wire-up** the import in `App.tsx` (or future dedicated import manager):
   ```ts
   import { fromZomato } from "./utils/adapters/zomatoAdapter";
   const orderRecords = fromZomato(rawZomatoData);
   ```
4. **Aggregate**:
   ```ts
   const analytics = generateAnalyticsDataset(orderRecords);
   ```
5. **Persist** to `localStorage` using the same `CACHE_KEYS` strategy if desired.

> 🔹 **Tip:** Keep the adapter **pure**—no React, no side-effects beyond transformation.

---

## 4. Extending / Creating **Dashboards**

Each tab lives under `src/components/dashboards/` and receives **only** the aggregated `AnalyticsDataset`.

### 4.1 Minimum-Data Contract

When you add a new dashboard, document the **required fields** in a JSDoc block at the top. This acts as a contract between import-layer and UI.

```ts
/**
 * Requires: `orders[*].deliveryLat`, `orders[*].deliveryLng` for map plotting.
 */
```

### 4.2 Boilerplate

```tsx
// src/components/dashboards/MyCoolDashboard.tsx
import React from "react";
import { AnalyticsDataset } from "../../types/CommonData";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface Props {
  data: AnalyticsDataset | null;
}

const MyCoolDashboard: React.FC<Props> = ({ data }) => {
  if (!data) return <div>No data yet</div>;

  // Visualise data.orders …
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Cool Metric</CardTitle>
      </CardHeader>
      <CardContent>{/* graphs, tables, etc. */}</CardContent>
    </Card>
  );
};

export default MyCoolDashboard;
```

### 4.3 Register the Tab

1. Add an enum/key in `src/App.tsx` where navigation items are defined.
2. Import and render your dashboard in the `renderContent()` switch.
3. Style the Lucide icon in `Sidebar.tsx`.

---

## 5. Coding Standards & Tooling

| Tool            | Purpose                         |
|-----------------|---------------------------------|
| **ESLint**      | Linting (auto-fix on save)      |
| **Prettier**    | Code style / formatting         |
| **TypeScript**  | Strict type-safety (`noImplicitAny`) |
| **Tailwind CSS**| Utility-first styling           |
| **pnpm**        | Package manager (lockfile committed) |

Run all checks before committing:

```bash
pnpm lint      # ESLint + type-check
pnpm test      # Unit tests (Vitest)
```

---

## 6. Git Workflow

1. **Branch** off `main` (or relevant feature branch):
   ```bash
   git checkout -b feat/zomato-import
   ```
2. **Commit** small logical chunks with descriptive messages.
3. **Push** and open a Pull-Request.
4. **CI** runs lint, tests, and build.
5. **Review**: At least one maintainer must approve.
6. **Squash-merge** to keep history clean.

> **Conventional Commits** are encouraged: `feat: add zomato adapter`, `fix: handle null GST`…

---

## 7. Testing Philosophy 🧪

• **Pure functions** (adapters, utils) → unit tests
• **Components** → interaction tests with @testing-library/react where feasible
• **CI** gate fails if coverage < 90 % for critical utils

---

## 8. Documentation Updates 📚

If your change alters public behaviour (new tab, settings, env vars):

1. Update `README.md` screenshots or instructions.
2. Amend this `CONTRIBUTION.md` where relevant.
3. Keep docs close to code (JSDoc, inline comments) whenever possible.

---

## 9. Need Help? 🤔

• Open a discussion or issue on GitHub.  
• Ping maintainers via Slack / Discord if urgent.

Thank you for making Spenddy better! 💜 