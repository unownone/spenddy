export type DataSource = 'swiggy' | 'zomato' | 'dunzo' | 'uber_eats' | string;

/**
 * Generic representation of an individual order across any food-delivery platform.
 * This aims to be source-agnostic so the visualisation layer can rely on one shape.
 */
export interface OrderRecord {
  /** Unique identifier of the order as provided by the platform */
  orderId: string | number;

  /** The platform / provider that produced this order (e.g. 'swiggy') */
  source: DataSource;

  /** When the order was placed */
  orderTime: Date;

  /** Gross amount charged to the customer (inclusive of tip) */
  orderTotal: number;

  /** Net amount after discounts (excludes tip) */
  netTotal: number;

  /** Total fees paid (delivery, packing, convenience, etc.) */
  totalFees: number;

  /** Tip amount, if any */
  tipAmount: number;

  // Discounts
  orderDiscount?: number;
  couponDiscount?: number;
  couponApplied?: string;

  // ---- Fee breakdown (optional, depending on source) ----
  deliveryCharges?: number;
  packingCharges?: number;
  convenienceFee?: number;
  gst?: number;
  serviceCharges?: number;
  serviceTax?: number;
  vat?: number;

  // Item-level details
  itemsCount?: number;

  /** Number of people/diners for dine-in orders */
  pax?: number;

  /** Primary payment method label */
  paymentMethod: string;

  /** Restaurant or outlet name */
  restaurantName: string;

  /** Cuisines or tags associated with the restaurant */
  restaurantCuisine: string[];

  /** City / locality meta for grouping & mapping */
  restaurantCityName: string;
  restaurantLocality: string;

  /** Latitude & longitude (optional) */
  restaurantLat?: number;
  restaurantLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;

  deliveryArea?: string;
  deliveryCity?: string;
  deliveryAnnotation?: string;
  deliveryTime?: number;
  distance?: number;

  /** Calculated classification helpers */
  year: number;
  month: number; // 1-12
  monthYear: string; // e.g. "2024-03"
  dayOfWeek: string; // Monday, Tuesday…
  hour: number; // 0-23

  /** Additional arbitrary fields per source */
  [key: string]: any;
}

/**
 * Aggregate metrics the dashboards expect. Mirrors existing AnalyticsData but detached from Swiggy specifics.
 */
export interface AnalyticsDataset {
  orders: OrderRecord[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  totalTips: number;
  totalFees: number;
  uniqueRestaurants: number;
  uniqueAreas: number;
  dateRange: {
    start: Date;
    end: Date;
  };
} 