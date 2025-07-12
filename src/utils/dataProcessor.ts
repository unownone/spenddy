import { SwiggyOrder, ProcessedOrder, AnalyticsData } from '../types/SwiggyData';
import { DataSource, OrderRecord, AnalyticsDataset } from '../types/CommonData';
import { format, parseISO, getYear, getMonth, getHours } from 'date-fns';

/**
 * Safely convert string or number to float
 */
const safeFloat = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    try {
      return parseFloat(value.replace(/,/g, ''));
    } catch {
      return 0;
    }
  }
  return 0;
};

/**
 * Process raw Swiggy order data into analytics-ready format
 */
export const processOrderData = (rawOrders: SwiggyOrder[]): ProcessedOrder[] => {
  return rawOrders.map((order): ProcessedOrder => {
    const orderTime = parseISO(order.order_time);
    
    // Extract food categories from items
    const categories: string[] = [];
    order.order_items.forEach(item => {
      if (item.category_details) {
        if (item.category_details.category) {
          categories.push(item.category_details.category);
        }
        if (item.category_details.sub_category) {
          categories.push(item.category_details.sub_category);
        }
      }
    });
    
    const uniqueCategories = [...new Set(categories)];
    
    // Calculate charges
    const deliveryCharges = safeFloat(order.charges['Delivery Charges']);
    const packingCharges = safeFloat(order.charges['Packing Charges']);
    const convenienceFee = safeFloat(order.charges['Convenience Fee']);
    const gst = safeFloat(order.charges.GST);
    const serviceCharges = safeFloat(order.charges['Service Charges']);
    const serviceTax = safeFloat(order.charges['Service Tax']);
    const vat = safeFloat(order.charges.Vat);
    
    const totalFees = deliveryCharges + packingCharges + convenienceFee + gst + serviceCharges + serviceTax + vat;
    
    // Calculate delivery time if available
    let deliveryTime: number | undefined;
    if (order.delivered_time_in_seconds && order.ordered_time_in_seconds) {
      const deliveredTime = typeof order.delivered_time_in_seconds === 'string' 
        ? parseInt(order.delivered_time_in_seconds) 
        : order.delivered_time_in_seconds;
      deliveryTime = deliveredTime - order.ordered_time_in_seconds;
    }
    
    // Calculate distance (approximate from lat/lng if available)
    let distance: number | undefined;
    if (order.restaurant_customer_distance) {
      distance = safeFloat(order.restaurant_customer_distance);
    }
    
    // Extract coordinates
    let deliveryLat: number | undefined;
    let deliveryLng: number | undefined;
    let restaurantLat: number | undefined;
    let restaurantLng: number | undefined;
    
    // Get delivery coordinates
    if (order.delivery_address?.lat && order.delivery_address?.lng) {
      deliveryLat = safeFloat(order.delivery_address.lat);
      deliveryLng = safeFloat(order.delivery_address.lng);
    }
    
    // Get restaurant coordinates from restaurant_lat_lng string (format: "lat,lng")
    if (order.restaurant_lat_lng) {
      const coords = order.restaurant_lat_lng.split(',');
      if (coords.length === 2) {
        restaurantLat = safeFloat(coords[0]);
        restaurantLng = safeFloat(coords[1]);
      }
    }
    
    return {
      orderId: order.order_id,
      orderTime,
      orderTotal: order.order_total,
      orderTotalWithTip: order.order_total_with_tip,
      netTotal: order.net_total,
      itemTotal: order.item_total,
      orderStatus: order.order_status,
      restaurantName: order.restaurant_name,
      restaurantCuisine: order.restaurant_cuisine || [],
      restaurantLocality: order.restaurant_locality,
      restaurantCityName: order.restaurant_city_name,
      paymentMethod: order.payment_method,
      
      // Address info
      deliveryName: order.delivery_address.name,
      deliveryArea: order.delivery_address.area,
      deliveryCity: order.delivery_address.city,
      deliveryAnnotation: order.delivery_address.annotation || '',
      
      // Coordinates
      deliveryLat,
      deliveryLng,
      restaurantLat,
      restaurantLng,
      
      // Charges breakdown
      deliveryCharges,
      packingCharges,
      convenienceFee,
      gst,
      serviceCharges,
      serviceTax,
      vat,
      
      // Discounts
      orderDiscount: safeFloat(order.order_discount),
      couponDiscount: safeFloat(order.coupon_discount),
      couponApplied: order.coupon_applied,
      
      // Tips
      tipAmount: order.order_total_with_tip - order.order_total,
      
      // Order items count
      itemsCount: order.order_items.length,
      
      // Categories
      foodCategories: uniqueCategories,
      primaryCategory: uniqueCategories[0] || 'Unknown',
      
      // Delivery info
      deliveryTime,
      distance,
      
      // Calculated fields
      totalFees,
      year: getYear(orderTime),
      month: getMonth(orderTime) + 1, // getMonth returns 0-11
      monthYear: format(orderTime, 'yyyy-MM'),
      dayOfWeek: format(orderTime, 'EEEE'),
      hour: getHours(orderTime),
    };
  });
};

