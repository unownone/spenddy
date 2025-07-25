import { OrderRecord } from "../../types/CommonData";
import { format, getMonth, getYear, getHours } from "date-fns";
import { OrderJobMetadata, type RawInstamartOrder } from "./types";

/**
 * Extract payment method from payment info
 */
const getPaymentMethod = (paymentInfo: any[]): string => {
  if (!paymentInfo || paymentInfo.length === 0) return "Unknown";
  const payment = paymentInfo[0];
  return payment?.paymentMethodDisplayName || payment?.payment_method || "Unknown";
  };
  
  /**
 * Calculate total discounts from bill discounts
 */
const calculateDiscounts = (discounts: any[]): number => {
  if (!discounts || discounts.length === 0) return 0;
  return discounts.reduce((total, discount) => total + (discount?.value || 0), 0);
};

/**
 * Extract detailed items from billed items
 */
const extractItems = (billedItems: any[]): any[] => {
  if (!billedItems || billedItems.length === 0) return [];
  
  return billedItems.map(billedItem => ({
    name: billedItem?.item?.name || 'Unknown Item',
    quantity: billedItem?.item?.quantity || 1,
    price: billedItem?.bill?.itemPrice || 0,
    basePrice: billedItem?.bill?.itemBasePrice || 0,
    totalCost: billedItem?.bill?.totalCost || 0,
    itemId: billedItem?.item?.itemId || '',
    discounts: billedItem?.bill?.discounts || []
  }));
};

export const instamartTransformer = (
  raw: RawInstamartOrder[]
): OrderRecord[] => {
  console.log("raw", raw);
  if (!Array.isArray(raw)) return [];
  
  return raw.flatMap((orderWrapper) => {
    // Use order_data which has much richer information
    const orderData = orderWrapper.order_data;
    if (!orderData || !orderData.orders || orderData.orders.length === 0) {
      console.warn("No order_data or orders found, falling back to order_data_v2");
      // Fallback to simpler extraction from order_data_v2
      return extractFromOrderDataV2(orderWrapper);
    }

    return orderData.orders.flatMap(order => {
      if (!order.order_jobs || order.order_jobs.length === 0) {
        return [];
      }

      return order.order_jobs.map(job => {
        const orderTime = new Date(job.created_at);
        const year = getYear(orderTime);
        const month = getMonth(orderTime) + 1;
        const monthYear = format(orderTime, "yyyy-MM");
        const hour = getHours(orderTime);
        const dayOfWeek = format(orderTime, "EEEE");

        const metadata = JSON.parse(job.metadata) as OrderJobMetadata;
        const bill = metadata?.bill;
        const storeInfo = metadata?.storeInfo;
        const address = metadata?.address;
        
        // Extract detailed financial information with null checks
        const totalAmount = bill?.totalBill || metadata?.orderTotal || 0;
        const subTotal = bill?.subTotal || 0;
        const orderDiscount = calculateDiscounts(bill?.discounts || []);
        const itemDiscounts = bill?.billedItems?.reduce((total, item) => 
          total + calculateDiscounts(item?.bill?.discounts || []), 0) || 0;
        
        // Extract detailed items
        const items = extractItems(bill?.billedItems || metadata?.items || []);
        const itemsCount = bill?.itemQuantity || metadata?.items?.length || items.length || 0;

        // Extract payment information
        const paymentMethod = getPaymentMethod(job.payment_info || []);

        // Extract location information
        const deliveryCity = address?.city || "";
        const deliveryArea = address?.area || "";
        const restaurantArea = storeInfo?.area || "";
        const restaurantCity = storeInfo?.cityName || "";

        // Extract delivery time information
        const deliveryTime = metadata?.waitTimePredicted 
          ? metadata.waitTimePredicted * 60 // Convert minutes to seconds
          : metadata?.slaInSeconds || 0;

        // Extract fee breakdown that SpendingDashboard expects
        const deliveryCharges = bill?.charges?.find(c => c?.type === 'deliveryCharge')?.value || 0;
        const packingCharges = bill?.charges?.find(c => c?.type === 'storePackagingCharges')?.value || 0;
        const convenienceFee = bill?.charges?.find(c => c?.type === 'convenienceFee')?.value || 0;
        const serviceCharges = bill?.charges?.find(c => c?.type === 'serviceCharge' || c?.type === 'serviceCharges')?.value || 0;
        const gst = bill?.taxes?.reduce((total, tax) => total + (tax?.value || 0), 0) || 0;

        // Calculate totalFees the same way SpendingDashboard does
        const totalFees = deliveryCharges + packingCharges + convenienceFee + serviceCharges + gst;

        const record: OrderRecord = {
          orderId: job.order_job_id || order.order_id || orderWrapper.order_id,
          source: "swiggy-instamart",
          orderTime,
          orderTotal: totalAmount,
          netTotal: totalAmount - orderDiscount,
          totalFees,
          tipAmount: 0, // Instamart doesn't typically have tips

          paymentMethod,
          restaurantName: storeInfo?.name || "Instamart",
          restaurantCuisine: storeInfo?.categories?.map(cat => cat.name) || ["Grocery"],
          restaurantCityName: restaurantCity,
          restaurantLocality: restaurantArea,

          year,
          month,
          monthYear,
          dayOfWeek,
          hour,

          itemsCount,
          items,

          deliveryArea,
          deliveryCity,
          deliveryTime, // Now properly set for delivery analysis

          orderDiscount: orderDiscount + itemDiscounts,
          couponDiscount: orderDiscount, // Trade discounts (like free delivery)
          couponApplied: order.coupon_code,

          // Fee breakdown fields that SpendingDashboard expects
          deliveryCharges,
          packingCharges, // Note: using packingCharges not packagingCharges
          convenienceFee,
          serviceCharges,
          gst,

          // Additional Instamart-specific fields that could be useful for analytics
          storeId: metadata?.storeId?.toString(),
          deliveryType: metadata?.deliveryType,
          orderStatus: job.status,
          
          // Location data for geographic analysis
          restaurantLat: storeInfo?.location?.latitude,
          restaurantLng: storeInfo?.location?.longitude,
          deliveryLat: address?.lat,
          deliveryLng: address?.lng,
          
          // Timing data for delivery analysis
          slaInSeconds: metadata?.slaInSeconds,
          waitTimePredicted: metadata?.waitTimePredicted,
          lastMileDistance: metadata?.lastMileDistance,
          
          // Financial breakdown for detailed analysis
          subTotal,
          itemTotal: bill?.totalItemCost || 0,
        } as OrderRecord;

        return record;
      });
    });
  });
};

