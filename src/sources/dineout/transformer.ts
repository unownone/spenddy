import { OrderRecord } from '../../types/CommonData';
import { format, getMonth, getYear, getHours } from 'date-fns';

// Based on the new data structure provided by the user.
interface RawDineoutOrder {
  created_at: number;
  order_id: string;
  history_status: string;
  order_data?: {
    orders?: {
      order_jobs?: {
        metadata?: string;
        payment_info?: {
          paymentMethodDisplayName?: string;
        }[];
      }[];
    }[];
  };
}

interface DineoutMetadata {
  storeInfo?: {
    name?: string;
    address?: string;
    locality?: string;
    cityName?: string;
  };
  bill?: {
    totalBillAmount?: number;
    totalDiscountAmount?: number;
  };
  items?: {
    guestCount?: number;
  }[];
}

const safeFloat = (val: any): number => {
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val === 'number') {
    return val;
  }
  return 0;
};

export const dineoutTransformer = (
  raw: RawDineoutOrder[],
): OrderRecord[] => {
  if (!Array.isArray(raw)) return [];

  const records: OrderRecord[] = [];

  raw.forEach(o => {
    if (o.history_status !== 'COMPLETED') {
      return;
    }

    const orderJob = o.order_data?.orders?.[0]?.order_jobs?.[0];
    if (!orderJob || !orderJob.metadata) {
      return;
    }

    try {
      const metadata: DineoutMetadata = JSON.parse(orderJob.metadata);

      const orderTime = new Date(o.created_at);
      const year = getYear(orderTime);
      const month = getMonth(orderTime) + 1;
      const monthYear = format(orderTime, 'yyyy-MM');
      const hour = getHours(orderTime);
      const dayOfWeek = format(orderTime, 'EEEE');

      const total = safeFloat(metadata.bill?.totalBillAmount);

      const record: OrderRecord = {
        orderId: o.order_id,
        source: 'swiggy-dineout',
        orderTime,
        orderTotal: total,
        netTotal: total,
        totalFees: 0,
        tipAmount: 0,

        paymentMethod:
          orderJob.payment_info?.[0]?.paymentMethodDisplayName ?? 'Unknown',
        restaurantName: metadata.storeInfo?.name ?? 'Unknown Restaurant',
        restaurantCuisine: ['Dine-In'],
        restaurantCityName: metadata.storeInfo?.cityName ?? '',
        restaurantLocality: metadata.storeInfo?.locality ?? '',

        year,
        month,
        monthYear,
        dayOfWeek,
        hour,

        itemsCount: undefined,
        pax: metadata.items?.[0]?.guestCount ?? (metadata as any).pax,

        deliveryArea: '',
        deliveryCity: metadata.storeInfo?.cityName ?? '',

        orderDiscount: safeFloat(metadata.bill?.totalDiscountAmount),
        couponDiscount: 0, // Not clear how to separate coupon from order discount
        couponApplied: undefined, // Not obvious where to get this.
      };
      records.push(record);
    } catch (e) {
      console.error('Error parsing Dineout metadata for order:', o.order_id, e);
    }
  });

  return records;
}; 