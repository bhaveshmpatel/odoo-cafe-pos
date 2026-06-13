/**
 * @module @repo/shared-types
 *
 * Centralised TypeScript type definitions shared between the `apps/web`
 * frontend and the `apps/api` backend. Every enum value and interface field
 * mirrors the Prisma schema exactly so that API responses, WebSocket payloads,
 * and Zustand stores are all type-safe end-to-end.
 *
 * Conventions:
 *  - Prisma `Decimal` fields → `string` (preserves precision across JSON)
 *  - Prisma `DateTime` fields → `string` (ISO-8601 serialisation)
 *  - Optional relation fields use `?` on the interface property
 */

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — Enums (exact mirrors of Prisma schema enums)
// ─────────────────────────────────────────────────────────────────────────────

/** Role assigned to a staff user. */
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

/** Visual shape of a dining table rendered on the floor plan. */
export enum TableShape {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
}

/** Lifecycle status of an order flowing through POS → KDS → completion. */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Granular status of a single order item tracked on the KDS. */
export enum ItemStatus {
  QUEUED = 'QUEUED',
  TO_COOK = 'TO_COOK',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
}

/** Supported payment instrument types. */
export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
}

/** Condition that triggers a promotional discount. */
export enum PromotionType {
  MIN_QUANTITY = 'MIN_QUANTITY',
  MIN_AMOUNT = 'MIN_AMOUNT',
  COUPON = 'COUPON',
}

/** Whether a discount is a percentage or a fixed-amount deduction. */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Model Interfaces (mirror Prisma models)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A staff user who can log in to the POS terminal or admin dashboard.
 * Maps to the `User` Prisma model.
 */
export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A walk-in or registered customer associated with orders.
 * Maps to the `Customer` Prisma model.
 */
export interface ICustomer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * A product category with a hex colour used in the POS terminal grid.
 * Maps to the `Category` Prisma model.
 */
export interface ICategory {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A menu item that can be added to an order.
 * Maps to the `Product` Prisma model.
 */
export interface IProduct {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  is_available: boolean;
  category_id: string;
  created_at: string;
  updated_at: string;

  /** Optional eager-loaded relation */
  category?: ICategory;
}

/**
 * A logical floor (e.g. "Ground Floor", "Patio") that groups dining tables.
 * Maps to the `Floor` Prisma model.
 */
export interface IFloor {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  /** Optional eager-loaded relation */
  tables?: IDiningTable[];
}

/**
 * A physical table placed on a floor plan with position, size, and shape
 * metadata used for the visual floor-plan builder and POS selector.
 * Maps to the `DiningTable` Prisma model.
 */
export interface IDiningTable {
  id: string;
  table_number: number;
  floor_id: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  shape: TableShape;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  /** Optional eager-loaded relations */
  floor?: IFloor;
  orders?: IOrder[];
}

/**
 * A customer order containing one or more items and associated payments.
 * Maps to the `Order` Prisma model.
 */
export interface IOrder {
  id: string;
  order_number: number;
  status: OrderStatus;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  grand_total: string;
  notes: string | null;
  dining_table_id: string | null;
  customer_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;

  /** Optional eager-loaded relations */
  items?: IOrderItem[];
  payments?: IPayment[];
  diningTable?: IDiningTable | null;
  customer?: ICustomer | null;
  user?: IUser;
}

/**
 * A single line-item in an order, including its KDS-level item status.
 * Maps to the `OrderItem` Prisma model.
 */
export interface IOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  item_status: ItemStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;

  /** Optional eager-loaded relation */
  product?: IProduct;
}

/**
 * A payment record applied against an order.
 * Maps to the `Payment` Prisma model.
 */
export interface IPayment {
  id: string;
  order_id: string;
  payment_method_id: string;
  amount_paid: string;
  change_given: string;
  created_at: string;

  /** Optional eager-loaded relations */
  order?: IOrder;
  paymentMethod?: IPaymentMethod;
}

/**
 * A configured payment instrument (e.g. "Main Cash Register", "Razorpay UPI").
 * Maps to the `PaymentMethod` Prisma model.
 */
export interface IPaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A promotional rule that can automatically or manually discount orders.
 * Maps to the `Promotion` Prisma model.
 */
export interface IPromotion {
  id: string;
  name: string;
  description: string | null;
  type: PromotionType;
  discount_type: DiscountType;
  discount_value: string;
  min_quantity: number | null;
  min_order_amount: string | null;
  coupon_code: string | null;
  product_id: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;

  /** Optional eager-loaded relation */
  product?: IProduct;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — API Response Types
// ─────────────────────────────────────────────────────────────────────────────

/** Successful API response wrapper. */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** Failed API response wrapper. */
export interface ApiError {
  success: false;
  error: string;
}

/**
 * Discriminated union returned by every REST endpoint.
 * Consumers can narrow via `result.success`.
 */
export type ApiResult<T> = ApiResponse<T> | ApiError;

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — POS Cart Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single item inside the POS terminal cart.
 * Uses `number` for prices (frontend display precision) rather than Decimal strings.
 */
export interface CartItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  notes?: string;
  category_color?: string;
}

/**
 * Dictionary state that maps active carts to specific dining tables.
 * Persisted via Zustand `persist` middleware to `localStorage` for
 * offline resilience.
 */
export interface CartState {
  carts: Record<string, CartItem[]>;
  activeTableId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 — Pricing Engine Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The complete breakdown returned by the pricing engine after evaluating
 * promotions, coupons, and tax against the cart.
 */
export interface PricingResult {
  subtotal: number;
  discount_total: number;
  applied_promotions: AppliedPromotion[];
  tax_rate: number;
  tax_total: number;
  grand_total: number;
}

/** Details of a single promotion that was successfully applied. */
export interface AppliedPromotion {
  promotion_id: string;
  promotion_name: string;
  discount_amount: number;
  type: PromotionType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 6 — WebSocket Event Types
// ─────────────────────────────────────────────────────────────────────────────

/** Payload emitted when a new order is sent from POS to KDS. */
export interface KdsNewOrderPayload {
  order: IOrder;
}

/** Payload emitted when the KDS advances an order's stage. */
export interface KdsUpdateStagePayload {
  order_id: string;
  new_status: OrderStatus;
}

/** Payload emitted when a kitchen worker strikes-through a single item. */
export interface KdsStrikeItemPayload {
  order_id: string;
  order_item_id: string;
  new_item_status: ItemStatus;
}

/**
 * Map of all WebSocket event names to their respective payload types.
 * Used to strongly type `socket.emit()` and `socket.on()` calls across
 * the frontend and backend.
 */
export interface SocketEvents {
  pos_send_order: KdsNewOrderPayload;
  new_kds_order: KdsNewOrderPayload;
  kds_update_stage: KdsUpdateStagePayload;
  kds_strike_item: KdsStrikeItemPayload;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 7 — Auth Types
// ─────────────────────────────────────────────────────────────────────────────

/** Request body for the `POST /auth/login` endpoint. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Successful login response containing a JWT and sanitised user. */
export interface LoginResponse {
  token: string;
  user: Omit<IUser, 'password_hash'>;
}

/** Claims encoded inside every issued JSON Web Token. */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
