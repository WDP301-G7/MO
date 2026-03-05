import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Return & Exchange Service - Customer APIs
 */

/**
 * Create a return/exchange/warranty request with images
 * @param {Object} params
 * @param {string} params.orderId - Order ID (UUID)
 * @param {string} params.type - RETURN | EXCHANGE | WARRANTY
 * @param {string} params.reason - Reason for return (min 10, max 500 chars)
 * @param {string} [params.description] - Detailed description (max 1000 chars)
 * @param {Array} params.items - Array of return items
 * @param {Array} [params.images] - Array of image objects from expo-image-picker
 * @returns {Promise<Object>}
 */
export const createReturnRequest = async (params) => {
  try {
    const formData = new FormData();

    // Required fields
    formData.append("orderId", params.orderId);
    formData.append("type", params.type);
    formData.append("reason", params.reason);

    // Optional description
    if (params.description) {
      formData.append("description", params.description);
    }

    // ⚠️ CRITICAL: items must be JSON string, not object
    const itemsJson = JSON.stringify(params.items);
    formData.append("items", itemsJson);

    // Append images if provided
    if (params.images && params.images.length > 0) {
      params.images.forEach((image, index) => {
        // Handle both expo-image-picker and react-native-image-picker formats
        formData.append("images", {
          uri: image.uri,
          type: image.mimeType || image.type || "image/jpeg",
          name: image.fileName || image.filename || `return_${Date.now()}.jpg`,
        });
      });
    }

    // IMPORTANT: Delete default Content-Type header to let axios auto-detect FormData
    // Axios will automatically set multipart/form-data with proper boundary
    const response = await api.post(API_ENDPOINTS.RETURNS.CREATE, formData, {
      headers: {
        "Content-Type": undefined, // Let axios set the correct multipart header
      },
      timeout: 30000, // 30s for image uploads
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Tạo yêu cầu đổi/trả thành công",
    };
  } catch (error) {
    // Better error logging
    console.error("createReturnRequest error details:");
    console.error("- Status:", error.response?.status);
    console.error("- Headers:", error.response?.headers);

    // Check if response is HTML (503 error from proxy/cache)
    const responseData = error.response?.data;
    if (
      typeof responseData === "string" &&
      responseData.includes("<!DOCTYPE html>")
    ) {
      console.error("- Response: HTML error page (503 Backend Error)");
      return {
        success: false,
        message: "Server đang bảo trì hoặc quá tải. Vui lòng thử lại sau.",
        error: { type: "BACKEND_ERROR", status: error.response?.status },
      };
    }

    console.error("- Response data:", responseData);

    // Log validation error details
    if (responseData?.error?.details) {
      console.error(
        "- Validation details:",
        JSON.stringify(responseData.error.details, null, 2),
      );
    }

    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Get customer's return requests with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} [status] - Filter by status
 * @param {string} [type] - Filter by type
 * @returns {Promise<Object>}
 */
export const getMyReturns = async (
  page = 1,
  limit = 10,
  status = null,
  type = null,
) => {
  try {
    let url = `${API_ENDPOINTS.RETURNS.MY_RETURNS}?page=${page}&limit=${limit}`;

    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;

    const response = await api.get(url);

    // Handle different response structures
    let returnsData = [];
    let paginationInfo = null;

    if (response.data.data) {
      if (Array.isArray(response.data.data)) {
        returnsData = response.data.data;
        paginationInfo = response.data.meta || response.data.pagination;
      } else if (response.data.data.data) {
        returnsData = response.data.data.data;
        paginationInfo =
          response.data.data.meta || response.data.data.pagination;
      }
    }

    return {
      success: true,
      data: returnsData,
      pagination: paginationInfo,
      message: response.data.message,
    };
  } catch (error) {
    console.error("getMyReturns error:", error.response?.data || error);
    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Get return request detail by ID
 * @param {string} returnId - Return request ID (UUID)
 * @returns {Promise<Object>}
 */
export const getReturnDetail = async (returnId) => {
  try {
    const endpoint = API_ENDPOINTS.RETURNS.DETAIL.replace(":id", returnId);
    const response = await api.get(endpoint);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("getReturnDetail error:", error.response?.data || error);
    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Cancel a return request (only when status = PENDING)
 * @param {string} returnId - Return request ID (UUID)
 * @returns {Promise<Object>}
 */
export const cancelReturnRequest = async (returnId) => {
  try {
    const endpoint = API_ENDPOINTS.RETURNS.DELETE.replace(":id", returnId);
    const response = await api.delete(endpoint);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Hủy yêu cầu thành công",
    };
  } catch (error) {
    console.error("cancelReturnRequest error:", error.response?.data || error);
    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Upload additional images to an existing return request
 * @param {string} returnId - Return request ID (UUID)
 * @param {Array} images - Array of image objects from image picker
 * @returns {Promise<Object>}
 */
export const uploadReturnImages = async (returnId, images) => {
  try {
    if (!images || images.length === 0) {
      return {
        success: false,
        message: "Vui lòng chọn ít nhất 1 ảnh",
      };
    }

    const formData = new FormData();
    formData.append("imageType", "CUSTOMER_PROOF");

    images.forEach((image) => {
      formData.append("images", {
        uri: image.uri,
        type: image.mimeType || image.type || "image/jpeg",
        name: image.fileName || image.filename || `return_${Date.now()}.jpg`,
      });
    });

    const endpoint = API_ENDPOINTS.RETURNS.UPLOAD_IMAGES.replace(
      ":id",
      returnId,
    );
    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": undefined, // Let axios auto-detect FormData
      },
      timeout: 30000,
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Upload ảnh thành công",
    };
  } catch (error) {
    console.error("uploadReturnImages error:", error.response?.data || error);
    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Delete an image from return request
 * @param {string} returnId - Return request ID (UUID)
 * @param {string} imageId - Image ID (UUID)
 * @returns {Promise<Object>}
 */
export const deleteReturnImage = async (returnId, imageId) => {
  try {
    const endpoint = API_ENDPOINTS.RETURNS.DELETE_IMAGE.replace(
      ":id",
      returnId,
    ).replace(":imageId", imageId);
    const response = await api.delete(endpoint);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Xóa ảnh thành công",
    };
  } catch (error) {
    console.error("deleteReturnImage error:", error.response?.data || error);
    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Get orders with status COMPLETED for return request creation
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
export const getCompletedOrders = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.ORDERS.MY_ORDERS}?status=COMPLETED&page=${page}&limit=${limit}`,
    );

    let ordersData = [];
    let paginationInfo = null;

    if (response.data.data) {
      if (Array.isArray(response.data.data)) {
        ordersData = response.data.data;
        paginationInfo = response.data.meta || response.data.pagination;
      } else if (response.data.data.data) {
        ordersData = response.data.data.data;
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
    console.error("getCompletedOrders error:", error.response?.data || error);
    return {
      success: false,
      message: handleReturnApiError(error),
      error: error.response?.data,
    };
  }
};

/**
 * Handle return API errors and return user-friendly messages
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
export const handleReturnApiError = (error) => {
  if (error.response) {
    const {
      statusCode,
      message,
      error: errorDetails,
    } = error.response.data || {};

    // Validation errors
    if (statusCode === 400 && errorDetails?.code === "VALIDATION_ERROR") {
      const details = errorDetails.details || [];
      return details.map((d) => d.message).join("\n") || message;
    }

    switch (statusCode) {
      case 400:
        // Business rule violations
        if (message?.includes("Order chưa hoàn thành")) {
          return "Chỉ có thể đổi/trả đơn hàng đã hoàn thành";
        }
        if (message?.includes("đã quá hạn")) {
          return "Đơn hàng đã quá hạn đổi/trả (7 ngày cho trả hàng, 15 ngày cho bảo hành)";
        }
        if (message?.includes("không thể đổi/trả")) {
          return "Sản phẩm này không được phép đổi/trả";
        }
        if (message?.includes("đã có yêu cầu")) {
          return "Đơn hàng này đã có yêu cầu đổi/trả đang xử lý";
        }
        return message || "Dữ liệu không hợp lệ";

      case 401:
        return "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại";

      case 403:
        return "Bạn không có quyền thực hiện thao tác này";

      case 404:
        if (message?.includes("Order")) return "Không tìm thấy đơn hàng";
        if (message?.includes("Return"))
          return "Không tìm thấy yêu cầu đổi/trả";
        return "Không tìm thấy dữ liệu";

      case 409:
        return message || "Dữ liệu đã tồn tại";

      default:
        return message || "Đã có lỗi xảy ra, vui lòng thử lại";
    }
  }

  if (error.code === "ECONNABORTED") {
    return "Kết nối quá chậm, vui lòng thử lại";
  }

  return error.message || "Không thể kết nối đến server";
};

/**
 * Constants for return types, statuses, and conditions
 */
export const RETURN_TYPES = {
  RETURN: "RETURN",
  EXCHANGE: "EXCHANGE",
  WARRANTY: "WARRANTY",
};

export const RETURN_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const PRODUCT_CONDITIONS = {
  NEW: "NEW",
  LIKE_NEW: "LIKE_NEW",
  GOOD: "GOOD",
  DEFECTIVE: "DEFECTIVE",
};

export const RETURN_TYPE_LABELS = {
  RETURN: { label: "Trả hàng hoàn tiền", icon: "💰" },
  EXCHANGE: { label: "Đổi sản phẩm khác", icon: "🔄" },
  WARRANTY: { label: "Bảo hành", icon: "🛡️" },
};

export const RETURN_STATUS_LABELS = {
  PENDING: {
    label: "Chờ duyệt",
    color: "#FFA500",
    description: "Yêu cầu đang chờ xét duyệt",
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "#2196F3",
    description:
      "Yêu cầu đã được phê duyệt, vui lòng mang sản phẩm đến cửa hàng",
  },
  REJECTED: {
    label: "Đã từ chối",
    color: "#F44336",
    description: "Yêu cầu không được chấp nhận",
  },
  COMPLETED: {
    label: "Hoàn tất",
    color: "#4CAF50",
    description: "Đã hoàn tất xử lý",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#9E9E9E",
    description: "Bạn đã hủy yêu cầu",
  },
};

export const PRODUCT_CONDITION_LABELS = {
  NEW: {
    label: "Mới",
    icon: "✨",
    description: "Chưa sử dụng, nguyên seal",
  },
  LIKE_NEW: {
    label: "Như mới",
    icon: "⭐",
    description: "Đã mở hộp nhưng chưa dùng",
  },
  GOOD: {
    label: "Tốt",
    icon: "👍",
    description: "Đã sử dụng, không có lỗi",
  },
  DEFECTIVE: {
    label: "Bị lỗi",
    icon: "⚠️",
    description: "Có vấn đề cần bảo hành",
  },
};

export const RETURN_REASONS = [
  {
    id: 1,
    value: "Sản phẩm bị lỗi/hư hỏng",
    icon: "alert-circle-outline",
    applicable: ["RETURN", "WARRANTY"],
  },
  {
    id: 2,
    value: "Giao sai sản phẩm",
    icon: "swap-horizontal-outline",
    applicable: ["RETURN", "EXCHANGE"],
  },
  {
    id: 3,
    value: "Sản phẩm không vừa với khuôn mặt",
    icon: "resize-outline",
    applicable: ["RETURN", "EXCHANGE"],
  },
  {
    id: 4,
    value: "Không đúng mô tả/hình ảnh",
    icon: "image-outline",
    applicable: ["RETURN", "EXCHANGE"],
  },
  {
    id: 5,
    value: "Đổi ý, không muốn mua nữa",
    icon: "close-circle-outline",
    applicable: ["RETURN"],
  },
  {
    id: 6,
    value: "Muốn đổi mẫu khác",
    icon: "shuffle-outline",
    applicable: ["EXCHANGE"],
  },
  {
    id: 7,
    value: "Sản phẩm giả, kém chất lượng",
    icon: "warning-outline",
    applicable: ["RETURN"],
  },
  {
    id: 8,
    value: "Lý do khác",
    icon: "ellipsis-horizontal-outline",
    applicable: ["RETURN", "EXCHANGE", "WARRANTY"],
  },
];

export const REFUND_METHODS = {
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
  WALLET: "WALLET",
  ORIGINAL_PAYMENT: "ORIGINAL_PAYMENT",
};

export const REFUND_METHOD_LABELS = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CASH: "Tiền mặt",
  WALLET: "Ví điện tử",
  ORIGINAL_PAYMENT: "Hoàn về phương thức thanh toán gốc",
};
