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

    // Backend trả về data.tokens.accessToken và data.tokens.refreshToken
    const accessToken =
      response.data.data?.tokens?.accessToken || response.data.token;
    const refreshToken =
      response.data.data?.tokens?.refreshToken || response.data.refreshToken;
    const userData = response.data.data?.user || response.data.user;

    // Save tokens to AsyncStorage
    if (accessToken) {
      await AsyncStorage.setItem("userToken", accessToken);

      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      if (userData) {
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      }
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
 * @returns {Promise<Object>}
 */
export const logout = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    // Call logout API if token exists
    if (token) {
      try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        // Continue with local logout even if API fails
      }
    }

    // Clear all auth data from AsyncStorage
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userData");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Đăng xuất thất bại",
    };
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

/**
 * Refresh access token
 * @returns {Promise<Object>}
 */
export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      return {
        success: false,
        message: "No refresh token available",
      };
    }

    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    // Update access token
    if (response.data.token) {
      await AsyncStorage.setItem("userToken", response.data.token);
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
        "Làm mới token thất bại",
    };
  }
};

/**
 * Get user profile from server
 * @returns {Promise<Object>}
 */
export const getProfile = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);

    // Backend response structure: { statusCode, message, data: { user data }, error }
    const userData = response.data.data;

    // Update local user data
    if (userData) {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    }

    return {
      success: true,
      data: userData,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin người dùng",
    };
  }
};

/**
 * Change user password
 * @param {Object} passwords - Old and new passwords
 * @param {string} passwords.oldPassword - Current password
 * @param {string} passwords.newPassword - New password
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwords) => {
  try {
    // Check if token exists
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    const response = await api.post(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      passwords,
    );

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Đổi mật khẩu thành công",
    };
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      return {
        success: false,
        message:
          "Mật khẩu hiện tại không đúng hoặc phiên đăng nhập đã hết hạn.",
      };
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.",
    };
  }
};

/**
 * Update user profile with optional avatar upload
 * @param {string} userId - User ID
 * @param {Object} data - Profile data
 * @param {string} data.fullName - Full name
 * @param {string} data.address - Address
 * @param {Object} data.avatar - Avatar file object (optional) { uri, name, type }
 * @returns {Promise<Object>}
 */
export const updateProfile = async (userId, data) => {
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

    if (data.fullName) {
      formData.append("fullName", data.fullName);
    }
    if (data.address) {
      formData.append("address", data.address);
    }

    // Add avatar if provided
    if (data.avatar) {
      formData.append("avatar", {
        uri: data.avatar.uri,
        name: data.avatar.name || "avatar.jpg",
        type: data.avatar.type || "image/jpeg",
      });
    }

    const endpoint = API_ENDPOINTS.USERS.UPDATE.replace(":id", userId);
    const response = await api.put(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const userData = response.data.data;

    // Update local user data
    if (userData) {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    }

    return {
      success: true,
      data: userData,
      message: response.data.message || "Cập nhật thông tin thành công",
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return {
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Cập nhật thông tin thất bại. Vui lòng thử lại.",
    };
  }
};

/**
 * Get access token
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    return null;
  }
};
