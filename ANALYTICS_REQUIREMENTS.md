# Analytics Tab – Minimum Data Requirements

This document defines the *contract* between the **import/transformation layer** and the **UI visualisation layer**.  
If a required field is missing, the tab will either display fallback content or be disabled.

| Tab | Required Fields (per `OrderRecord`) | Notes |
|-----|------------------------------------|-------|
| **Overview** | `orderTime`, `orderTotal`, `year`, `monthYear` | Generates monthly spend chart & summary counters |
| **Spending** | `orderTotal`, `orderTime`, `totalFees`, `tipAmount` | Breaks down spend by month, fees vs. food total |
| **Restaurants** | `restaurantName`, `orderTotal`, `restaurantCuisine` | Computes top restaurants / cuisines |
| **Locations** | `deliveryLat`, `deliveryLng`, `restaurantLat`, `restaurantLng` | Plots map & distance analytics; optional—tab will show placeholder if coordinates absent |
| **Insights** | Combination of the above + `deliveryTime`, `distance` | Used for “farthest order”, “longest delivery”, etc. If any metric is unavailable the specific insight will be hidden |

> **Tip:** When adding a new data source, test each dashboard with the *data gap checker* (to be implemented) which flags missing fields before the UI loads. 