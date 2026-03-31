import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { OrdersContext, OrdersProvider } from "../contexts/OrdersContext";

// Import screens
import HomeScreen from "../screens/home/HomeScreen";
import CategoriesScreen from "../screens/categories/CategoriesScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

// Import other screens that can be accessed from tabs
import ProductCatalogScreen from "../screens/products/ProductCatalogScreen";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import LensOrderScreen from "../screens/products/LensOrderScreen";
import SearchScreen from "../screens/search/SearchScreen";
import PrescriptionOrderScreen from "../screens/prescription/PrescriptionOrderScreen";
import VirtualTryOnScreen from "../screens/virtual-tryon/VirtualTryOnScreen";
import ReviewsScreen from "../screens/reviews/ReviewsScreen";
import MyReviewsScreen from "../screens/reviews/MyReviewsScreen";
import WriteReviewScreen from "../screens/reviews/WriteReviewScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import AddressPickerScreen from "../screens/checkout/AddressPickerScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import OrderSuccessScreen from "../screens/orders/OrderSuccessScreen";
import VNPayPaymentScreen from "../screens/checkout/VNPayPaymentScreen";
import OrderSuccessScreenVNPay from "../screens/orders/OrderSuccessScreenVNPay";
import ReturnRequestScreen from "../screens/return/ReturnRequestScreen";
import ReturnHistoryScreen from "../screens/return/ReturnHistoryScreen";
import SupportScreen from "../screens/support/SupportScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import TermsAndPoliciesScreen from "../screens/settings/TermsAndPoliciesScreen";
import PrescriptionRequestsScreen from "../screens/prescription/PrescriptionRequestsScreen";
import MembershipScreen from "../screens/membership/MembershipScreen";
import MembershipHistoryScreen from "../screens/membership/MembershipHistoryScreen";
import MyAppointmentsScreen from "../screens/appointments/MyAppointmentsScreen";

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
      <Stack.Screen
        name="PrescriptionOrder"
        component={PrescriptionOrderScreen}
      />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen
        name="OrderSuccessVNPay"
        component={OrderSuccessScreenVNPay}
      />
      <Stack.Screen
        name="Appointments"
        component={PrescriptionRequestsScreen}
      />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
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
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen
        name="OrderSuccessVNPay"
        component={OrderSuccessScreenVNPay}
      />
      <Stack.Screen
        name="Appointments"
        component={PrescriptionRequestsScreen}
      />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
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
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen
        name="Appointments"
        component={PrescriptionRequestsScreen}
      />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen
        name="MembershipHistory"
        component={MembershipHistoryScreen}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="ReturnHistory" component={ReturnHistoryScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
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
      <Stack.Screen
        name="Appointments"
        component={PrescriptionRequestsScreen}
      />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen
        name="MembershipHistory"
        component={MembershipHistoryScreen}
      />
      <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} />
    </Stack.Navigator>
  );
}

function TabNavigatorContent() {
  const { ordersCount } = useContext(OrdersContext);

  const TAB_CONFIG = [
    {
      name: "HomeTab",
      label: "Trang chủ",
      icon: "home",
      iconOutline: "home-outline",
    },
    {
      name: "CategoriesTab",
      label: "Danh mục",
      icon: "grid",
      iconOutline: "grid-outline",
    },
    {
      name: "OrdersTab",
      label: "Đơn hàng",
      icon: "receipt",
      iconOutline: "receipt-outline",
    },
    {
      name: "ProfileTab",
      label: "Tài khoản",
      icon: "person",
      iconOutline: "person-outline",
    },
  ];

  function CustomTabBar({ state, navigation }) {
    return (
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 30,
          borderTopWidth: 1,
          borderTopColor: "#F0F4F8",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.05,
          shadowRadius: 16,
          elevation: 20,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TAB_CONFIG[index];
          const badge =
            route.name === "OrdersTab" && ordersCount > 0 ? ordersCount : null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isFocused ? (
                /* Active: rounded square with tinted bg + larger icon */
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#E8F4F9",
                    borderRadius: 16,
                    width: 52,
                    height: 42,
                  }}
                >
                  <Ionicons name={tab.icon} size={26} color="#2E86AB" />
                </View>
              ) : (
                /* Inactive: icon only + optional badge */
                <View style={{ position: "relative", padding: 8 }}>
                  <Ionicons name={tab.iconOutline} size={24} color="#9CA3AF" />
                  {badge != null && (
                    <View
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        backgroundColor: "#EF4444",
                        borderRadius: 9,
                        minWidth: 17,
                        height: 17,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 3,
                        borderWidth: 1.5,
                        borderColor: "#fff",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: "800",
                          lineHeight: 12,
                        }}
                      >
                        {badge > 99 ? "99+" : badge}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="CategoriesTab" component={CategoriesStack} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
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
