import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Get total available quantity for a product across all stores
 * @param {string} productId - Product UUID
 * @returns {Promise<Object>} Response with available quantity
 */
export const getProductAvailableQuantity = async (productId) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.INVENTORY.PRODUCT_AVAILABLE.replace(
        ":productId",
        productId,
      ),
    );

    // Backend response: { statusCode, message, data: { totalAvailable, ... }, error }
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
        "Không thể kiểm tra số lượng sản phẩm",
      data: null,
    };
  }
};

/**
 * Get inventory for a specific product across all stores
 * @param {string} productId - Product UUID
 * @returns {Promise<Object>} Response with inventory by store
 */
export const getProductInventory = async (productId) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.INVENTORY.PRODUCT.replace(":productId", productId),
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
        "Không thể tải thông tin tồn kho",
      data: [],
    };
  }
};
