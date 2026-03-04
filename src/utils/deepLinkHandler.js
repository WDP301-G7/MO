/**
 * Deep Link Handler
 * Xử lý các deep link từ backend (payment, orders, etc)
 *
 * Ví dụ:
 * - myapp://checkout?orderId=123&amount=5000
 * - myapp://order-detail?orderId=456
 * - myapp://payment-success?transactionId=ABC123
 */

export const linking = {
  prefixes: ["myapp://", "https://myapp.com"],

  config: {
    screens: {
      // Auth screens
      Login: "login",
      Register: "register",
      ForgotPassword: "forgot-password",

      // Main App
      MainApp: "home",

      // Product screens
      ProductCatalog: "products",
      ProductDetail: {
        path: "products/:productId",
        parse: {
          productId: (productId) => productId,
        },
      },

      // Cart & Checkout
      Cart: "cart",
      Checkout: {
        path: "checkout",
        parse: {
          orderId: (orderId) => orderId,
          amount: (amount) => amount,
        },
      },

      // Orders
      Orders: "orders",
      OrderDetail: {
        path: "orders/:orderId",
        parse: {
          orderId: (orderId) => orderId,
        },
      },
      OrderSuccess: {
        path: "order-success",
        parse: {
          orderId: (orderId) => orderId,
          transactionId: (transactionId) => transactionId,
        },
      },

      // Profile
      Profile: "profile",
      EditProfile: "profile/edit",
      ChangePassword: "profile/change-password",
      AddressManagement: "address",

      // Prescription
      PrescriptionOrder: "prescription",

      // Virtual Try-on
      VirtualTryOn: "virtual-tryon",

      // Others
      Search: "search",
      Notifications: "notifications",
      Vouchers: "vouchers",
      Support: "support",
      Categories: "categories",
      Reviews: "reviews",
      MyReviews: "my-reviews",
      ReturnRequest: "return/request",
      ReturnHistory: "return/history",
      Favorites: "favorites",
      NotificationSettings: "settings/notifications",
      Terms: "terms",
    },
  },
};

/**
 * Xử lý state từ deeplink
 * Navigation state chứa thông tin về route được gọi từ deeplink
 *
 * @param {Object} state - Navigation state từ deeplink
 * @returns {Object} - State sau khi xử lý
 */
export const handleDeepLink = (state) => {
  // Lấy route cuối cùng từ deep link
  const route = state?.routes[state.routes.length - 1];

  if (route?.name && route?.params) {
    // Xử lý các trường hợp đặc biệt
    switch (route.name) {
      case "OrderSuccess":
        // Xử lý payment success
        break;

      case "OrderDetail":
        // Lấy chi tiết đơn hàng
        break;

      case "ProductDetail":
        // Lấy chi tiết sản phẩm
        break;

      case "Checkout":
        // Đi đến checkout
        break;

      default:
        break;
    }
  }

  return state;
};

/**
 * Tạo deeplink cho backend
 * Backend sẽ trả về deeplink này cho mobile app
 *
 * @param {string} screenName - Tên màn hình
 * @param {Object} params - Tham số truyền cho màn hình
 * @returns {string} - URL deeplink
 */
export const createDeepLink = (screenName, params = {}) => {
  let deepLink = `myapp://${screenName}`;

  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    deepLink += `?${queryString}`;
  }

  return deepLink;
};

/**
 * Parse deeplink từ URL string
 * Tách schema và parameter từ deeplink
 *
 * @param {string} url - URL deeplink
 * @returns {Object} - {screenName, params}
 */
export const parseDeepLink = (url) => {
  if (!url) return null;

  try {
    // Loại bỏ schema (myapp://)
    const withoutSchema = url.replace(/^myapp:\/\//, "");

    // Tách screen name và query string
    const [screenName, queryString] = withoutSchema.split("?");

    // Parse query parameters
    const params = {};
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        params[key] = decodeURIComponent(value);
      });
    }

    return { screenName, params };
  } catch (error) {
    console.error("Error parsing deeplink:", error);
    return null;
  }
};
