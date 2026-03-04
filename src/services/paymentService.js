/**
 * Payment Handler with VNPay Integration
 *
 * Xử lý thanh toán VNPay và nhận deeplink từ backend
 */

import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Tạo payment và lấy VNPay payment URL
 * POST /api/payments/:orderId/create
 *
 * @param {string} orderId - Order ID
 * @returns {Promise} - {success, data: {paymentUrl, paymentId, orderId, amount}, message}
 */
export const createVNPayPayment = async (orderId) => {
  try {
    // Replace :orderId in endpoint path
    const endpoint = API_ENDPOINTS.PAYMENTS.CREATE.replace(":orderId", orderId);
    const response = await api.post(endpoint);

    return {
      success: true,
      data: response.data.data, // Extract inner data object
      message: response.data.message || "Tạo thanh toán thành công",
    };
  } catch (error) {
    console.error("Create VNPay payment error:", error.response?.data || error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo thanh toán. Vui lòng thử lại.",
    };
  }
};

/**
 * Verify payment status sau khi return từ VNPay
 * GET /api/payments/:id
 *
 * @param {string} paymentId - Payment ID
 * @returns {Promise} - {success, data, message}
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const endpoint = API_ENDPOINTS.PAYMENTS.DETAIL.replace(":id", paymentId);
    const response = await api.get(endpoint);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Get payment details error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy thông tin thanh toán",
    };
  }
};

/**
 * Get payment by order ID
 * GET /api/payments/order/:orderId
 *
 * @param {string} orderId - Order ID
 * @returns {Promise} - {success, data, message}
 */
export const getPaymentByOrderId = async (orderId) => {
  try {
    const endpoint = API_ENDPOINTS.PAYMENTS.BY_ORDER.replace(
      ":orderId",
      orderId,
    );
    const response = await api.get(endpoint);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Get payment by order error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy thông tin thanh toán",
    };
  }
};

/**
 * Handle VNPay return - Xử lý khi người dùng quay lại từ VNPay
 * GET /api/payments/vnpay/return
 *
 * @param {Object} returnParams - VNPay return parameters
 * @returns {Promise} - {success, data, message}
 */
export const handleVNPayReturn = async (returnParams) => {
  try {
    const queryString = new URLSearchParams(returnParams).toString();
    const response = await api.get(
      `${API_ENDPOINTS.PAYMENTS.VNPAY_RETURN}?${queryString}`,
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Thanh toán thành công",
    };
  } catch (error) {
    console.error("VNPay return error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Xử lý kết quả thanh toán thất bại",
    };
  }
};

// Helper to format price
export const formatPrice = (price) => {
  if (typeof price === "string") {
    return parseFloat(price);
  }
  return price;
};
