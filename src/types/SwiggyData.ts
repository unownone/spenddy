// Core data interfaces for Swiggy order analysis

export interface DeliveryAddress {
  id: string;
  version?: number;
  name: string;
  address_line1: string;
  address_line2?: string;
  address: string;
  landmark?: string;
  area: string;
  mobile: string;
  alternate_mobile?: string;
  annotation?: string;
  instructions?: string;
  voice_directions_s3_uri?: string;
  email?: string;
  flat_no?: string;
  city: string;
  lat: string;
  lng: string;
  is_verified: boolean;
  reverse_geo_code_failed: boolean;
}

export interface Variant {
  variation_id: number;
  group_id: number;
  name: string;
  price: number;
  variant_tax_charges: Record<string, string>;
}

export interface Addon {
  choice_id: string;
  group_id: string;
  name: string;
  price: number;
  external_choice_id: string;
  external_group_id: string;
  addon_tax_charges: Record<string, string>;
}

export interface CategoryDetails {
  category: string;
  sub_category: string;
}

export interface ItemCharges {
  Vat: string;
  'Service Charges': string;
  'Service Tax': string;
  GST: string;
}

export interface ItemAttributes {
  portionSize?: string;
  spiceLevel?: string;
  vegClassifier?: string;
  accompaniments?: string;
}

export interface OrderItem {
  item_key: string;
  has_variantv2?: boolean;
  item_group_tag_id?: string;
  added_by_user_id: number;
  added_by_username: string;
  group_user_item_map: Record<string, any>;
  item_id: string;
  external_item_id: string;
  name: string;
  is_veg: string;
  addons: Addon[];
  image_id?: string;
  quantity: string;
  free_item_quantity: string;
  total: string;
  subtotal: string;
  final_price: string;
  base_price: string;
  effective_item_price: string;
  packing_charges: string;
  category_details: CategoryDetails;
  item_charges: ItemCharges;
  item_total_discount: number | string;
  item_delivery_fee_reversal: number;
  meal_quantity: string;
  single_variant: boolean;
  attributes: ItemAttributes;
  in_stock: number;
}

export interface TipDetails {
  type: string;
  experimentId: string;
}

export interface DeliveryFeeCouponBreakup {
  thresholdFee: number;
  distanceFee: number;
  timeFee: number;
  specialFee: number;
  totalDeliveryFeeDiscount: number;
  discountShare: Record<string, number>;
}

export interface DeliveryBoy {
  trackable: number;
  id?: string;
  name?: string;
  mobile?: string;
  image_url?: string;
}

export interface PaymentMethod {
  type: string;
  card_sub_type: string;
  upi_sub_type: string;
  wallet_sub_type: string;
  bnpl_sub_type: string;
  reward_sub_type: string;
}

export interface PaymentSubTransaction {
  payment_method: PaymentMethod;
  payment_method_display_name: string;
}

export interface PaymentTransaction {
  marketplace_reference_id: string;
  state: string;
  total_amount: Record<string, any>;
  primary_payment_sub_transaction_reference: PaymentSubTransaction;
  secondary_payment_sub_transaction_references: any[];
  refund_references: any[];
  request_reference_id: string;
}

export interface PaymentInfoV2 {
  payment_transactions: PaymentTransaction[];
  amount_collected: Record<string, any>;
}

export interface Charges {
  Vat: string;
  'Service Charges': string;
  'Service Tax': string;
  'Delivery Charges': string;
  'Total Delivery Fees': string;
  'Packing Charges': string;
  'Convenience Fee': string;
  'Cancellation Fee': string;
  GST: string;
}

export interface RatingMeta {
  restaurant_rating: Record<string, any>;
  delivery_rating: Record<string, any>;
  asset_id: string;
}

export interface RenderingDetail {
  type: string;
  key: string;
  intermediateText: string;
  value: string;
  hierarchy: number;
  currency: string;
  display_text: string;
  info_text: string;
  icon: string;
  discount_message: string;
  is_negative?: number;
  meta?: Record<string, any>;
}

export interface DeliveryFeeDetails {
  delfee_after_reversal: Record<string, any>;
  delfee_before_tax: Record<string, any>;
  delfee_after_tax: Record<string, any>;
  delfee_tax_details: Record<string, any>;
}

