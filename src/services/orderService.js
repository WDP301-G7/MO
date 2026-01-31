import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Get customer's orders
 * @returns {Promise<Object>}
 */
export const getMyOrders = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ORDERS.MY_ORDERS);

    return {
      success: true,
      data: response.data.data || [],
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
    // Log detailed error for debugging
    console.error(
      "Create order error - Full response:",
      JSON.stringify(error.response?.data, null, 2),
    );

    if (error.response?.data?.error?.details) {
      console.error(
        "Validation details:",
        JSON.stringify(error.response.data.error.details, null, 2),
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
    const response = await api.post(endpoint, { reason });

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
    NEW: "Mới tạo",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    READY: "Sẵn sàng",
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
    NEW: "#3B82F6", // blue
    CONFIRMED: "#8B5CF6", // purple
    PROCESSING: "#F59E0B", // amber
    READY: "#10B981", // green
    COMPLETED: "#059669", // emerald
    CANCELLED: "#EF4444", // red
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
    CONFIRMED: "checkmark-circle-outline",
    PROCESSING: "sync-outline",
    READY: "cube-outline",
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
