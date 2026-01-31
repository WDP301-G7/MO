import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function ReturnRequestScreen({ navigation, route }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedRefundMethod, setSelectedRefundMethod] = useState("original");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);

  const order = {
    id: "ORD-2024-001",
    product: {
      name: "Gọng kính Rayban RB5154",
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      variant: "Đen - Size M",
      price: 3500000,
      quantity: 1,
    },
    orderDate: "15/01/2024",
    deliveryDate: "20/01/2024",
  };

  const returnReasons = [
    { id: 1, title: "Sản phẩm bị lỗi/hư hỏng", icon: "alert-circle-outline" },
    { id: 2, title: "Giao sai sản phẩm", icon: "swap-horizontal-outline" },
    { id: 3, title: "Không vừa/không đúng mô tả", icon: "resize-outline" },
    { id: 4, title: "Đổi ý, không muốn mua nữa", icon: "close-circle-outline" },
    { id: 5, title: "Nhận được sản phẩm giả", icon: "warning-outline" },
    { id: 6, title: "Lý do khác", icon: "ellipsis-horizontal-outline" },
  ];

  const refundMethods = [
    {
      id: "original",
      title: "Hoàn về phương thức thanh toán gốc",
      subtitle: "2-5 ngày làm việc",
      icon: "card-outline",
    },
    {
      id: "wallet",
      title: "Hoàn vào ví EyewearStore",
      subtitle: "Ngay lập tức",
      icon: "wallet-outline",
    },
    {
      id: "credit",
      title: "Nhận mã giảm giá",
      subtitle: "Nhận thêm 10% giá trị đơn hàng",
      icon: "pricetag-outline",
    },
  ];

  const handleSubmit = () => {
    if (!selectedReason) {
      alert("Vui lòng chọn lý do trả hàng");
      return;
    }
    alert("Yêu cầu trả hàng đã được gửi! Chúng tôi sẽ xử lý trong 24h.");
    navigation.goBack();
  };

  const handlePickImage = () => {
    // Simulate image picking
    const newImage = `https://images.unsplash.com/photo-${Date.now()}?w=200&h=200&fit=crop`;
    setSelectedImages([...selectedImages, newImage]);
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
          <Text className="text-xl font-bold text-text">Yêu cầu trả hàng</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Thông tin đơn hàng
          </Text>
          <View className="flex-row">
            <Image
              source={{ uri: order.product.image }}
              className="w-20 h-20 rounded-lg"
            />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-text mb-1">
                {order.product.name}
              </Text>
              <Text className="text-xs text-textGray mb-1">
                {order.product.variant}
              </Text>
              <Text className="text-sm font-bold text-primary">
                {`${order.product.price.toLocaleString()}đ`}
              </Text>
            </View>
          </View>
          <View className="border-t border-border mt-3 pt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-textGray">Mã đơn hàng:</Text>
              <Text className="text-xs font-semibold text-text">
                {order.id}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-textGray">Ngày giao hàng:</Text>
              <Text className="text-xs font-semibold text-text">
                {order.deliveryDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Return Reasons */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Lý do trả hàng <Text className="text-red-500">*</Text>
          </Text>
          {returnReasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              className={`flex-row items-center p-3 mb-2 rounded-xl border-2 ${
                selectedReason === reason.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }`}
              onPress={() => setSelectedReason(reason.id)}
            >
              <Ionicons
                name={reason.icon}
                size={24}
                color={selectedReason === reason.id ? "#2E86AB" : "#999999"}
              />
              <Text
                className={`flex-1 text-sm ml-3 ${
                  selectedReason === reason.id
                    ? "text-primary font-semibold"
                    : "text-text"
                }`}
              >
                {reason.title}
              </Text>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedReason === reason.id
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Mô tả chi tiết (Tùy chọn)
          </Text>
          <TextInput
            className="bg-background rounded-xl p-3 text-sm text-text min-h-24"
            placeholder="Vui lòng mô tả chi tiết về lý do trả hàng..."
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Upload Images */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Hình ảnh minh chứng
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((img, index) => (
              <View key={index} className="mr-3 relative">
                <Image source={{ uri: img }} className="w-20 h-20 rounded-lg" />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  onPress={() =>
                    setSelectedImages(
                      selectedImages.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 5 && (
              <TouchableOpacity
                className="w-20 h-20 border-2 border-dashed border-border rounded-lg items-center justify-center bg-background"
                onPress={handlePickImage}
              >
                <Ionicons name="camera-outline" size={28} color="#999999" />
                <Text className="text-xs text-textGray mt-1">Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text className="text-xs text-textGray mt-2">
            Tối đa 5 ảnh, mỗi ảnh không quá 5MB
          </Text>
        </View>

        {/* Refund Method */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Phương thức hoàn tiền
          </Text>
          {refundMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center p-3 mb-2 rounded-xl border-2 ${
                selectedRefundMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              onPress={() => setSelectedRefundMethod(method.id)}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  selectedRefundMethod === method.id
                    ? "bg-primary"
                    : "bg-background"
                }`}
              >
                <Ionicons
                  name={method.icon}
                  size={20}
                  color={
                    selectedRefundMethod === method.id ? "#FFFFFF" : "#999999"
                  }
                />
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className={`text-sm font-semibold ${
                    selectedRefundMethod === method.id
                      ? "text-primary"
                      : "text-text"
                  }`}
                >
                  {method.title}
                </Text>
                <Text className="text-xs text-textGray mt-0.5">
                  {method.subtitle}
                </Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedRefundMethod === method.id
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {selectedRefundMethod === method.id && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Return Policy */}
        <View className="bg-accent/10 mx-5 rounded-xl p-4 mb-6">
          <View className="flex-row items-start mb-2">
            <Ionicons name="information-circle" size={20} color="#F18F01" />
            <Text className="text-sm font-bold text-text ml-2">
              Chính sách trả hàng
            </Text>
          </View>
          <Text className="text-xs text-textGray leading-5">
            {`• Sản phẩm còn nguyên tem, nhãn mác
• Trong thời gian 7 ngày kể từ ngày nhận hàng
• Không áp dụng với sản phẩm khuyến mãi
• Phí vận chuyển hoàn trả do người mua chịu (trừ lỗi từ shop)`}
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white border-t border-border px-5 py-4">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-base">Gửi yêu cầu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
