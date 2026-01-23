import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function OrdersScreen({ navigation, route }) {
  const initialFilter = route?.params?.filter || 0;
  const [selectedTab, setSelectedTab] = useState(initialFilter);

  const tabs = [
    { id: 0, label: "Tất cả", icon: "list-outline" },
    { id: 1, label: "Chờ xác nhận", icon: "time-outline" },
    { id: 2, label: "Đang giao", icon: "car-outline" },
    { id: 3, label: "Hoàn thành", icon: "checkmark-circle-outline" },
    { id: 4, label: "Đã hủy", icon: "close-circle-outline" },
  ];

  const orders = [
    {
      id: "ORD001",
      date: "18/01/2026",
      createdAt: "18/01/2026 14:30",
      status: "Đang giao",
      statusColor: "#2E86AB",
      totalAmount: 1920000,
      orderType: "normal", // Mua gọng thông thường
      items: [
        {
          id: 1,
          name: "Gọng kính Rayban Clubmaster",
          image:
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1890000,
          variant: "Màu đen - Size M",
        },
      ],
      trackingNumber: "VN123456789",
      subtotal: 1890000,
      shipping: 30000,
      discount: 0,
      total: 1920000,
      payment: {
        method: "COD",
        status: "Chưa thanh toán",
        time: "18/01/2026 14:30",
      },
    },
    {
      id: "ORD002",
      date: "17/01/2026",
      createdAt: "17/01/2026 10:15",
      status: "Chờ xác nhận",
      statusColor: "#F18F01",
      totalAmount: 4300000,
      orderType: "prescription", // Đặt theo đơn thuốc
      prescriptionType: "frame_lens",
      appointmentDate: "22/01/2026",
      appointmentTime: "14:00 - 15:00",
      store: "MO Eyewear Store",
      paymentType: "deposit",
      depositAmount: 1290000, // 30%
      items: [
        {
          id: 1,
          name: "Gọng kính Titanium Premium",
          image:
            "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=160&h=160&fit=crop",
          quantity: 1,
          price: 3500000,
          variant: "Màu vàng hồng - Size L",
        },
        {
          id: 2,
          name: "Tròng kính chống ánh sáng xanh",
          image:
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1200000,
          variant: "Độ cận -3.50",
        },
      ],
      trackingNumber: null,
      subtotal: 4700000,
      shipping: 0,
      discount: 400000,
      total: 4300000,
      payment: {
        method: "Chuyển khoản",
        status: "Đã cọc 30%",
        time: "17/01/2026 10:30",
      },
    },
    {
      id: "ORD003",
      date: "16/01/2026",
      createdAt: "16/01/2026 16:45",
      status: "Đang chuẩn bị",
      statusColor: "#F18F01",
      totalAmount: 2700000,
      orderType: "lens_with_frame", // Mua tròng + gọng không theo đơn
      requirePickup: true,
      appointmentDate: "20/01/2026",
      appointmentTime: "09:00 - 10:00",
      store: "MO Eyewear Store",
      items: [
        {
          id: 1,
          name: "Gọng kính Acetate Fashion",
          image:
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1800000,
          variant: "Màu xanh dương - Size M",
        },
        {
          id: 2,
          name: "Tròng kính cận thông thường",
          image:
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop",
          quantity: 1,
          price: 900000,
          variant: "Độ cận -2.00",
        },
      ],
      trackingNumber: null,
      subtotal: 2700000,
      shipping: 0,
      discount: 0,
      total: 2700000,
      payment: {
        method: "Chuyển khoản",
        status: "Đã thanh toán",
        time: "16/01/2026 17:00",
      },
    },
    {
      id: "ORD004",
      date: "15/01/2026",
      createdAt: "15/01/2026 11:20",
      status: "Chờ xác nhận",
      statusColor: "#F18F01",
      totalAmount: 1280000,
      orderType: "normal",
      items: [
        {
          id: 1,
          name: "Mắt kính Oakley Holbrook",
          image:
            "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1250000,
          variant: "Màu đen nhám - Polarized",
        },
      ],
      trackingNumber: null,
      subtotal: 1250000,
      shipping: 30000,
      discount: 0,
      total: 1280000,
      payment: {
        method: "COD",
        status: "Chưa thanh toán",
        time: "15/01/2026 11:20",
      },
    },
    {
      id: "ORD005",
      date: "12/01/2026",
      createdAt: "12/01/2026 09:10",
      status: "Hoàn thành",
      statusColor: "#10B981",
      totalAmount: 1230000,
      orderType: "lens_only", // Chỉ mua tròng kính
      requirePickup: true,
      appointmentDate: "13/01/2026",
      appointmentTime: "10:00 - 11:00",
      store: "MO Eyewear Store",
      items: [
        {
          id: 1,
          name: "Tròng kính đổi màu Transitions",
          image:
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1200000,
          variant: "Độ cận -1.50",
        },
      ],
      trackingNumber: null,
      subtotal: 1200000,
      shipping: 0,
      discount: 0,
      total: 1200000,
      payment: {
        method: "Chuyển khoản",
        status: "Đã thanh toán",
        time: "12/01/2026 09:25",
      },
    },
    {
      id: "ORD006",
      date: "10/01/2026",
      createdAt: "10/01/2026 15:40",
      status: "Hoàn thành",
      statusColor: "#10B981",
      totalAmount: 750000,
      orderType: "normal",
      items: [
        {
          id: 1,
          name: "Gọng kính Gucci GG0061O",
          image:
            "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=160&h=160&fit=crop",
          quantity: 1,
          price: 750000,
          variant: "Màu đồi mồi - Size S",
        },
      ],
      trackingNumber: "VN987654321",
      subtotal: 750000,
      shipping: 0,
      discount: 0,
      total: 750000,
      payment: {
        method: "COD",
        status: "Đã thanh toán",
        time: "11/01/2026 10:15",
      },
    },
    {
      id: "ORD007",
      date: "08/01/2026",
      createdAt: "08/01/2026 13:25",
      status: "Hoàn thành",
      statusColor: "#10B981",
      totalAmount: 1380000,
      orderType: "prescription",
      prescriptionType: "lens_only", // Chỉ tròng theo đơn
      appointmentDate: "10/01/2026",
      appointmentTime: "14:00 - 15:00",
      store: "MO Eyewear Store",
      items: [
        {
          id: 1,
          name: "Tròng kính Essilor cận + loạn",
          image:
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1350000,
          variant: "Độ cận -3.50, Loạn -0.75",
        },
      ],
      trackingNumber: null,
      subtotal: 1350000,
      shipping: 30000,
      discount: 0,
      total: 1380000,
      payment: {
        method: "Chuyển khoản",
        status: "Đã thanh toán",
        time: "08/01/2026 13:40",
      },
    },
    {
      id: "ORD008",
      date: "05/01/2026",
      createdAt: "05/01/2026 10:50",
      status: "Đã hủy",
      statusColor: "#EF4444",
      totalAmount: 2800000,
      orderType: "lens_with_frame",
      requirePickup: true,
      appointmentDate: "07/01/2026",
      appointmentTime: "15:00 - 16:00",
      store: "MO Eyewear Store",
      items: [
        {
          id: 1,
          name: "Gọng kính Titanium Light",
          image:
            "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=160&h=160&fit=crop",
          quantity: 1,
          price: 1900000,
          variant: "Màu bạc - Size M",
        },
        {
          id: 2,
          name: "Tròng kính chống UV cao cấp",
          image:
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop",
          quantity: 1,
          price: 900000,
          variant: "Độ cận -4.00",
        },
      ],
      trackingNumber: null,
      subtotal: 2800000,
      shipping: 0,
      discount: 0,
      total: 2800000,
      payment: {
        method: "Chuyển khoản",
        status: "Đã hoàn tiền",
        time: "06/01/2026 09:30",
      },
    },
  ];

  const filterOrders = () => {
    if (selectedTab === 0) return orders;
    const statusMap = {
      1: "Chờ xác nhận",
      2: ["Đang giao", "Đang chuẩn bị"], // Bao gồm cả đơn giao hàng và đơn chuẩn bị nhận tại cửa hàng
      3: "Hoàn thành",
      4: "Đã hủy",
    };
    const targetStatus = statusMap[selectedTab];
    if (Array.isArray(targetStatus)) {
      return orders.filter((order) => targetStatus.includes(order.status));
    }
    return orders.filter((order) => order.status === targetStatus);
  };

  const filteredOrders = filterOrders();

  const getStatusActions = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return [
          { label: "Hủy đơn", color: "#EF4444", action: "cancel" },
          { label: "Xem chi tiết", color: "#2E86AB", action: "detail" },
        ];
      case "Đang giao":
        return [
          { label: "Theo dõi", color: "#2E86AB", action: "track" },
          { label: "Liên hệ", color: "#999999", action: "contact" },
        ];
      case "Đang chuẩn bị":
        return [
          { label: "Xem chi tiết", color: "#2E86AB", action: "detail" },
          { label: "Liên hệ", color: "#999999", action: "contact" },
        ];
      case "Hoàn thành":
        return [
          { label: "Mua lại", color: "#2E86AB", action: "reorder" },
          { label: "Đánh giá", color: "#F18F01", action: "review" },
        ];
      case "Đã hủy":
        return [{ label: "Mua lại", color: "#2E86AB", action: "reorder" }];
      default:
        return [];
    }
  };

  const handleAction = (orderId, action) => {
    switch (action) {
      case "detail":
      case "track":
        const order = orders.find((o) => o.id === orderId);
        navigation.navigate("OrderDetail", { orderId, order });
        break;
      case "cancel":
        alert("Hủy đơn hàng");
        break;
      case "reorder":
        alert("Mua lại");
        break;
      case "review":
        alert("Đánh giá sản phẩm");
        break;
      case "contact":
        navigation.navigate("Support");
        break;
    }
  };

  const getOrderTypeLabel = (orderType, prescriptionType) => {
    switch (orderType) {
      case "prescription":
        return {
          label:
            prescriptionType === "lens_only"
              ? "Đơn thuốc - Tròng"
              : "Đơn thuốc - Full",
          color: "#A23B72",
          icon: "medical-outline",
        };
      case "lens_with_frame":
        return {
          label: "Gọng + Tròng",
          color: "#F18F01",
          icon: "eye-outline",
        };
      case "lens_only":
        return {
          label: "Chỉ tròng",
          color: "#2E86AB",
          icon: "disc-outline",
        };
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }) => {
    const orderTypeBadge = getOrderTypeLabel(
      item.orderType,
      item.prescriptionType,
    );

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        onPress={() =>
          navigation.navigate("OrderDetail", { orderId: item.id, order: item })
        }
      >
        {/* Order Header */}
        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
          <View className="flex-row items-center flex-1">
            <Ionicons name="receipt-outline" size={18} color="#2E86AB" />
            <Text className="text-sm font-bold text-text ml-2">{item.id}</Text>
            {orderTypeBadge && (
              <View
                className="ml-2 px-2 py-1 rounded-md flex-row items-center"
                style={{ backgroundColor: orderTypeBadge.color + "20" }}
              >
                <Ionicons
                  name={orderTypeBadge.icon}
                  size={12}
                  color={orderTypeBadge.color}
                />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{ color: orderTypeBadge.color }}
                >
                  {orderTypeBadge.label}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: item.statusColor }}
            />
            <Text
              className="text-sm font-semibold"
              style={{ color: item.statusColor }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View className="mb-3">
          {item.items.map((product, index) => (
            <View
              key={product.id}
              className={`flex-row items-center ${index > 0 ? "mt-3" : ""}`}
            >
              <Image
                source={{ uri: product.image }}
                className="w-16 h-16 rounded-lg"
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-sm font-semibold text-text"
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text className="text-xs text-textGray mt-1">
                  x{product.quantity}
                </Text>
              </View>
              <Text className="text-sm font-bold text-primary">
                {product.price.toLocaleString("vi-VN") + "đ"}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Footer */}
        <View className="pt-3 border-t border-border">
          {/* Special Info for certain order types */}
          {item.orderType === "prescription" && item.appointmentDate && (
            <View className="mb-3 bg-purple-50 rounded-lg p-2.5 flex-row items-center">
              <Ionicons name="calendar" size={16} color="#A23B72" />
              <Text className="text-xs text-purple-800 ml-2">
                <Text className="font-semibold">Lịch hẹn:</Text>{" "}
                {item.appointmentDate} - {item.appointmentTime} tại {item.store}
              </Text>
            </View>
          )}
          {item.orderType === "lens_with_frame" && item.requirePickup && (
            <View className="mb-3 bg-amber-50 rounded-lg p-2.5 flex-row items-center">
              <Ionicons name="location" size={16} color="#F18F01" />
              <Text className="text-xs text-amber-800 ml-2">
                <Text className="font-semibold">Nhận tại:</Text> {item.store} -{" "}
                {item.appointmentDate} {item.appointmentTime}
              </Text>
            </View>
          )}
          {item.paymentType === "deposit" && item.depositAmount && (
            <View className="mb-3 bg-blue-50 rounded-lg p-2.5 flex-row items-center">
              <Ionicons name="card" size={16} color="#2E86AB" />
              <Text className="text-xs text-blue-800 ml-2">
                <Text className="font-semibold">Đã cọc:</Text>{" "}
                {item.depositAmount.toLocaleString("vi-VN") + "đ"} - Còn lại{" "}
                {(item.totalAmount - item.depositAmount).toLocaleString("vi-VN") + "đ"}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-textGray">
              <Ionicons name="calendar-outline" size={12} /> {item.date}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-textGray mr-2">Tổng tiền:</Text>
              <Text className="text-lg font-bold text-text">
                {item.totalAmount.toLocaleString("vi-VN") + "đ"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-end gap-2">
            {getStatusActions(item.status).map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`px-4 py-2 rounded-lg border ${
                  action.action === "detail" ||
                  action.action === "track" ||
                  action.action === "reorder"
                    ? "bg-primary border-primary"
                    : "border-border"
                }`}
                onPress={() => handleAction(item.id, action.action)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    action.action === "detail" ||
                    action.action === "track" ||
                    action.action === "reorder"
                      ? "text-white"
                      : ""
                  }`}
                  style={{
                    color:
                      action.action === "detail" ||
                      action.action === "track" ||
                      action.action === "reorder"
                        ? "#FFFFFF"
                        : action.color,
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-3 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-text">Đơn hàng của tôi</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Support")}>
            <Ionicons name="help-circle-outline" size={26} color="#2E86AB" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`mr-3 pb-3 px-2 ${
                selectedTab === tab.id ? "border-b-2 border-primary" : ""
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={selectedTab === tab.id ? "#2E86AB" : "#999999"}
                />
                <Text
                  className={`text-sm font-semibold ml-1.5 ${
                    selectedTab === tab.id ? "text-primary" : "text-textGray"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
          <Text className="text-lg font-bold text-text mt-4 text-center">
            Chưa có đơn hàng
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Bạn chưa có đơn hàng nào trong mục này
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-full mt-6"
            onPress={() => navigation.navigate("Home")}
          >
            <Text className="text-white font-semibold">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
