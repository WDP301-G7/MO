import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function ReturnHistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("all"); // all, pending, approved, rejected

  const returnRequests = [
    {
      id: "RET001",
      orderId: "ORD002",
      productName: "Gọng kính Rayban Classic",
      productImage:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      reason: "Sản phẩm bị lỗi/hư hỏng",
      requestDate: "18/01/2026",
      status: "pending",
      statusText: "Đang xử lý",
      statusColor: "#F18F01",
      amount: 2500000,
      description: "Gọng bị cong, không đeo được",
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=100&h=100&fit=crop",
      ],
    },
    {
      id: "RET002",
      orderId: "ORD005",
      productName: "Kính mát Polarized",
      productImage:
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=200&fit=crop",
      reason: "Đổi ý, không muốn mua nữa",
      requestDate: "15/01/2026",
      status: "approved",
      statusText: "Đã chấp nhận",
      statusColor: "#10B981",
      amount: 3500000,
      refundDate: "17/01/2026",
      refundMethod: "Hoàn về tài khoản",
      description: "Không vừa với khuôn mặt",
      images: [],
    },
    {
      id: "RET003",
      orderId: "ORD008",
      productName: "Gọng kính Titanium Premium",
      productImage:
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=200&h=200&fit=crop",
      reason: "Giao sai sản phẩm",
      requestDate: "12/01/2026",
      status: "rejected",
      statusText: "Từ chối",
      statusColor: "#EF4444",
      amount: 4500000,
      rejectReason: "Sản phẩm không còn nguyên vẹn",
      description: "Nhận được màu xanh thay vì màu đen",
      images: [
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=100&h=100&fit=crop",
      ],
    },
  ];

  const tabs = [
    { key: "all", label: "Tất cả", count: returnRequests.length },
    {
      key: "pending",
      label: "Đang xử lý",
      count: returnRequests.filter((r) => r.status === "pending").length,
    },
    {
      key: "approved",
      label: "Đã duyệt",
      count: returnRequests.filter((r) => r.status === "approved").length,
    },
    {
      key: "rejected",
      label: "Từ chối",
      count: returnRequests.filter((r) => r.status === "rejected").length,
    },
  ];

  const filteredRequests = returnRequests.filter((request) => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "approved":
        return "checkmark-circle-outline";
      case "rejected":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">
            Lịch sử đổi trả hàng
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 py-3"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeTab === tab.key ? "bg-primary" : "bg-background"
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key ? "text-white" : "text-text"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredRequests.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <Ionicons
              name="swap-horizontal-outline"
              size={80}
              color="#CCCCCC"
            />
            <Text className="text-lg font-bold text-text mt-4">
              Chưa có yêu cầu đổi trả
            </Text>
            <Text className="text-sm text-textGray text-center mt-2">
              Lịch sử các yêu cầu đổi trả hàng của bạn sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          <View className="px-5 py-5">
            {filteredRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm"
                onPress={() => alert(`Chi tiết yêu cầu: ${request.id}`)}
              >
                {/* Status Banner */}
                <View
                  className="px-4 py-2 flex-row items-center justify-between"
                  style={{ backgroundColor: request.statusColor + "15" }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={getStatusIcon(request.status)}
                      size={18}
                      color={request.statusColor}
                    />
                    <Text
                      className="text-sm font-bold ml-2"
                      style={{ color: request.statusColor }}
                    >
                      {request.statusText}
                    </Text>
                  </View>
                  <Text className="text-xs text-textGray">
                    {request.requestDate}
                  </Text>
                </View>

                {/* Product Info */}
                <View className="p-4">
                  <View className="flex-row mb-3">
                    <Image
                      source={{ uri: request.productImage }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-xs text-textGray mb-1">
                        #{request.id}
                      </Text>
                      <Text
                        className="text-sm font-bold text-text mb-1"
                        numberOfLines={2}
                      >
                        {request.productName}
                      </Text>
                      <Text className="text-base font-bold text-primary">
                        {`${request.amount.toLocaleString()}đ`}
                      </Text>
                    </View>
                  </View>

                  {/* Reason */}
                  <View className="bg-background rounded-lg p-3 mb-3">
                    <Text className="text-xs text-textGray mb-1">Lý do:</Text>
                    <Text className="text-sm text-text font-semibold mb-1">
                      {request.reason}
                    </Text>
                    {request.description && (
                      <Text className="text-xs text-textGray">
                        {request.description}
                      </Text>
                    )}
                  </View>

                  {/* Images */}
                  {request.images.length > 0 && (
                    <View className="flex-row gap-2 mb-3">
                      {request.images.map((img, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: img }}
                          className="w-16 h-16 rounded-lg"
                        />
                      ))}
                    </View>
                  )}

                  {/* Status Details */}
                  {request.status === "approved" && (
                    <View className="bg-green-50 rounded-lg p-3 mb-3">
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#10B981"
                        />
                        <Text className="text-sm text-green-700 font-semibold ml-2">
                          Hoàn tiền thành công
                        </Text>
                      </View>
                      <Text className="text-xs text-green-600">
                        Ngày hoàn: {request.refundDate}
                      </Text>
                      <Text className="text-xs text-green-600">
                        Phương thức: {request.refundMethod}
                      </Text>
                    </View>
                  )}

                  {request.status === "rejected" && (
                    <View className="bg-red-50 rounded-lg p-3 mb-3">
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color="#EF4444"
                        />
                        <Text className="text-sm text-red-700 font-semibold ml-2">
                          Yêu cầu bị từ chối
                        </Text>
                      </View>
                      <Text className="text-xs text-red-600">
                        Lý do: {request.rejectReason}
                      </Text>
                    </View>
                  )}

                  {request.status === "pending" && (
                    <View className="bg-orange-50 rounded-lg p-3 mb-3">
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={16} color="#F18F01" />
                        <Text className="text-sm text-orange-700 font-semibold ml-2">
                          Đang chờ xét duyệt (1-3 ngày làm việc)
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Actions */}
                  <View className="flex-row gap-2 border-t border-border pt-3">
                    <TouchableOpacity
                      className="flex-1 border border-primary rounded-lg py-2 items-center"
                      onPress={() =>
                        navigation.navigate("OrderDetail", {
                          orderId: request.orderId,
                        })
                      }
                    >
                      <Text className="text-primary font-semibold text-sm">
                        Xem đơn hàng
                      </Text>
                    </TouchableOpacity>
                    {request.status === "pending" && (
                      <TouchableOpacity
                        className="border border-red-500 rounded-lg px-4 py-2 items-center"
                        onPress={() => alert("Hủy yêu cầu đổi trả")}
                      >
                        <Text className="text-red-500 font-semibold text-sm">
                          Hủy
                        </Text>
                      </TouchableOpacity>
                    )}
                    {request.status === "rejected" && (
                      <TouchableOpacity
                        className="flex-1 bg-primary rounded-lg py-2 items-center"
                        onPress={() =>
                          navigation.navigate("ReturnRequest", {
                            orderId: request.orderId,
                          })
                        }
                      >
                        <Text className="text-white font-semibold text-sm">
                          Yêu cầu lại
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Return Request Button */}
      {filteredRequests.length > 0 && (
        <View className="bg-white border-t border-border px-5 py-4">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center flex-row justify-center"
            onPress={() => navigation.navigate("Orders")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">
              Tạo yêu cầu mới
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