/**
 * Generate analytics data from processed orders
 */
export const generateAnalyticsData = (orders: ProcessedOrder[]): AnalyticsData => {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.orderTotal, 0);
  const averageOrderValue = totalSpent / totalOrders;
  const totalTips = orders.reduce((sum, order) => sum + order.tipAmount, 0);
  const totalFees = orders.reduce((sum, order) => sum + order.totalFees, 0);
  const uniqueRestaurants = new Set(orders.map(order => order.restaurantName)).size;
  const uniqueAreas = new Set(orders.map(order => order.deliveryArea)).size;
  
  const dates = orders.map(order => order.orderTime);
  const dateRange = {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime()))),
  };
  
  return {
    orders,
    totalOrders,
    totalSpent,
    averageOrderValue,
    totalTips,
    totalFees,
    uniqueRestaurants,
    uniqueAreas,
    dateRange,
  };
};

/**
 * Filter orders by date range
 */
export const filterOrdersByDateRange = (orders: ProcessedOrder[], start: Date, end: Date): ProcessedOrder[] => {
  return orders.filter(order => 
    order.orderTime >= start && order.orderTime <= end
  );
};

/**
 * Get monthly spending data
 */
export const getMonthlySpending = (orders: ProcessedOrder[]) => {
  const monthlyMap = new Map<string, ProcessedOrder[]>();
  
  orders.forEach(order => {
    const key = order.monthYear;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, []);
    }
    monthlyMap.get(key)!.push(order);
  });
  
  return Array.from(monthlyMap.entries())
    .map(([month, monthOrders]) => ({
      month,
      totalSpent: monthOrders.reduce((sum, order) => sum + order.orderTotal, 0),
      orderCount: monthOrders.length,
      totalFees: monthOrders.reduce((sum, order) => sum + order.totalFees, 0),
      totalTips: monthOrders.reduce((sum, order) => sum + order.tipAmount, 0),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Get top restaurants by order count
 */
export const getTopRestaurants = (orders: ProcessedOrder[], limit: number = 10) => {
  const restaurantMap = new Map<string, ProcessedOrder[]>();
  
  orders.forEach(order => {
    const key = order.restaurantName;
    if (!restaurantMap.has(key)) {
      restaurantMap.set(key, []);
    }
    restaurantMap.get(key)!.push(order);
  });
  
  return Array.from(restaurantMap.entries())
    .map(([restaurant, restaurantOrders]) => ({
      restaurant,
      orderCount: restaurantOrders.length,
      totalSpent: restaurantOrders.reduce((sum, order) => sum + order.orderTotal, 0),
      averageOrderValue: restaurantOrders.reduce((sum, order) => sum + order.orderTotal, 0) / restaurantOrders.length,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, limit);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/**
 * Format time duration (seconds to readable format)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}; 

/**
 * Convert Spenddy's existing `ProcessedOrder` (Swiggy-specific) into the new cross-source
 * `OrderRecord` schema so future dashboards can rely on a single data shape.
 */
export const toCommonOrderRecord = (
  orders: ProcessedOrder[],
  source: DataSource = 'swiggy'
): OrderRecord[] => {
  return orders.map((order) => ({
    // Identification
    orderId: order.orderId,
    source,

    // Monetary
    orderTime: order.orderTime,
    orderTotal: order.orderTotalWithTip,
    netTotal: order.netTotal,
    totalFees: order.totalFees,
    tipAmount: order.tipAmount,

    // Restaurant & payment
    paymentMethod: order.paymentMethod,
    restaurantName: order.restaurantName,
    restaurantCuisine: order.restaurantCuisine,
    restaurantCityName: order.restaurantCityName,
    restaurantLocality: order.restaurantLocality,

    // Coordinates
    restaurantLat: order.restaurantLat,
    restaurantLng: order.restaurantLng,
    deliveryLat: order.deliveryLat,
    deliveryLng: order.deliveryLng,

    // Temporal breakdown
    year: order.year,
    month: order.month,
    monthYear: order.monthYear,
    dayOfWeek: order.dayOfWeek,
    hour: order.hour,

    // Retain any additional fields that might have been calculated downstream
    ...order,
  }));
}; 

export const generateAnalyticsDataset = (orders: OrderRecord[]): AnalyticsDataset => {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.orderTotal, 0);
  const averageOrderValue = totalOrders ? totalSpent / totalOrders : 0;
  const totalTips = orders.reduce((sum, o) => sum + (o.tipAmount ?? 0), 0);
  const totalFees = orders.reduce((sum, o) => sum + (o.totalFees ?? 0), 0);
  const uniqueRestaurants = new Set(orders.map((o) => o.restaurantName)).size;
  const uniqueAreas = new Set(orders.map((o) => o.restaurantLocality)).size;

  const dates = orders.map((o) => o.orderTime);
  const dateRange = {
    start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };

  return {
    orders,
    totalOrders,
    totalSpent,
    averageOrderValue,
    totalTips,
    totalFees,
    uniqueRestaurants,
    uniqueAreas,
    dateRange,
  };
}; 