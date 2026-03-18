import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

// Cần để browser đóng sau khi authenticate
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CONFIG = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Web Client ID (bắt buộc)
};

/**
 * Configure Google Sign-In
 * Hook để sử dụng trong component
 */
export const useGoogleAuth = () => {
  // iOS Client ID yêu cầu redirect URI format đặc biệt
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "";
  const iosAppId = iosClientId.split(".apps.googleusercontent.com")[0];
  const iosRedirectUri = `com.googleusercontent.apps.${iosAppId}:/oauth2redirect`;

  // Dùng useAuthRequest để có code verifier cho PKCE
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: Platform.select({
        ios: GOOGLE_OAUTH_CONFIG.iosClientId,
        android: GOOGLE_OAUTH_CONFIG.androidClientId,
        default: GOOGLE_OAUTH_CONFIG.webClientId,
      }),
      redirectUri: Platform.OS === "ios" ? iosRedirectUri : undefined,
      scopes: ["openid", "profile", "email"],
      usePKCE: true,
      responseType: "code",
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    },
  );

  return { request, response, promptAsync };
};

/**
 * Sign in with Google using Expo AuthSession
 * @param {Function} promptAsync - Function từ useGoogleAuth hook
 * @param {Object} request - Request object từ useGoogleAuth hook
 * @returns {Promise<Object>} { success, idToken, accessToken, user }
 */
export const signInWithGoogle = async (promptAsync, request) => {
  try {
    const result = await promptAsync();

    if (result.type === "success") {
      let authentication = result.authentication;

      // Nếu authentication null, phải exchange code manually
      if (!authentication && result.params?.code) {
        // Exchange code for tokens với PKCE code_verifier
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code: result.params.code,
              client_id: GOOGLE_OAUTH_CONFIG.iosClientId,
              redirect_uri:
                "com.googleusercontent.apps.263008296948-bl7kq5bg7n6fhiiquulcr71lqgib2doa:/oauth2redirect",
              grant_type: "authorization_code",
              code_verifier: request?.codeVerifier,
            }).toString(),
          },
        );

        const tokens = await tokenResponse.json();

        if (tokens.error) {
          // Token exchange failed - có thể do code đã hết hạn hoặc đã dùng rồi
          throw new Error(
            `Token exchange failed: ${tokens.error} - ${tokens.error_description || ""}. Vui lòng thử đăng nhập lại.`,
          );
        }

        if (tokens.access_token) {
          authentication = {
            accessToken: tokens.access_token,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token,
          };
        } else {
          throw new Error("Token exchange failed: Missing access token");
        }
      }

      // Lấy thông tin user từ Google API
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${authentication.accessToken}` },
        },
      );

      const userInfo = await userInfoResponse.json();

      return {
        success: true,
        idToken: authentication.idToken,
        accessToken: authentication.accessToken,
        user: {
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture,
          emailVerified: userInfo.email_verified,
        },
      };
    } else if (result.type === "cancel") {
      return {
        success: false,
        message: "Đăng nhập đã bị hủy",
      };
    } else if (result.type === "error") {
      return {
        success: false,
        message: "Lỗi: " + (result.error?.message || "Không xác định"),
        error: result.error,
      };
    } else {
      return {
        success: false,
        message: "Đăng nhập thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Đăng nhập Google thất bại",
      error,
    };
  }
};

/**
 * No-op function for compatibility
 */
export const configureGoogleSignIn = () => {
  // Expo AuthSession doesn't need pre-configuration
};
