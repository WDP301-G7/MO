export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://wdp.up.railway.app/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google",
    REFRESH: "/auth/refresh",
    CHANGE_PASSWORD: "/auth/change-password",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
  },
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: "/categories/:id",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: "/products/:id",
    IMAGES: "/products/:id/images",
    CHECK_TRYON: "/products/:id/try-on",
  },
  INVENTORY: {
    PRODUCT: "/inventory/product/:productId",
    PRODUCT_AVAILABLE: "/inventory/product/:productId/available",
  },
  USERS: {
    UPDATE: "/users/:id",
  },
  ORDERS: {
    MY_ORDERS: "/orders/my",
    CREATE: "/orders",
    DETAIL: "/orders/:id",
    CANCEL: "/orders/:id/cancel",
    PRESCRIPTION: "/orders/:id/prescription",
  },
  PRESCRIPTION_REQUESTS: {
    LIST: "/prescription-requests",
    CREATE: "/prescription-requests",
    DETAIL: "/prescription-requests/:id",
  },
  PAYMENTS: {
    CREATE: "/payments/:orderId/create",
    DETAIL: "/payments/:id",
    BY_ORDER: "/payments/order/:orderId",
    VNPAY_RETURN: "/payments/vnpay/return",
    VNPAY_IPN: "/payments/vnpay/ipn",
  },
  STORES: {
    LIST: "/stores",
    DETAIL: "/stores/:id",
  },
  RETURNS: {
    CREATE: "/returns",
    MY_RETURNS: "/returns/my",
    DETAIL: "/returns/:id",
    DELETE: "/returns/:id",
    UPLOAD_IMAGES: "/returns/:id/images",
    DELETE_IMAGE: "/returns/:id/images/:imageId",
    STATS: "/returns/stats",
  },
  REVIEWS: {
    ELIGIBLE: "/reviews/eligible",
    CREATE: "/reviews",
    MY_REVIEWS: "/reviews/my-reviews",
    UPDATE: "/reviews/:id",
    DETAIL: "/reviews/:id",
    PRODUCT_REVIEWS: "/products/:productId/reviews",
  },
  MEMBERSHIP: {
    TIERS: "/membership/tiers",
    MY_STATUS: "/membership/me",
    MY_HISTORY: "/membership/me/history",
  },
};
