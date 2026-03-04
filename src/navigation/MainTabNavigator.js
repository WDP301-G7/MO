import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { OrdersContext, OrdersProvider } from "../contexts/OrdersContext";

// Import screens
import HomeScreen from "../screens/home/HomeScreen";
import CategoriesScreen from "../screens/categories/CategoriesScreen";
import CartScreen from "../screens/cart/CartScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

// Import other screens that can be accessed from tabs
import ProductCatalogScreen from "../screens/products/ProductCatalogScreen";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import LensOrderScreen from "../screens/products/LensOrderScreen";
import SearchScreen from "../screens/search/SearchScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import PrescriptionOrderScreen from "../screens/prescription/PrescriptionOrderScreen";
import VirtualTryOnScreen from "../screens/virtual-tryon/VirtualTryOnScreen";
import ReviewsScreen from "../screens/reviews/ReviewsScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import OrderSuccessScreen from "../screens/orders/OrderSuccessScreen";
import VNPayPaymentScreen from "../screens/checkout/VNPayPaymentScreen";
import OrderSuccessScreenVNPay from "../screens/orders/OrderSuccessScreenVNPay";
import ReturnRequestScreen from "../screens/return/ReturnRequestScreen";
import ReturnHistoryScreen from "../screens/return/ReturnHistoryScreen";
import VouchersScreen from "../screens/vouchers/VouchersScreen";
import SupportScreen from "../screens/support/SupportScreen";
import AddressManagementScreen from "../screens/address/AddressManagementScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import FavoritesScreen from "../screens/favorites/FavoritesScreen";
import MyReviewsScreen from "../screens/reviews/MyReviewsScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import NotificationSettingsScreen from "../screens/settings/NotificationSettingsScreen";
import TermsAndPoliciesScreen from "../screens/settings/TermsAndPoliciesScreen";
import AppointmentsScreen from "../screens/appointments/AppointmentsScreen";
import StoreMapScreen from "../screens/map/StoreMapScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="LensOrder" component={LensOrderScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="PrescriptionOrder"
        component={PrescriptionOrderScreen}
      />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen
        name="OrderSuccessVNPay"
        component={OrderSuccessScreenVNPay}
      />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} />
    </Stack.Navigator>
  );
}

// Categories Stack Navigator
function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="LensOrder" component={LensOrderScreen} />
      <Stack.Screen
        name="PrescriptionOrder"
        component={PrescriptionOrderScreen}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen
        name="OrderSuccessVNPay"
        component={OrderSuccessScreenVNPay}
      />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} />
    </Stack.Navigator>
  );
}

// Cart Stack Navigator
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen
        name="OrderSuccessVNPay"
        component={OrderSuccessScreenVNPay}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="LensOrder" component={LensOrderScreen} />
      <Stack.Screen
        name="PrescriptionOrder"
        component={PrescriptionOrderScreen}
      />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
      />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} />
    </Stack.Navigator>
  );
}

// Orders Stack Navigator
function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} />
      <Stack.Screen name="ReturnHistory" component={ReturnHistoryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="LensOrder" component={LensOrderScreen} />
      <Stack.Screen
        name="PrescriptionOrder"
        component={PrescriptionOrderScreen}
      />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
      />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="ReturnHistory" component={ReturnHistoryScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Terms" component={TermsAndPoliciesScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="LensOrder" component={LensOrderScreen} />
      <Stack.Screen
        name="PrescriptionOrder"
        component={PrescriptionOrderScreen}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen
        name="OrderSuccessVNPay"
        component={OrderSuccessScreenVNPay}
      />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="StoreMap" component={StoreMapScreen} />
    </Stack.Navigator>
  );
}

function TabNavigatorContent() {
  const { ordersCount } = useContext(OrdersContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "CategoriesTab") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "CartTab") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "OrdersTab") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E86AB",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
          paddingHorizontal: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarBadgeStyle: {
          backgroundColor: "#EF4444",
          color: "#FFFFFF",
          fontSize: 10,
          fontWeight: "bold",
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          alignItems: "center",
          justifyContent: "center",
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Trang chủ",
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesStack}
        options={{
          tabBarLabel: "Danh mục",
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          tabBarLabel: "Giỏ hàng",
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarLabel: "Đơn hàng",
          tabBarBadge: ordersCount > 0 ? ordersCount : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: "Tài khoản",
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <OrdersProvider>
      <TabNavigatorContent />
    </OrdersProvider>
  );
}
