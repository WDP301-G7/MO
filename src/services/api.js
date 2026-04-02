import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { API_URL, API_ENDPOINTS } from "../constants/api";
import { navigationRef } from "../utils/navigationService";

// Import forceLogout to handle token expiration
let forceLogout;
// Lazy load to avoid circular dependency
const getForceLogout = async () => {
  if (!forceLogout) {
    const authService = await import("./authService");
    forceLogout = authService.forceLogout;
  }
  return forceLogout;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];
let isBannedLogoutInProgress = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for banned account on ANY 401 — before refresh logic, before _retry check
    if (error.response?.status === 401 && !isBannedLogoutInProgress) {
      const responseMessage = error.response?.data?.message ?? "";

      const isBanned =
        responseMessage.includes("bị khóa") ||
        responseMessage.includes("bị cấm") ||
        responseMessage.toLowerCase().includes("banned");

      if (isBanned) {
        isBannedLogoutInProgress = true;
        await AsyncStorage.multiRemove([
          "userToken",
          "refreshToken",
          "userData",
        ]);
        Alert.alert(
          "Tài khoản bị khóa",
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ để được giải quyết.",
          [
            {
              text: "OK",
              onPress: () => {
                isBannedLogoutInProgress = false;
                if (navigationRef.current) {
                  navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                }
              },
            },
          ],
          { cancelable: false },
        );
        return Promise.reject(error);
      }
    }

    // Don't retry on certain endpoints or if we've already tried
    const skipRefresh =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    // If error is 401 and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefresh
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, user needs to login again
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("userData");

        // Trigger force logout
        const logout = await getForceLogout();
        await logout();

        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {
            refreshToken,
          },
        );

        // Backend có thể trả về data.tokens.accessToken hoặc data.token
        const newToken =
          response.data.data?.tokens?.accessToken || response.data.token;

        if (!newToken) {
          throw new Error("No token in refresh response");
        }

        await AsyncStorage.setItem("userToken", newToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Refresh failed, clear tokens and trigger logout
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("userData");

        // Trigger force logout to navigate to login screen
        const logout = await getForceLogout();
        await logout();

        processQueue(refreshError, null);
        // Refresh failed, clear tokens
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("userData");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