/**
 * Fallback function to extract data from order_data_v2 when order_data is not available
 */
const extractFromOrderDataV2 = (orderWrapper: RawInstamartOrder): OrderRecord[] => {
  const orderTime = new Date(orderWrapper.created_at);
  const year = getYear(orderTime);
  const month = getMonth(orderTime) + 1;
  const monthYear = format(orderTime, "yyyy-MM");
  const hour = getHours(orderTime);
  const dayOfWeek = format(orderTime, "EEEE");

  // Extract items from order_data_v2
  const items = orderWrapper.order_data_v2?.shipments?.flatMap(shipment => 
    shipment.items?.map(item => ({
      name: item.name || 'Unknown Item',
      quantity: item.quantity || 1,
      price: 0,
      basePrice: 0,
      totalCost: 0,
      itemId: '',
      discounts: []
    })) || []
  ) || [];

  // Safely parse amounts
  const totalAmount = orderWrapper.order_data_v2?.total?.units || 0;
  const discountAmount = 0;

  const record: OrderRecord = {
    orderId: orderWrapper.order_id,
    source: "swiggy-instamart",
    orderTime,
    orderTotal: totalAmount,
    netTotal: totalAmount - discountAmount,
    totalFees: 0,
    tipAmount: 0,

    paymentMethod: "Unknown",
    restaurantName: orderWrapper.order_data_v2?.description || "Instamart",
    restaurantCuisine: ["Grocery"],
    restaurantCityName: "",
    restaurantLocality: "",

    year,
    month,
    monthYear,
    dayOfWeek,
    hour,

    itemsCount: items.length,
    items,

    deliveryArea: "",
    deliveryCity: "",

    orderDiscount: discountAmount,
    couponDiscount: 0,
    couponApplied: "",
  } as OrderRecord;

  return [record];
};