export interface SwiggyOrder {
  sharedOrder: boolean;
  primaryPaymentTransactionAmount: number;
  previousOrderId: number;
  tipDetails: TipDetails;
  deliveryFeeCouponBreakup: DeliveryFeeCouponBreakup;
  expressFeesWithoutTax: number;
  anchorExpressFeesWithoutTax: number;
  expressFeeTax: number;
  expressFeeDiscount: number;
  order_id: number;
  delivery_address: DeliveryAddress;
  order_items: OrderItem[];
  old_order_items: any[];
  order_meals: any[];
  old_order_meals: any[];
  order_subscriptions: any[];
  charges: Charges;
  free_gifts: any[];
  is_coupon_applied: boolean;
  is_payment_coupon_applied: boolean;
  is_coupon_auto_applied: boolean;
  coupon_applied: string;
  coupons_applied: Record<string, any>;
  offers_data: string;
  order_time: string;
  confirmed_time: string;
  customer_id: string;
  order_status: string;
  post_status: string;
  order_type: string;
  post_type: string;
  post_name: string;
  billing_address_id: string;
  sla_time: string;
  delivery_boy: DeliveryBoy;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_locality: string;
  restaurant_type: string;
  restaurant_city_code: string;
  restaurant_city_name: string;
  restaurant_area_code: string;
  restaurant_cuisine: string[];
  restaurant_closing_in_min: number;
  restaurant_closed: boolean;
  payment_method: string;
  payment_method_involved: string;
  payment_info_v2: PaymentInfoV2;
  targeted_marketplace_payment_reference_id: string;
  order_delivery_status: string;
  ordered_time_in_seconds: number;
  delivered_time_in_seconds?: string;
  delivery_time_in_seconds?: string;
  order_total: number;
  order_total_with_tip: number;
  net_total: number;
  item_total: number;
  restaurant_fulfilment_charges: number;
  subscription_total: number;
  subscription_tax: number;
  subscription_total_without_tax: number;
  original_order_total: number;
  swiggy_money: number;
  offer_with_reward_benefit_sink: boolean;
  savings_on_next_order: string;
  trade_discount_reward_amount: number;
  discount_cap_trade_discount: number;
  payment_offer_instant_discount: number;
  order_tax: number;
  free_shipping: string;
  order_discount_without_freebie: number | string;
  order_discount: number | string;
  coupon_discount: number | string;
  coupon_discounts: Record<string, number | string>;
  trade_discount: number | string;
  order_discount_effective: number | string;
  coupon_discount_effective: number | string;
  coupon_discounts_effective: Record<string, number | string>;
  trade_discount_effective: number | string;
  batch_opt_in_discount: number;
  batch_opt_in: string;
  free_delivery_discount_hit: number;
  delivery_discount_hit: number;
  freebie_discount_hit: number;
  super_specific_discount: number;
  has_rating: string;
  show_rate_us: boolean;
  restaurant_order_rating: number;
  rating_meta: RatingMeta;
  order_spending: string;
  order_incoming: string;
  waive_off_amount: number;
  edit_refund_amount: number;
  order_restaurant_bill: string;
  restaurant_lat_lng: string;
  restaurant_customer_distance: string;
  customer_care_number: string;
  pg_response_time: string;
  converted_to_cod: boolean;
  last_failed_order_id: number;
  order_delivery_charge: number;
  order_delivery_charge_base_price: number;
  convenience_fee: string;
  discounted_total_delivery_charge_actual: string;
  customer_user_agent: string;
  overbooking: string;
  swiggy_offers_discount_list: Record<string, number | string>;
  restaurant_offers_discount_list: Record<string, number | string>;
  alliance_offers_discount_list: Record<string, number | string>;
  billing_lat: string;
  billing_lng: string;
  payment_txn_id: string;
  coupon_code: string;
  coupon_codes: Record<string, string>;
  with_de: boolean;
  restaurant_new_slug: string;
  restaurant_has_inventory: string;
  order_payment_method: string;
  pay_by_system_value: boolean;
  de_pickedup_refund: number;
  agreement_type: string;
  is_ivr_enabled: string;
  is_refund_initiated: number;
  restaurant_cover_image: string;
  restaurant_area_name: string;
  cust_lat_lng: Record<string, string>;
  key: string;
  is_assured: number;
  delayed_placing: number;
  is_long_distance: boolean;
  on_time: boolean;
  sla_difference: string;
  actual_sla_time: string;
  payment_txn_status: string;
  restaurant_taxation_type: string;
  rain_mode: string;
  mfr_time_pred: string;
  de_arrival_time_prediction: string;
  promise_id: string;
  is_super_long_distance: boolean;
  restaurant_gst_category: string;
  device_id: string;
  swuid: string;
  tid: string;
  sid: string;
  cancellation_policy_promise_id: string;
  is_replicated: boolean;
  is_cancellable: boolean;
  cancellation_fee_collected: number;
  cancellation_fee_applied: number;
  cancellation_fee_collected_total: number;
  is_cancellation_fee_already_reverted: boolean;
  previous_cancellation_fee: number;
  is_select: boolean;
  is_dormant_user: boolean;
  is_first_order_delivered: boolean;
  first_order: boolean;
  is_bank_discount?: boolean;
  coupon_type?: string;
  coupon_types: Record<string, string | null>;
  coupon_description?: string;
  rendering_details: RenderingDetail[];
  mCancellationTime: number;
  configurations: Record<string, any>;
  GST_on_discounted_total_delivery_fee: Record<string, any>;
  GST_on_subscription: Record<string, any>;
  discounted_total_delivery_charge_gst_expression: string;
  subscription_gst_expression: string;
  success_message_v2: string;
  success_message_info: string;
  success_message_info_v2: string;
  success_title: string;
  success_message_type: string;
  savings_shown_to_customer?: string;
  threshold_fee: number;
  distance_fee: number;
  time_fee: number;
  special_fee: number;
  threshold_fee_effective: number;
  distance_fee_effective: number;
  time_fee_effective: number;
  special_fee_effective: number;
  delivery_fee_details: DeliveryFeeDetails;
  total_tax: number;
  total_tax_including_platform_fee: number;
  platform_fee_tax: number;
  delivery_fee_reversal_breakup: Record<string, number>;
  delivery_fee_reversal: number;
  discounted_total_delivery_fee: number;
  free_del_break_up?: Record<string, any>;
  initiation_source: number;
  order_tags: string[];
  juspay_meta: Record<string, any>;
  tip_detail_list: TipDetails[];
  default_delivery_text: string;
  additional_payment_details: any[];
  group_tag_details: Array<Record<string, string>>;
  updated_at: string;
  category_info: string;
  loyalty_protobuf: string;
  category_info_json: string;
  conservative_last_mile_distance: number;
  selected_sla_option: string;
  priority_delivery_fee: number;
  is_gourmet: boolean;
  address_changed_post_order: string;
  post_order_address_change_attempted_at: number;
  restaurant_packing_charges: number;
  anchor_convenience_fees: number;
  base_convenience_fees: number;
  convenience_fees: number;
  convenience_fees_with_tax: number;
  convenience_fees_discount: number;
  uoms_order: boolean;
  is_scheduled: boolean;
  is_offer_bundle_applied: boolean;
  is_one_lite_applied: boolean;
  is_reorderable_order: boolean;
  packaging_fee_discount: number;
  final_order_discount_without_por_and_platform_fee_discount: number | string;
  is_super_benefits_applied: boolean;
  no_rush_delivery_discount: number;
  is_pre_order: boolean;
  order_transition_screen_new_msg_enabled: boolean;
  is_bulk_order: boolean;
  child_orders: any[];
  parent_order_id: string;
  is_swiggy_black_applicable: boolean;
  is_swiggy_black_otp_applicable: boolean;
  is_swiggy_black_otp_animation_enabled: boolean;
  is_pop_order: boolean;
  is_bolt_experience_enabled_on_order_confirmation_screen: boolean;
  is_affordable_m2_experience_enabled_on_order_confirmation_screen: boolean;
}

