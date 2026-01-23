import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function AppointmentsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: 0, label: "Sắp tới", icon: "calendar-outline" },
    { id: 1, label: "Đã hoàn thành", icon: "checkmark-circle-outline" },
    { id: 2, label: "Đã hủy", icon: "close-circle-outline" },
  ];

  // Mock data - lịch hẹn của customer
  const appointments = [
    {
      id: "APT001",
      orderId: "ORD002",
      date: "22/01/2026",
      time: "14:00 - 15:00",
      store: "MO Eyewear Store",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      status: "upcoming",
      statusColor: "#F18F01",
      type: "prescription",
      typeLabel: "Đặt theo đơn thuốc",
      products: [
        { name: "Gọng kính Titanium Premium", quantity: 1 },
        { name: "Tròng kính chống ánh sáng xanh", quantity: 1 },
      ],
      note: "Nhớ mang theo đơn thuốc và CMND",
    },
    {
      id: "APT002",
      orderId: "ORD003",
      date: "20/01/2026",
      time: "09:00 - 10:00",
      store: "MO Eyewear Store",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      status: "upcoming",
      statusColor: "#F18F01",
      type: "lens_with_frame",
      typeLabel: "Lắp tròng kính",
      products: [
        { name: "Gọng kính Acetate Fashion", quantity: 1 },
        { name: "Tròng kính cận thông thường", quantity: 1 },
      ],
      note: "Mang theo gọng kính nếu cần thử",
    },
    {
      id: "APT003",
      orderId: "ORD005",
      date: "13/01/2026",
      time: "10:00 - 11:00",
      store: "MO Eyewear Store",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      status: "completed",
      statusColor: "#10B981",
      type: "lens_only",
      typeLabel: "Nhận tròng kính",
      products: [{ name: "Tròng kính đổi màu Transitions", quantity: 1 }],
      note: null,
    },
    {
      id: "APT004",
      orderId: "ORD008",
      date: "07/01/2026",
      time: "15:00 - 16:00",
      store: "MO Eyewear Store",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      status: "cancelled",
      statusColor: "#EF4444",
      type: "lens_with_frame",
      typeLabel: "Lắp tròng kính",
      products: [
        { name: "Gọng kính Titanium Light", quantity: 1 },
        { name: "Tròng kính chống UV cao cấp", quantity: 1 },
      ],
      note: "Đã hủy đơn hàng",
    },
  ];

  const filterAppointments = () => {
    const statusMap = {
      0: "upcoming",
      1: "completed",
      2: "cancelled",
    };
    return appointments.filter((apt) => apt.status === statusMap[selectedTab]);
  };

  const filteredAppointments = filterAppointments();

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Sắp tới";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "";
    }
  };

  const renderAppointment = ({ item }) => (
    <View className="bg-white mx-5 mb-4 rounded-3xl overflow-hidden shadow-md border border-gray-100">
      {/* Header with gradient-like design */}
      <View
        className="px-4 pt-4 pb-3"
        style={{ backgroundColor: item.statusColor + "08" }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
              style={{ backgroundColor: item.statusColor + "15" }}
            >
              <Ionicons
                name={
                  item.status === "upcoming"
                    ? "calendar"
                    : item.status === "completed"
                      ? "checkmark-circle"
                      : "close-circle"
                }
                size={26}
                color={item.statusColor}
              />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-lg font-bold text-text">{item.id}</Text>
              <View className="flex-row items-center mt-1">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: item.statusColor }}
                />
                <Text
                  className="text-xs font-bold"
                  style={{ color: item.statusColor }}
                >
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View
          className="self-start px-4 py-2 rounded-xl"
          style={{ backgroundColor: "#F18F01" }}
        >
          <Text className="text-xs font-bold text-white tracking-wide">
            {item.typeLabel}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 py-4">
        {/* Date & Time - Enhanced */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="calendar" size={20} color="#2E86AB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-textGray font-medium mb-0.5">
                Ngày & Giờ
              </Text>
              <Text className="text-base font-bold text-text">{item.date}</Text>
              <Text className="text-sm font-semibold text-primary">
                {item.time}
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-200 mb-3" />

          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="location" size={20} color="#2E86AB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-textGray font-medium mb-0.5">
                Địa điểm
              </Text>
              <Text className="text-base font-bold text-text mb-1">
                {item.store}
              </Text>
              <Text className="text-sm text-textGray leading-5">
                {item.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Products - Enhanced */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="cube-outline" size={18} color="#2E86AB" />
            <Text className="text-sm font-bold text-text ml-2">Sản phẩm:</Text>
          </View>
          {item.products.map((product, index) => (
            <View
              key={index}
              className="flex-row items-center mb-2 bg-gray-50 rounded-xl p-3"
            >
              <View className="w-2 h-2 rounded-full bg-primary mr-3" />
              <Text className="text-sm text-text flex-1 font-medium">
                {product.name}
              </Text>
              <Text className="text-xs text-textGray font-semibold">
                x{product.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Note - Enhanced */}
        {item.note && (
          <View
            className="rounded-2xl p-4 mb-4 border-l-4"
            style={{
              backgroundColor:
                item.status === "cancelled" ? "#FEF2F2" : "#EFF6FF",
              borderLeftColor:
                item.status === "cancelled" ? "#EF4444" : "#2E86AB",
            }}
          >
            <View className="flex-row items-start">
              <Ionicons
                name={
                  item.status === "cancelled"
                    ? "information-circle"
                    : "alert-circle"
                }
                size={18}
                color={item.status === "cancelled" ? "#EF4444" : "#2E86AB"}
              />
              <Text
                className="text-sm font-semibold ml-2 flex-1 leading-5"
                style={{
                  color: item.status === "cancelled" ? "#DC2626" : "#1E40AF",
                }}
              >
                {item.note}
              </Text>
            </View>
          </View>
        )}

        {/* Actions - Enhanced */}
        <View className="flex-row mt-5" style={{ gap: 12 }}>
          {item.status === "upcoming" && (
            <>
              <TouchableOpacity
                className="flex-1 bg-white rounded-2xl py-4 items-center border-2 border-gray-200 shadow-sm"
                onPress={() =>
                  navigation.navigate("OrderDetail", {
                    orderId: item.orderId,
                  })
                }
              >
                <View className="flex-row items-center">
                  <Ionicons name="receipt-outline" size={18} color="#333" />
                  <Text className="text-text font-bold text-sm ml-2">
                    Xem đơn hàng
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-4 items-center shadow-md"
                onPress={() =>
                  navigation.navigate("StoreMap", {
                    storeName: item.store,
                    storeAddress: item.address,
                    appointmentDate: item.date,
                    appointmentTime: item.time,
                  })
                }
              >
                <View className="flex-row items-center">
                  <Ionicons name="navigate" size={18} color="#FFF" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Chỉ đường
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
          {item.status === "completed" && (
            <TouchableOpacity
              className="flex-1 bg-primary rounded-2xl py-4 items-center shadow-md"
              onPress={() =>
                navigation.navigate("OrderDetail", { orderId: item.orderId })
              }
            >
              <View className="flex-row items-center">
                <Ionicons name="receipt-outline" size={18} color="#FFF" />
                <Text className="text-white font-bold text-sm ml-2">
                  Xem đơn hàng
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {item.status === "cancelled" && (
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl py-4 items-center border-2 border-gray-200 shadow-sm"
              onPress={() =>
                navigation.navigate("OrderDetail", { orderId: item.orderId })
              }
            >
              <View className="flex-row items-center">
                <Ionicons name="document-text-outline" size={18} color="#333" />
                <Text className="text-text font-bold text-sm ml-2">
                  Xem chi tiết
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-text">
              Lịch hẹn của tôi
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Support")}>
            <Ionicons name="help-circle-outline" size={26} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-row items-center mr-4 px-4 py-2.5 rounded-xl ${
                selectedTab === tab.id ? "bg-primary" : "bg-gray-100"
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={selectedTab === tab.id ? "#FFFFFF" : "#666666"}
              />
              <Text
                className={`text-sm font-semibold ml-2 ${
                  selectedTab === tab.id ? "text-white" : "text-textGray"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
          <Text className="text-base text-textGray text-center mt-4">
            Chưa có lịch hẹn nào
          </Text>
        </View>
      )}
    </View>
  );
}
