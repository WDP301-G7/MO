import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

// Cần để browser đóng sau khi authenticate
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CONFIG = {
  iosClientId:
    "263008296948-bl7kq5bg7n6fhiiquulcr71lqgib2doa.apps.googleusercontent.com",
  androidClientId:
    "263008296948-i8s77ti8t4sab555u85cjarfp5tr3pd9.apps.googleusercontent.com",
  webClientId:
    "263008296948-kgk8i38i21jpqhjh5udr8reog1c0jna7.apps.googleusercontent.com", // Web Client ID (bắt buộc)
};

/**
 * Configure Google Sign-In
 * Hook để sử dụng trong component
 */
export const useGoogleAuth = () => {
  // iOS Client ID yêu cầu redirect URI format đặc biệt
  const iosRedirectUri =
    "com.googleusercontent.apps.263008296948-bl7kq5bg7n6fhiiquulcr71lqgib2doa:/oauth2redirect";

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

        if (tokens.access_token) {
          authentication = {
            accessToken: tokens.access_token,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token,
          };
        } else {
          throw new Error("Token exchange failed: " + JSON.stringify(tokens));
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
      console.error("❌ Google OAuth Error:", result.error);
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
    console.error("❌ Google Sign-In Error:", error);
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