// Processed data interfaces for analytics
export interface ProcessedOrder {
  orderId: number;
  orderTime: Date;
  orderTotal: number;
  orderTotalWithTip: number;
  netTotal: number;
  itemTotal: number;
  orderStatus: string;
  restaurantName: string;
  restaurantCuisine: string[];
  restaurantLocality: string;
  restaurantCityName: string;
  paymentMethod: string;
  
  // Address info
  deliveryName: string;
  deliveryArea: string;
  deliveryCity: string;
  deliveryAnnotation: string;
  
  // Coordinates
  deliveryLat?: number;
  deliveryLng?: number;
  restaurantLat?: number;
  restaurantLng?: number;
  
  // Charges breakdown
  deliveryCharges: number;
  packingCharges: number;
  convenienceFee: number;
  gst: number;
  serviceCharges: number;
  serviceTax: number;
  vat: number;
  
  // Discounts
  orderDiscount: number;
  couponDiscount: number;
  couponApplied: string;
  
  // Tips
  tipAmount: number;
  
  // Order items count
  itemsCount: number;
  
  // Categories
  foodCategories: string[];
  primaryCategory: string;
  
  // Delivery info
  deliveryTime?: number;
  distance?: number;
  
  // Calculated fields
  totalFees: number;
  year: number;
  month: number;
  monthYear: string;
  dayOfWeek: string;
  hour: number;
}

export interface AnalyticsData {
  orders: ProcessedOrder[];
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

export interface TimeFilter {
  start: Date;
  end: Date;
  label: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface InsightData {
  highestOrder: {
    value: number;
    restaurant: string;
    date: string;
  };
  mostItems: {
    count: number;
    restaurant: string;
    date: string;
  };
  farthestOrder: {
    distance: number;
    restaurant: string;
    area: string;
  };
  longestDelivery: {
    time: number;
    restaurant: string;
    date: string;
  };
}

export interface MonthlyFavorite {
  month: string;
  topRestaurant: string;
  topCuisine: string;
  totalSpent: number;
  orderCount: number;
} 