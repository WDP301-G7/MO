import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, API_ENDPOINTS } from "../constants/api";

/**
 * Get list of stores
 * @returns {Promise<Object>}
 */
export const getStores = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.STORES.LIST}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Không thể tải danh sách cửa hàng");
    }

    // Handle different response formats
    // Backend returns: { data: { data: [...], pagination: {...} } }
    const storesData =
      result.data?.data || result.data || result.stores || result;

    return {
      success: true,
      data: Array.isArray(storesData) ? storesData : [],
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Đã có lỗi xảy ra khi tải danh sách cửa hàng",
    };
  }
};

/**
 * Create prescription request with images
 * @param {Object} params
 * @param {string} params.phone - Phone number
 * @param {string} params.storeId - Store ID
 * @param {string} params.consultationType - PHONE | IN_STORE
 * @param {string} params.symptoms - Symptoms description (optional)
 * @param {Array} params.images - Array of image objects { uri, name, type }
 * @returns {Promise<Object>}
 */
export const createPrescriptionRequest = async (params) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    formData.append("phone", params.phone);
    formData.append("storeId", params.storeId);
    formData.append("consultationType", params.consultationType);

    if (params.symptoms) {
      formData.append("symptoms", params.symptoms);
    }

    // Add images (1-3 images)
    if (params.images && params.images.length > 0) {
      params.images.forEach((image) => {
        formData.append("images", {
          uri: image.uri,
          name: image.name || `prescription_${Date.now()}.jpg`,
          type: image.type || "image/jpeg",
        });
      });
    }

    const response = await fetch(
      `${API_URL}${API_ENDPOINTS.PRESCRIPTION_REQUESTS.CREATE}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, let RN set it with boundary
        },
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Không thể tạo yêu cầu tư vấn");
    }

    return {
      success: true,
      data: result.data,
      message: result.message || "Tạo yêu cầu tư vấn thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Đã có lỗi xảy ra khi tạo yêu cầu tư vấn",
    };
  }
};

/**
 * Get list of my prescription requests
 * @returns {Promise<Object>}
 */
export const getMyPrescriptionRequests = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    const response = await fetch(
      `${API_URL}${API_ENDPOINTS.PRESCRIPTION_REQUESTS.LIST}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Không thể tải danh sách yêu cầu tư vấn",
      );
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.message || "Đã có lỗi xảy ra khi tải danh sách yêu cầu tư vấn",
    };
  }
};

/**
 * Get prescription request detail
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
export const getPrescriptionRequestDetail = async (requestId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    const endpoint = API_ENDPOINTS.PRESCRIPTION_REQUESTS.DETAIL.replace(
      ":id",
      requestId,
    );

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Không thể tải chi tiết yêu cầu tư vấn",
      );
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.message || "Đã có lỗi xảy ra khi tải chi tiết yêu cầu tư vấn",
    };
  }
};

/**
 * Get order prescription details
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
export const getOrderPrescription = async (orderId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    const endpoint = API_ENDPOINTS.ORDERS.PRESCRIPTION.replace(":id", orderId);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Không thể tải thông tin đơn thuốc");
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Đã có lỗi xảy ra khi tải thông tin đơn thuốc",
    };
  }
};

// Status labels for UI
export const PRESCRIPTION_STATUS = {
  PENDING: {
    label: "Chờ tư vấn",
    color: "#FFA500",
    description: "Tư vấn viên sẽ liên hệ trong 1-2 giờ",
    icon: "time-outline",
  },
  CONTACTING: {
    label: "Đang tư vấn",
    color: "#2196F3",
    description: "Tư vấn viên đang liên hệ với bạn",
    icon: "call-outline",
  },
  QUOTED: {
    label: "Đã báo giá",
    color: "#9C27B0",
    description: "Bạn có báo giá mới, vui lòng thanh toán",
    icon: "document-text-outline",
  },
  ACCEPTED: {
    label: "Đã xác nhận",
    color: "#4CAF50",
    description: "Đơn hàng đã được xác nhận",
    icon: "checkmark-circle-outline",
  },
  SCHEDULED: {
    label: "Đã đặt lịch",
    color: "#00BCD4",
    description: "Bạn có lịch hẹn tại cửa hàng",
    icon: "calendar-outline",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    color: "#9E9E9E",
    description: "Báo giá đã hết hạn",
    icon: "close-circle-outline",
  },
  LOST: {
    label: "Đã đóng",
    color: "#F44336",
    description: "Yêu cầu đã được đóng",
    icon: "ban-outline",
  },
};

// Consultation type options
export const CONSULTATION_TYPES = {
  PHONE: { label: "Tư vấn qua điện thoại", icon: "call-outline" },
  IN_STORE: { label: "Tư vấn tại cửa hàng", icon: "storefront-outline" },
};
