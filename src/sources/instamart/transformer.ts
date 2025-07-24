import { OrderRecord } from "../../types/CommonData";
import { format, getMonth, getYear, getHours } from "date-fns";

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

// Until we have a dedicated TS interface file, declare minimal fields we rely on
interface RawInstamartOrder {
  order_id: string;
  created_at: number; // epoch ms
  store_name: string;
  total_amount: number | string;
  item_count?: number;
  delivery_address?: string;
  order_status?: string;
  coupon_code?: string;
  discount_amount?: number | string;
  [k: string]: unknown;
}

export const instamartTransformer = (
  raw: RawInstamartOrder[]
): OrderRecord[] => {
  console.log("raw", raw);
  if (!Array.isArray(raw)) return [];
  
  // Debug: Log the first order to see the structure
  if (raw.length > 0) {
    console.log('Instamart raw data sample:', raw[0]);
    console.log('total_amount type:', typeof raw[0].total_amount);
    console.log('total_amount value:', raw[0].total_amount);
  }
  
  return raw.map((o) => {
    const orderTime = new Date(o.created_at);
    const year = getYear(orderTime);
    const month = getMonth(orderTime) + 1;
    const monthYear = format(orderTime, "yyyy-MM");
    const hour = getHours(orderTime);
    const dayOfWeek = format(orderTime, "EEEE");

    const items = (o as any).item_list ?? [];

    // Safely parse amounts
    const totalAmount = safeFloat(o.total_amount);
    const discountAmount = safeFloat(o.discount_amount);

    const record = {
      orderId: o.order_id,
      source: "swiggy-instamart",
      orderTime,
      orderTotal: totalAmount,
      netTotal: totalAmount - discountAmount,
      totalFees: 0,
      tipAmount: 0,

      paymentMethod: "Unknown",
      restaurantName: o.store_name,
      restaurantCuisine: ["Grocery"],
      restaurantCityName: "",
      restaurantLocality: "",

      year,
      month,
      monthYear,
      dayOfWeek,
      hour,

      itemsCount: o.item_count,
      items,

      deliveryArea: "",
      deliveryCity: "",

      orderDiscount: discountAmount,
      couponDiscount: 0,
      couponApplied: o.coupon_code,
    } as OrderRecord;

    return record;
  });
};
