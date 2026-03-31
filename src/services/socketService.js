import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

/**
 * Socket.IO Service - Manages real-time connection for notifications
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  /**
   * Connect to Socket.IO server and authenticate
   * @param {string} token - JWT access token
   */
  async connect(token) {
    if (this.socket?.connected) {
      return;
    }

    try {
      // Extract base URL (remove /api if present)
      const baseURL = API_URL.replace("/api", "");

      this.socket = io(baseURL, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Setup event listeners
      this.socket.on("connect", () => {
        this.isConnected = true;
        this.authenticate(token);
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
      });

      this.socket.on("authenticated", (data) => {
        this.emit("authenticated", data);
      });

      this.socket.on("auth_error", (error) => {
        this.emit("auth_error", error);
      });

      this.socket.on("notification", (notification) => {
        this.emit("notification", notification);
      });

      this.socket.on("unread_count", (data) => {
        this.emit("unread_count", data);
      });

      this.socket.on("connect_error", (error) => {
        // Silent error
      });
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Send authenticate event to server
   * @param {string} token - JWT access token
   */
  authenticate(token) {
    if (!this.socket || !token) {
      return;
    }
    this.socket.emit("authenticate", { token });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners = {};
    }
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  /**
   * Emit event to local listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        // Silent error
      }
    });
  }

  /**
   * Initialize socket connection with stored token
   */
  async initialize() {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        await this.connect(token);
      }
    } catch (error) {
      // Silent error
    }
  }
}

export const socketService = new SocketService();
export default socketService;
