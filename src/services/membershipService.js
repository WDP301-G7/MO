import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Get current user's membership status and tier progress
 * @returns {Promise<Object>}
 */
export const getMyMembership = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.MEMBERSHIP.MY_STATUS);
    // data may sit at response.data.data or directly at response.data
    const raw = response.data.data ?? response.data;
    return {
      success: true,
      data: raw,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin membership",
    };
  }
};

/**
 * Get current user's tier change history
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getMyMembershipHistory = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.MEMBERSHIP.MY_HISTORY}?page=${page}&limit=${limit}`,
    );
    const payload = response.data.data;
    return {
      success: true,
      data: payload?.data || [],
      meta: payload?.meta || null,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      meta: null,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải lịch sử membership",
    };
  }
};

/**
 * Get all membership tiers (public, no auth required)
 * @returns {Promise<Object>}
 */
export const getAllTiers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.MEMBERSHIP.TIERS);
    const raw = response.data.data;
    // Handle both plain array and paginated { data: [...], meta: {} } envelope
    const tiersArray = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];
    return {
      success: true,
      data: tiersArray,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách tier",
    };
  }
};

/**
 * Format currency in VND
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "0đ";
  return `${Number(amount).toLocaleString("vi-VN")}đ`;
};

/**
 * Get tier display color
 */
export const getTierColor = (tierName) => {
  switch ((tierName || "").toLowerCase()) {
    case "gold":
      return "#F59E0B";
    case "silver":
      return "#6B7280";
    case "bronze":
      return "#92400E";
    default:
      return "#2E86AB";
  }
};

/**
 * Get tier icon name (Ionicons)
 */
export const getTierIcon = (tierName) => {
  switch ((tierName || "").toLowerCase()) {
    case "gold":
      return "medal";
    case "silver":
      return "medal-outline";
    case "bronze":
      return "star";
    default:
      return "person-circle-outline";
  }
};

/**
 * Get reason label in Vietnamese
 */
export const getReasonLabel = (reason) => {
  switch (reason) {
    case "ORDER_COMPLETED":
      return "Đơn hàng hoàn thành";
    case "PERIOD_RESET":
      return "Kỳ đánh giá mới";
    case "ADMIN_MANUAL":
      return "Admin điều chỉnh";
    default:
      return reason || "Không xác định";
  }
};
