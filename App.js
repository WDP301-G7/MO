import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { isLoggedIn, authEventEmitter } from "./src/services/authService";
import { linking, handleDeepLink } from "./src/utils/deepLinkHandler";
import { configureGoogleSignIn } from "./src/services/googleAuthService";

// Import Providers
import { OrdersProvider } from "./src/contexts/OrdersContext";
import { ReturnsProvider } from "./src/contexts/ReturnsContext";

// Import Auth screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";

// Import Main screens
import HomeScreen from "./src/screens/home/HomeScreen";
import ProductCatalogScreen from "./src/screens/products/ProductCatalogScreen";
import ProductDetailScreen from "./src/screens/products/ProductDetailScreen";
import LensOrderScreen from "./src/screens/products/LensOrderScreen";
import CheckoutScreen from "./src/screens/checkout/CheckoutScreen";
import VNPayPaymentScreen from "./src/screens/checkout/VNPayPaymentScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import OrdersScreen from "./src/screens/orders/OrdersScreen";
import OrderDetailScreen from "./src/screens/orders/OrderDetailScreen";
import OrderSuccessScreen from "./src/screens/orders/OrderSuccessScreen";
import OrderSuccessScreenVNPay from "./src/screens/orders/OrderSuccessScreenVNPay";
import SearchScreen from "./src/screens/search/SearchScreen";
import SupportScreen from "./src/screens/support/SupportScreen";
import CategoriesScreen from "./src/screens/categories/CategoriesScreen";
import PrescriptionOrderScreen from "./src/screens/prescription/PrescriptionOrderScreen";
import VirtualTryOnScreen from "./src/screens/virtual-tryon/VirtualTryOnScreen";
import ReviewsScreen from "./src/screens/reviews/ReviewsScreen";
import WriteReviewScreen from "./src/screens/reviews/WriteReviewScreen";
import ReturnRequestScreen from "./src/screens/return/ReturnRequestScreen";
import ReturnHistoryScreen from "./src/screens/return/ReturnHistoryScreen";
import ReturnDetailScreen from "./src/screens/return/ReturnDetailScreen";
import EditProfileScreen from "./src/screens/profile/EditProfileScreen";
import MyReviewsScreen from "./src/screens/reviews/MyReviewsScreen";
import ChangePasswordScreen from "./src/screens/profile/ChangePasswordScreen";
import TermsAndPoliciesScreen from "./src/screens/settings/TermsAndPoliciesScreen";

// Import Tab Navigator
import MainTabNavigator from "./src/navigation/MainTabNavigator";

const Stack = createStackNavigator();

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    // Cấu hình Google Sign-In khi app khởi động
    configureGoogleSignIn();
    checkAuthStatus();

    // Listen for logout events from authService
    const handleLogout = () => {
      setUserLoggedIn(false);

      // Navigate to Login screen
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };

    authEventEmitter.on("logout", handleLogout);

    // Cleanup listener on unmount
    return () => {
      authEventEmitter.removeListener("logout", handleLogout);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await isLoggedIn();
      setUserLoggedIn(loggedIn);
    } catch (error) {
      // Silent error
    } finally {
      setIsCheckingAuth(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E86AB" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <OrdersProvider>
        <ReturnsProvider>
          <NavigationContainer
            linking={linking}
            fallback={<ActivityIndicator color="#2E86AB" size="large" />}
            onStateChange={(state) => {
              // Xử lý deeplink từ backend
              if (state) {
                handleDeepLink(state);
              }
            }}
          >
            <Stack.Navigator
              initialRouteName={userLoggedIn ? "MainApp" : "Login"}
              screenOptions={{
                headerShown: false,
              }}
            >
              {/* Auth Screens */}
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
              />

              {/* Main App with Tab Navigator */}
              <Stack.Screen name="MainApp" component={MainTabNavigator} />

              {/* Other Screens (accessed from tabs) */}
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="ProductCatalog"
                component={ProductCatalogScreen}
              />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
              />
              <Stack.Screen name="LensOrder" component={LensOrderScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen
                name="VNPayPayment"
                component={VNPayPaymentScreen}
              />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
              <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
              <Stack.Screen
                name="OrderSuccess"
                component={OrderSuccessScreen}
              />
              <Stack.Screen
                name="OrderSuccessVNPay"
                component={OrderSuccessScreenVNPay}
              />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="Categories" component={CategoriesScreen} />
              <Stack.Screen
                name="PrescriptionOrder"
                component={PrescriptionOrderScreen}
              />
              <Stack.Screen
                name="VirtualTryOn"
                component={VirtualTryOnScreen}
              />
              <Stack.Screen name="Reviews" component={ReviewsScreen} />
              <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
              <Stack.Screen
                name="ReturnRequest"
                component={ReturnRequestScreen}
              />
              <Stack.Screen
                name="ReturnHistory"
                component={ReturnHistoryScreen}
              />
              <Stack.Screen
                name="ReturnDetail"
                component={ReturnDetailScreen}
              />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
              />
              <Stack.Screen name="Terms" component={TermsAndPoliciesScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ReturnsProvider>
      </OrdersProvider>
    </SafeAreaProvider>
  );
}
