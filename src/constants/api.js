export const API_URL = "https://wdp.up.railway.app/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
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
  },
  PAYMENTS: {
    CREATE: "/payments/:orderId/create",
    DETAIL: "/payments/:id",
    BY_ORDER: "/payments/order/:orderId",
    VNPAY_RETURN: "/payments/vnpay/return",
    VNPAY_IPN: "/payments/vnpay/ipn",
  },
};
