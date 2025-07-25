
// Comprehensive type definitions for Instamart order data
export interface RawInstamartOrder {
    order_id: string;
    created_at: number; // epoch ms
    customer_id: string;
    history_status: string;
    order_data: RawInstamartOrderData; // Using the richer order_data instead of order_data_v2
    order_data_v2: RawInstamartOrderDataV2;
    order_group_id: string;
    order_type: string;
    details_text: {
        line1: string;
        line2: string | null;
    };
    refund_details: {
        refund_initiated: string;
        refund_processed: string;
    };
}

export interface RawInstamartOrderData {
    created_at: number;
    customer_id: string;
    order_group_id: string;
    orders: RawInstamartOrderDataOrder[];
    payment_info_v2: {
        amount_collected: number;
        payment_transaction_reference: PaymentTransactionReference[];
    };
    updated_at: number;
}

export interface RawInstamartOrderDataOrder {
    coupon_code: string | null;
    created_at: number;
    customer_id: string;
    order_id: string;
    order_jobs: RawInstamartOrderJob[];
    order_type: string;
    updated_at: number;
}

export interface RawInstamartOrderJob {
    created_at: number;
    customer_id: string;
    merchant_id: string;
    metadata: string; // actually OrderJobMetadata
    order_job_id: string;
    payment_info: PaymentInfo[];
    status: string;
    status_meta: string;
    updated_at: number;
}

export interface OrderJobMetadata {
    type: string;
    orderTotal: number;
    storeId: number;
    address: DeliveryAddress;
    items: OrderItem[];
    storeInfo: StoreInfo;
    bill: OrderBill;
    cartId: string;
    deliveryType: string;
    slaInSeconds?: number;
    waitTimePredicted?: number;
    firstMileTimePrediction?: number;
    lastMileTimePrediction?: number;
    prepTimePrediction?: number;
    lastMileDistance?: number;
}

export interface DeliveryAddress {
    id: string;
    userId: number;
    address: string;
    lat: number;
    lng: number;
    flatNo: string;
    city: string;
    landmark: string;
    annotation: string;
    category: string;
    area: string;
    name: string;
    mobile: string;
}

export interface OrderItem {
    type: string;
    serviceLine: string;
    storeId: number;
    quantity: number;
    itemId: string;
    name: string;
    imageIds?: string[];
}

export interface StoreInfo {
    name: string;
    area: string;
    address: string;
    id: number;
    location: {
        latitude: number;
        longitude: number;
    };
    phoneNumbers: string;
    cityName: string;
    categories: Array<{
        id: number;
        name: string;
        is_category_popular: boolean;
    }>;
}

export interface OrderBill {
    type: string;
    totalBill: number;
    charges: BillCharge[];
    taxes: BillTax[];
    discounts: BillDiscount[];
    itemQuantity: number;
    subTotal: number;
    totalItemCost: number;
    billedItems: BilledItem[];
    totalCostWithoutDiscounts: number;
    exclusiveItemSavingsWithSuper: number;
    totalItemSellingCost: number;
}

export interface BillCharge {
    type: string;
    value: number;
    ctx: {
        displayName?: string;
        description?: string;
        inlineMessage?: string;
    };
}

export interface BillTax {
    type: string;
    value: number;
    totalGST: number;
    cgst: number;
    igst: number;
    sgst: number;
}

export interface BillDiscount {
    type: string;
    value: number;
    offerId?: string;
    superOffer?: boolean;
    tdType?: string;
}

export interface BilledItem {
    item: OrderItem;
    bill: {
        totalBill: number;
        itemPrice: number;
        totalCost: number;
        itemBasePrice: number;
        itemStorePrice: number;
        quantity: number;
        itemCost: number;
        discounts?: BillDiscount[];
    };
    itemViewDetails: {
        text: { text: string };
        amount: { text: string };
        type: string;
    };
}

export interface PaymentInfo {
    payment_method: string;
    payment_status: string;
    payment_type: string;
    transaction_amount: number;
    transaction_id: string;
    paymentMethodDisplayName: string;
}

export interface PaymentTransactionReference {
    marketplace_reference_id: string;
    primary_payment_method: string;
    state: string;
    total_amount: number;
}

// Keep the existing order_data_v2 types for backward compatibility
export interface RawInstamartOrderDataV2 {
    description: string;
    refund_status: string;
    shipments: RawInstamartOrderDataV2Shipment[];
    total: {
        currency_code: string;
        nanos: number;
        units: number;
    }
}

export interface RawInstamartOrderDataV2Shipment {
    items: RawInstamartOrderDataV2ShipmentItem[]; 
}

export interface RawInstamartOrderDataV2ShipmentItem {
    name: string;
    quantity: number;
}