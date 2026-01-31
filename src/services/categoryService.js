import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Get all categories with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query (optional)
 * @returns {Promise<Object>} Response with categories data and pagination
 */
export const getCategories = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = "" } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      queryParams.append("search", search);
    }

    const response = await api.get(
      `${API_ENDPOINTS.CATEGORIES.LIST}?${queryParams.toString()}`,
    );

    // Backend response: { statusCode, message, data: { data: [...], pagination: {...} }, error }
    return {
      success: true,
      data: response.data.data.data, // Array of categories
      pagination: response.data.data.pagination,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh mục sản phẩm",
      data: [],
      pagination: null,
    };
  }
};

/**
 * Get category by ID
 * @param {string} id - Category UUID
 * @returns {Promise<Object>} Response with category data
 */
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.CATEGORIES.DETAIL.replace(":id", id),
    );

    // Backend response: { statusCode, message, data: { category data }, error }
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
        "Không thể tải thông tin danh mục",
      data: null,
    };
  }
};
