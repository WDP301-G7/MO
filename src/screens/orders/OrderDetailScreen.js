import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId, order: passedOrder } = route.params;
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Lấy data từ OrdersScreen hoặc dùng mock data
  const getOrderData = () => {
    if (passedOrder) return passedOrder;

    // Mock data mặc định nếu không có order được truyền
    return {
      id: orderId || "ORD001",
      date: "18/01/2026",
      createdAt: "18/01/2026 14:30",
      status: "Đang giao",
      statusColor: "#2E86AB",
      totalAmount: 1890000,
      orderType: "normal",
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
      payment: {
        method: "COD",
        status: "Chưa thanh toán",
        time: "18/01/2026 14:30",
      },
      subtotal: 1890000,
      shipping: 30000,
      discount: 0,
      total: 1920000,
    };
  };

  const order = getOrderData();

  // Tạo timeline dựa trên loại đơn hàng
  const getTimeline = () => {
    const baseTimeline = [
      {
        id: 1,
        title: "Đơn hàng đã đặt",
        time: `${order.date} 14:30`,
        status: "completed",
      },
      {
        id: 2,
        title: "Đã xác nhận",
        time: `${order.date} 15:00`,
        status: order.status !== "Chờ xác nhận" ? "completed" : "active",
      },
    ];

    // Đơn theo đơn thuốc hoặc tròng+gọng hoặc chỉ tròng cần lắp tại cửa hàng
    if (
      order.orderType === "prescription" ||
      order.orderType === "lens_only" ||
      order.orderType === "lens_with_frame"
    ) {
      return [
        ...baseTimeline,
        {
          id: 3,
          title:
            order.orderType === "prescription"
              ? "Chuẩn bị kính theo đơn"
              : order.orderType === "lens_only"
                ? "Chuẩn bị tròng kính"
                : "Đang lắp tròng kính",
          time:
            order.status === "Chờ xác nhận"
              ? "Đang xử lý"
              : `${order.date} 16:00`,
          status:
            order.status === "Chờ xác nhận"
              ? "pending"
              : order.status === "Đang giao" ||
                  order.status === "Đang chuẩn bị" ||
                  order.status === "Hoàn thành"
                ? "completed"
                : "active",
        },
        {
          id: 4,
          title: `Chờ nhận tại ${order.store}`,
          time: order.appointmentDate
            ? `${order.appointmentDate} ${order.appointmentTime}`
            : "Đang chờ lịch hẹn",
          status:
            order.status === "Hoàn thành"
              ? "completed"
              : order.status === "Đang giao" || order.status === "Đang chuẩn bị"
                ? "active"
                : "pending",
        },
        {
          id: 5,
          title: "Đã nhận hàng",
          time:
            order.status === "Hoàn thành"
              ? `${order.date} 14:30`
              : "Chưa hoàn thành",
          status: order.status === "Hoàn thành" ? "completed" : "pending",
        },
      ];
    }

    // Đơn giao hàng tận nơi
    return [
      ...baseTimeline,
      {
        id: 3,
        title: "Đã lấy hàng",
        time: order.status === "Chờ xác nhận" ? "Chưa lấy" : `19/01/2026 09:00`,
        status:
          order.status === "Đang giao" || order.status === "Hoàn thành"
            ? "completed"
            : "pending",
      },
      {
        id: 4,
        title: "Đang giao hàng",
        time:
          order.status === "Đang giao"
            ? "19/01/2026 14:30"
            : order.status === "Hoàn thành"
              ? "20/01/2026 10:00"
              : "Chưa giao",
        status:
          order.status === "Đang giao"
            ? "active"
            : order.status === "Hoàn thành"
              ? "completed"
              : "pending",
      },
      {
        id: 5,
        title: "Đã giao",
        time:
          order.status === "Hoàn thành"
            ? "20/01/2026 15:30"
            : "Dự kiến 20/01/2026",
        status: order.status === "Hoàn thành" ? "completed" : "pending",
      },
    ];
  };

  const timeline = getTimeline();

  const handleCancelOrder = () => {
    setShowCancelModal(false);
    alert("Đã hủy đơn hàng");
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text">
                Chi tiết đơn hàng
              </Text>
              <Text className="text-xs text-textGray mt-0.5">{order.id}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Support")}>
            <Ionicons name="help-circle-outline" size={26} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 0 }}
      >
        {/* Status Banner */}
        <View
          className="mx-5 mt-5 p-4 rounded-2xl"
          style={{ backgroundColor: order.statusColor + "20" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text
                className="text-base font-bold"
                style={{ color: order.statusColor }}
              >
                {order.status}
              </Text>
              {order.orderType === "prescription" ||
              order.orderType === "lens_only" ||
              order.orderType === "lens_with_frame" ? (
                <Text className="text-sm text-textGray mt-1">
                  Nhận tại cửa hàng: {order.appointmentDate || "Chờ xác nhận"}
                </Text>
              ) : (
                <Text className="text-sm text-textGray mt-1">
                  Dự kiến giao:{" "}
                  {order.status === "Hoàn thành" ? "Đã giao" : "20/01/2026"}
                </Text>
              )}
            </View>
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: order.statusColor }}
            >
              <Ionicons
                name={
                  order.orderType === "prescription" ||
                  order.orderType === "lens_only" ||
                  order.orderType === "lens_with_frame"
                    ? "location"
                    : "car-outline"
                }
                size={28}
                color="#FFFFFF"
              />
            </View>
          </View>
          {order.trackingNumber && order.orderType === "normal" && (
            <View className="mt-3 pt-3 border-t border-border/50">
              <Text className="text-xs text-textGray">Mã vận đơn:</Text>
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-sm font-bold text-text">
                  {order.trackingNumber}
                </Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-sm font-semibold text-primary mr-1">
                    Sao chép
                  </Text>
                  <Ionicons name="copy-outline" size={16} color="#2E86AB" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Order Type Badge */}
        {order.orderType !== "normal" && (
          <View
            className="mx-5 mt-4 p-4 rounded-2xl"
            style={{
              backgroundColor:
                order.orderType === "prescription"
                  ? "#A23B7220"
                  : order.orderType === "lens_with_frame"
                    ? "#F18F0120"
                    : "#2E86AB20",
            }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={
                  order.orderType === "prescription"
                    ? "medical"
                    : order.orderType === "lens_with_frame"
                      ? "eye"
                      : "disc"
                }
                size={20}
                color={
                  order.orderType === "prescription"
                    ? "#A23B72"
                    : order.orderType === "lens_with_frame"
                      ? "#F18F01"
                      : "#2E86AB"
                }
              />
              <Text
                className="text-sm font-bold ml-2"
                style={{
                  color:
                    order.orderType === "prescription"
                      ? "#A23B72"
                      : order.orderType === "lens_with_frame"
                        ? "#F18F01"
                        : "#2E86AB",
                }}
              >
                {order.orderType === "prescription"
                  ? order.prescriptionType === "lens_only"
                    ? "Đơn thuốc - Chỉ tròng"
                    : "Đơn thuốc - Gọng + Tròng"
                  : order.orderType === "lens_with_frame"
                    ? "Tròng + Gọng (Lắp tại cửa hàng)"
                    : "Chỉ mua tròng kính"}
              </Text>
            </View>

            {/* Appointment Info */}
            {order.appointmentDate && (
              <View
                className="mt-3 pt-3 border-t"
                style={{
                  borderColor:
                    order.orderType === "prescription"
                      ? "#A23B7230"
                      : "#F18F0130",
                }}
              >
                <Text className="text-xs text-textGray mb-2">
                  Lịch hẹn nhận hàng:
                </Text>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text className="text-sm font-semibold text-text ml-2">
                    {order.appointmentDate} - {order.appointmentTime}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={16} color="#666" />
                  <Text className="text-sm text-textGray ml-2">
                    {order.store}
                  </Text>
                </View>
              </View>
            )}

            {/* Deposit Info */}
            {order.paymentType === "deposit" && order.depositAmount && (
              <View className="mt-3 pt-3 border-t border-purple-200">
                <Text className="text-xs text-textGray mb-2">
                  Thông tin thanh toán:
                </Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-textGray">Đã cọc (30%):</Text>
                  <Text className="text-sm font-bold text-green-600">
                    {order.depositAmount.toLocaleString("vi-VN") + "đ"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-textGray">
                    Còn lại khi nhận:
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    {(order.totalAmount - order.depositAmount).toLocaleString(
                      "vi-VN",
                    )}
                    đ
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Timeline */}
        <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
          <Text className="text-base font-bold text-text mb-4">
            Trạng thái đơn hàng
          </Text>
          {timeline.map((item, index) => (
            <View key={item.id} className="flex-row">
              <View className="items-center mr-3">
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    item.status === "completed"
                      ? "bg-primary"
                      : item.status === "active"
                        ? "bg-accent"
                        : "bg-border"
                  }`}
                >
                  {item.status === "completed" && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                  {item.status === "active" && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </View>
                {index < timeline.length - 1 && (
                  <View
                    className={`w-0.5 h-12 ${
                      item.status === "completed" ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </View>
              <View className="flex-1 pb-4">
                <Text
                  className={`text-sm font-semibold ${
                    item.status === "active" ? "text-accent" : "text-text"
                  }`}
                >
                  {item.title}
                </Text>
                <Text className="text-xs text-textGray mt-1">{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping/Pickup Info */}
        {order.orderType === "prescription" ||
        order.orderType === "lens_only" ||
        order.orderType === "lens_with_frame" ? (
          <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location-outline" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text ml-2">
                Thông tin nhận hàng
              </Text>
            </View>
            <View className="bg-amber-50 rounded-lg p-3 mb-3">
              <Text className="text-sm font-semibold text-amber-900 mb-2">
                📍 Nhận tại cửa hàng
              </Text>
              <Text className="text-sm text-amber-800">
                {order.store || "Chi nhánh Quận 1"}
              </Text>
              <Text className="text-xs text-amber-700 mt-1">
                123 Nguyễn Huệ, Quận 1, TP.HCM
              </Text>
            </View>
            <Text className="text-sm text-textGray">
              Vui lòng mang theo CMND/CCCD khi đến nhận hàng
            </Text>
          </View>
        ) : (
          <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location-outline" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text ml-2">
                Địa chỉ giao hàng
              </Text>
            </View>
            <Text className="text-sm font-semibold text-text">
              Nguyễn Văn A
            </Text>
            <Text className="text-sm text-textGray mt-1">0123456789</Text>
            <Text className="text-sm text-text mt-2">
              123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM
            </Text>
          </View>
        )}

        {/* Products */}
        <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
          <Text className="text-base font-bold text-text mb-4">
            Sản phẩm ({order.items.length})
          </Text>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row pb-4 ${
                index < order.items.length - 1
                  ? "border-b border-border mb-4"
                  : ""
              }`}
            >
              <Image
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-lg"
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-sm font-semibold text-text"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-textGray mt-1">
                  {item.variant}
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-textGray">
                    x{item.quantity}
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    {item.price.toLocaleString("vi-VN") + "đ"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
          <View className="flex-row items-center mb-3">
            <Ionicons name="card-outline" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text ml-2">
              Thanh toán
            </Text>
          </View>

          {order.paymentType === "deposit" ? (
            <>
              <View className="bg-purple-50 rounded-lg p-3 mb-3">
                <Text className="text-sm font-bold text-purple-900 mb-2">
                  💳 Thanh toán cọc trước
                </Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-purple-700">Đã cọc (30%):</Text>
                  <Text className="text-sm font-bold text-green-600">
                    {(order.depositAmount || 0).toLocaleString("vi-VN") + "đ"}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-purple-700">Còn lại:</Text>
                  <Text className="text-sm font-bold text-amber-600">
                    {(
                      (order.totalAmount || 0) - (order.depositAmount || 0)
                    ).toLocaleString("vi-VN")}
                    đ
                  </Text>
                </View>
                <View className="mt-2 pt-2 border-t border-purple-200">
                  <Text className="text-xs text-purple-600">
                    ℹ️ Thanh toán phần còn lại khi nhận hàng
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-textGray">Phương thức cọc:</Text>
                <Text className="text-sm font-semibold text-text">
                  Chuyển khoản
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-textGray">Trạng thái:</Text>
                <Text className="text-sm font-semibold text-green-500">
                  Đã thanh toán cọc
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-textGray">Thời gian cọc:</Text>
                <Text className="text-sm text-text">
                  {order.payment?.time || order.createdAt}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-textGray">Phương thức:</Text>
                <Text className="text-sm font-semibold text-text">
                  {order.payment?.method || "COD"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-textGray">Trạng thái:</Text>
                <Text className="text-sm font-semibold text-green-500">
                  {order.payment?.status ||
                    (order.status === "Hoàn thành"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán")}
                </Text>
              </View>
              {order.status === "Hoàn thành" && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-textGray">Thời gian:</Text>
                  <Text className="text-sm text-text">
                    {order.payment?.time || order.createdAt}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Price Summary */}
        <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-textGray">Tạm tính:</Text>
            <Text className="text-sm text-text">
              {(order.subtotal || 0).toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-textGray">Phí vận chuyển:</Text>
            <Text className="text-sm text-text">
              {(order.shipping || 0).toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-textGray">Giảm giá:</Text>
            <Text className="text-sm text-red-500">
              {"-" + (order.discount || 0).toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between pt-3 border-t border-border">
            <Text className="text-base font-bold text-text">Tổng cộng:</Text>
            <Text className="text-xl font-bold text-primary">
              {(order.total || 0).toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-5 my-6 gap-3">
          {(order.status === "Hoàn thành" || order.status === "Đã giao") && (
            <TouchableOpacity
              className="w-full bg-primary rounded-xl py-4 items-center"
              onPress={() =>
                navigation.navigate("ReturnRequest", { order: order })
              }
            >
              <Text className="text-white font-bold text-base">
                Yêu cầu trả hàng
              </Text>
            </TouchableOpacity>
          )}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border-2 border-border bg-white rounded-xl py-3 items-center"
              onPress={() => navigation.navigate("Support")}
            >
              <Text className="text-text font-bold text-sm">
                Liên hệ hỗ trợ
              </Text>
            </TouchableOpacity>
            {order.status === "Chờ xác nhận" && (
              <TouchableOpacity
                className="flex-1 border-2 border-red-500 bg-white rounded-xl py-3 items-center"
                onPress={() => setShowCancelModal(true)}
              >
                <Text className="text-red-500 font-bold text-sm">
                  Hủy đơn hàng
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-white rounded-3xl p-6 w-full">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                <Ionicons
                  name="alert-circle-outline"
                  size={40}
                  color="#EF4444"
                />
              </View>
              <Text className="text-xl font-bold text-text text-center">
                Xác nhận hủy đơn
              </Text>
              <Text className="text-sm text-textGray text-center mt-2">
                Bạn có chắc chắn muốn hủy đơn hàng này không?
              </Text>
            </View>
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-background rounded-xl py-3 items-center"
                onPress={() => setShowCancelModal(false)}
              >
                <Text className="text-text font-semibold">Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                onPress={handleCancelOrder}
              >
                <Text className="text-white font-semibold">Hủy đơn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
