import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Get customer's orders with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>}
 */
export const getMyOrders = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.ORDERS.MY_ORDERS}?page=${page}&limit=${limit}`,
    );

    // Handle different response structures
    let ordersData = [];
    let paginationInfo = null;

    if (response.data.data) {
      // Check if data.data is array directly (simple case)
      if (Array.isArray(response.data.data)) {
        ordersData = response.data.data;
        paginationInfo = response.data.meta || response.data.pagination;
      }
      // Check if data.data has nested data.data (paginated response)
      else if (response.data.data.data) {
        ordersData = response.data.data.data;
        // Backend returns pagination info in "meta" object, not "pagination"
        paginationInfo =
          response.data.data.meta || response.data.data.pagination;
      }
    }

    return {
      success: true,
      data: ordersData,
      pagination: paginationInfo,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách đơn hàng",
    };
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>}
 */
export const getOrderById = async (orderId) => {
  try {
    const endpoint = API_ENDPOINTS.ORDERS.DETAIL.replace(":id", orderId);
    const response = await api.get(endpoint);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin đơn hàng",
    };
  }
};

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @param {Array} orderData.items - Array of {productId, quantity}
 * @returns {Promise<Object>}
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, orderData);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Đặt hàng thành công",
    };
  } catch (error) {
    // Log full error for debugging
    if (__DEV__) {
      console.error(
        "[createOrder] error:",
        JSON.stringify(error.response?.data ?? error.message, null, 2),
      );
      console.error(
        "[createOrder] payload sent:",
        JSON.stringify(orderData, null, 2),
      );
    }

    // Handle specific error cases
    if (error.response?.status === 400) {
      // Get validation error details
      const details = error.response?.data?.error?.details;
      let errorMessage = error.response?.data?.message || "Validation error";

      // Format validation errors if available
      if (Array.isArray(details) && details.length > 0) {
        const errors = details.map((d) => d.message || d).join(", ");
        errorMessage = errors || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    if (error.response?.status === 500) {
      // Surface BE error message if available, otherwise generic
      const beMessage =
        error.response?.data?.message || error.response?.data?.error?.message;
      return {
        success: false,
        message: beMessage
          ? `Lỗi máy chủ: ${beMessage}`
          : "Máy chủ gặp lỗi. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
      };
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Đặt hàng thất bại. Vui lòng thử lại.",
    };
  }
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>}
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const endpoint = API_ENDPOINTS.ORDERS.CANCEL.replace(":id", orderId);
    const response = await api.post(endpoint, { reason, cancelReason: reason });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Hủy đơn hàng thành công",
    };
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Không thể hủy đơn hàng ở trạng thái hiện tại",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        message: "Bạn không có quyền hủy đơn hàng này",
      };
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Hủy đơn hàng thất bại. Vui lòng thử lại.",
    };
  }
};

/**
 * Format order status to Vietnamese
 * @param {string} status - Order status
 * @returns {string}
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    NEW: "Chờ thanh toán",
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    WAITING_CUSTOMER: "Đang chuẩn bị",
    WAITING_PRODUCT: "Chờ hàng",
    PROCESSING: "Đang xử lý",
    READY: "Sẵn sàng giao / nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };
  return statusMap[status] || status;
};

/**
 * Get order status color
 * @param {string} status - Order status
 * @returns {string}
 */
export const getOrderStatusColor = (status) => {
  const colorMap = {
    NEW: "#3B82F6", // blue - Chờ thanh toán
    PENDING_PAYMENT: "#F97316", // orange - Chờ thanh toán (prescription)
    CONFIRMED: "#8B5CF6", // purple - Đã xác nhận
    WAITING_CUSTOMER: "#EC4899", // pink - Đang chuẩn bị
    WAITING_PRODUCT: "#F59E0B", // amber - Chờ hàng
    PROCESSING: "#F97316", // orange - Đang xử lý
    READY: "#10B981", // green - Sẵn sàng
    COMPLETED: "#059669", // emerald - Hoàn thành
    CANCELLED: "#EF4444", // red - Đã hủy
  };
  return colorMap[status] || "#6B7280"; // gray default
};

/**
 * Get order status icon
 * @param {string} status - Order status
 * @returns {string}
 */
export const getOrderStatusIcon = (status) => {
  const iconMap = {
    NEW: "document-text-outline",
    PENDING_PAYMENT: "time-outline",
    CONFIRMED: "checkmark-circle-outline",
    WAITING_CUSTOMER: "person-outline",
    WAITING_PRODUCT: "cube-outline",
    PROCESSING: "sync-outline",
    READY: "gift-outline",
    COMPLETED: "checkmark-done-outline",
    CANCELLED: "close-circle-outline",
  };
  return iconMap[status] || "document-outline";
};

/**
 * Format price
 * @param {number|string} price - Price value
 * @returns {number}
 */
export const formatPrice = (price) => {
  if (typeof price === "string") {
    return parseFloat(price);
  }
  return price;
};
