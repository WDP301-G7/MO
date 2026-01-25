import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.fullName - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.phone - Phone number
 * @param {string} userData.password - Password
 * @param {string} userData.address - Address
 * @returns {Promise<Object>} Response data
 */
export const register = async (userData) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại.",
    };
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response data with token
 */
export const login = async (credentials) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

    // Save token to AsyncStorage
    if (response.data.token) {
      await AsyncStorage.setItem("userToken", response.data.token);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(response.data.user),
      );
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
    };
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
export const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Get current user data
 * @returns {Promise<Object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};
