import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Get all products with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.categoryId - Filter by category UUID
 * @param {string} params.type - Filter by type: FRAME, LENS, SERVICE
 * @param {number} params.minPrice - Minimum price
 * @param {number} params.maxPrice - Maximum price
 * @param {boolean} params.isPreorder - Filter preorder products
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Response with products data and pagination
 */
export const getProducts = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      type,
      minPrice,
      maxPrice,
      isPreorder,
      search,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (categoryId) queryParams.append("categoryId", categoryId);
    if (type) queryParams.append("type", type);
    if (minPrice !== undefined)
      queryParams.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined)
      queryParams.append("maxPrice", maxPrice.toString());
    if (isPreorder !== undefined)
      queryParams.append("isPreorder", isPreorder.toString());
    if (search) queryParams.append("search", search);

    const response = await api.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`,
    );

    // Backend response: { statusCode, message, data: { data: [...], pagination: {...} }, error }
    return {
      success: true,
      data: response.data.data.data, // Array of products
      pagination: response.data.data.pagination,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách sản phẩm",
      data: [],
      pagination: null,
    };
  }
};

/**
 * Get product by ID
 * @param {string} id - Product UUID
 * @returns {Promise<Object>} Response with product data
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.PRODUCTS.DETAIL.replace(":id", id),
    );

    // Backend response: { statusCode, message, data: { product data }, error }
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
        "Không thể tải thông tin sản phẩm",
      data: null,
    };
  }
};

/**
 * Get all images for a product
 * @param {string} productId - Product UUID
 * @returns {Promise<Object>} Response with product images
 */
export const getProductImages = async (productId) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.PRODUCTS.IMAGES.replace(":id", productId),
    );

    // Backend response: { statusCode, message, data: [...], error }
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
        "Không thể tải ảnh sản phẩm",
      data: [],
    };
  }
};

/**
 * Format price from API (string) to number
 * @param {string} price - Price string from API
 * @returns {number} Price as number
 */
export const formatPrice = (price) => {
  return parseFloat(price) || 0;
};

/**
 * Get product type label in Vietnamese
 * @param {string} type - Product type: FRAME, LENS, SERVICE
 * @returns {string} Type label
 */
export const getProductTypeLabel = (type) => {
  const typeMap = {
    FRAME: "Gọng kính",
    LENS: "Tròng kính",
    SERVICE: "Dịch vụ",
  };
  return typeMap[type] || type;
};
