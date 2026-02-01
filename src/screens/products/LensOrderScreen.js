import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, formatPrice } from "../../services/productService";
import { createOrder } from "../../services/orderService";
import { getProfile } from "../../services/authService";

export default function LensOrderScreen({ navigation, route }) {
  const { selectedFrame, selectedLensFromProduct, fromCart, cartItems } =
    route?.params || {};
  const [step, setStep] = useState(fromCart ? 2 : 1);
  const [selectedLensType, setSelectedLensType] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(
    selectedFrame?.id || null,
  );
  const [requireAppointment, setRequireAppointment] = useState(false);

  // API data states
  const [lensProducts, setLensProducts] = useState([]);
  const [frameProducts, setFrameProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    loadProducts();
    loadUserData();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load LENS products
      const lensResult = await getProducts({ type: "LENS", limit: 20 });
      if (lensResult.success) {
        setLensProducts(lensResult.data);
      }

      // Load FRAME products
      const frameResult = await getProducts({ type: "FRAME", limit: 20 });
      if (frameResult.success) {
        setFrameProducts(frameResult.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const result = await getProfile();
      if (result.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Use products from API (lensProducts and frameProducts loaded in useEffect)

  // Auto-select if coming from ProductDetail with lens
  useEffect(() => {
    if (selectedLensFromProduct && lensProducts.length > 0) {
      const matchedLens = lensProducts.find(
        (lens) => lens.id === selectedLensFromProduct.id,
      );
      if (matchedLens) {
        setSelectedLensType(matchedLens.id);
        setRequireAppointment(matchedLens.isPreorder || false);
      }
    }
  }, [selectedLensFromProduct, lensProducts]);

  const getTotalAmount = () => {
    let total = 0;
    if (selectedFrameId) {
      const frame = frameProducts.find((f) => f.id === selectedFrameId);
      total += formatPrice(frame?.price) || 0;
    }
    if (selectedLensType) {
      const lens = lensProducts.find((l) => l.id === selectedLensType);
      total += formatPrice(lens?.price) || 0;
    }
    return total;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedLensType) {
        Alert.alert("Thông báo", "Vui lòng chọn loại tròng kính");
        return;
      }
      const lens = lensProducts.find((l) => l.id === selectedLensType);
      setRequireAppointment(lens?.isPreorder || false);

      if (!selectedFrameId) {
        Alert.alert("Thông báo", "Vui lòng chọn gọng kính");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Create order with both FRAME and LENS
      try {
        setOrdering(true);

        const selectedFrame = frameProducts.find(
          (f) => f.id === selectedFrameId,
        );
        const selectedLens = lensProducts.find(
          (l) => l.id === selectedLensType,
        );

        if (!selectedFrame || !selectedLens) {
          Alert.alert("Lỗi", "Không tìm thấy sản phẩm đã chọn");
          return;
        }

        // Prepare order with both items
        const orderData = {
          items: [
            {
              productId: selectedFrame.id,
              quantity: 1,
              price: selectedFrame.price.toString(),
            },
            {
              productId: selectedLens.id,
              quantity: 1,
              price: selectedLens.price.toString(),
            },
          ],
          shippingAddress: userData?.address || "Lắp tại cửa hàng",
          phoneNumber: userData?.phone || null,
          paymentMethod: "COD",
          note: "Đơn hàng tròng + gọng kính (không cần đơn thuốc)",
        };

        const result = await createOrder(orderData);

        if (result.success) {
          navigation.replace("OrderSuccess", {
            orderId: result.data.id,
            totalAmount: getTotalAmount(),
            paymentMethod: "COD",
            orderType: "lens_with_frame",
          });
        } else {
          Alert.alert("Lỗi", result.message || "Đặt hàng thất bại");
        }
      } catch (error) {
        console.error("Error creating order:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi đặt hàng");
      } finally {
        setOrdering(false);
      }
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-2">
        Bước 1: Chọn sản phẩm
      </Text>
      <Text className="text-sm text-textGray mb-4">
        Chọn loại tròng kính và gọng kính
      </Text>

      {/* Lens Type Selection */}
      <Text className="text-base font-semibold text-text mb-3">
        Loại tròng kính
      </Text>

      {/* Info if coming from ProductDetail */}
      {selectedLensFromProduct && (
        <View className="bg-green-50 rounded-xl p-3 mb-3 flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <View className="flex-1 ml-2">
            <Text className="text-sm text-green-800">
              {`Bạn đã chọn `}
              <Text className="font-bold">{selectedLensFromProduct.name}</Text>
              {` từ trang sản phẩm`}
            </Text>
          </View>
        </View>
      )}

      {lensProducts.map((lens) => (
        <TouchableOpacity
          key={lens.id}
          className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
            selectedLensType === lens.id
              ? "border-primary"
              : "border-transparent"
          }`}
          onPress={() => setSelectedLensType(lens.id)}
        >
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-base font-bold text-text">
                  {lens.name}
                </Text>
                {lens.brand && (
                  <View className="bg-accent px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-xs text-white font-semibold">
                      {lens.brand}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-lg font-bold text-primary mb-1">
                {`${formatPrice(lens.price).toLocaleString("vi-VN")}đ`}
              </Text>
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name={lens.isPreorder ? "time" : "checkmark-circle"}
                  size={14}
                  color={lens.isPreorder ? "#F18F01" : "#10B981"}
                />
                <Text className="text-xs text-textGray ml-1">
                  {lens.isPreorder
                    ? `Đặt trước (${lens.leadTimeDays || 7} ngày)`
                    : "Sẵn hàng"}
                </Text>
              </View>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedLensType === lens.id
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}
            >
              {selectedLensType === lens.id && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>

          {lens.description && (
            <Text className="text-sm text-textGray" numberOfLines={2}>
              {lens.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Frame Selection */}
      <Text className="text-base font-semibold text-text mt-4 mb-3">
        Chọn gọng kính
      </Text>
      {frameProducts.map((frame) => {
        // Get first image or use fallback
        const imageUrl =
          frame.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop";

        return (
          <TouchableOpacity
            key={frame.id}
            className={`bg-white rounded-2xl mb-3 overflow-hidden border-2 ${
              selectedFrameId === frame.id
                ? "border-primary"
                : "border-transparent"
            }`}
            onPress={() => setSelectedFrameId(frame.id)}
          >
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-text mb-1">
                  {frame.name}
                </Text>
                {frame.brand && (
                  <Text className="text-xs text-textGray mb-1">
                    {frame.brand}
                  </Text>
                )}
                <Text className="text-lg font-bold text-primary">
                  {`${formatPrice(frame.price).toLocaleString("vi-VN")}đ`}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-xs text-green-600">Còn hàng</Text>
                </View>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedFrameId === frame.id
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {selectedFrameId === frame.id && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStep2 = () => {
    const selectedLens = lensProducts.find((l) => l.id === selectedLensType);
    const selectedFrame = frameProducts.find((f) => f.id === selectedFrameId);

    return (
      <View>
        <Text className="text-lg font-bold text-text mb-2">
          Bước 2: Xác nhận đơn hàng
        </Text>
        <Text className="text-sm text-textGray mb-4">
          Kiểm tra thông tin trước khi đặt hàng
        </Text>

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-base font-bold text-text mb-3">
            Chi tiết đơn hàng
          </Text>

          {selectedFrame && (
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <Text className="text-sm text-text">{selectedFrame.name}</Text>
              <Text className="text-sm font-bold text-text">
                {`${formatPrice(selectedFrame.price).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          )}

          {selectedLens && (
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <Text className="text-sm text-text">{selectedLens.name}</Text>
              <Text className="text-sm font-bold text-text">
                {`${formatPrice(selectedLens.price).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center pt-3">
            <Text className="text-base font-bold text-text">Tổng cộng</Text>
            <Text className="text-xl font-bold text-primary">
              {`${getTotalAmount().toLocaleString("vi-VN")}đ`}
            </Text>
          </View>
        </View>

        {/* Important Note */}
        <View className="bg-yellow-50 rounded-xl p-4 mb-4 flex-row">
          <Ionicons name="information-circle" size={24} color="#F18F01" />
          <Text className="flex-1 text-sm text-yellow-800 ml-2">
            <Text className="font-bold">Lưu ý:{"\n"}</Text>
            {`• Đơn hàng bao gồm 1 gọng + 1 tròng kính
• Phương thức thanh toán: COD (thanh toán khi nhận hàng)
• Shop sẽ liên hệ để xác nhận đơn hàng`}
          </Text>
        </View>
      </View>
    );
  };

  const maxSteps = 2;

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-sm text-textGray mt-4">Đang tải sản phẩm...</Text>
      </View>
    );
  }

  // No products available
  if (lensProducts.length === 0 || frameProducts.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-5">
        <Ionicons name="eye-off-outline" size={64} color="#CCCCCC" />
        <Text className="text-lg text-text font-bold mt-4 mb-2">
          Không có sản phẩm
        </Text>
        <Text className="text-sm text-textGray text-center mb-6">
          Hiện chưa có tròng hoặc gọng kính nào khả dụng
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Đặt tròng kính + gọng
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View className="flex-row items-center justify-between">
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((num) => (
            <View key={num} className="flex-row items-center flex-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step >= num ? "bg-primary" : "bg-border"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step >= num ? "text-white" : "text-textGray"
                  }`}
                >
                  {num}
                </Text>
              </View>
              {num < maxSteps && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white border-t border-border px-5 py-4">
        <View className="flex-row gap-3">
          {step > 1 && (
            <TouchableOpacity
              className="flex-1 bg-background rounded-xl py-4 items-center"
              onPress={() => setStep(step - 1)}
            >
              <Text className="text-text font-bold text-base">Quay lại</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 bg-primary rounded-xl py-4 items-center flex-row justify-center"
            onPress={handleNext}
            disabled={ordering}
          >
            {ordering ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white font-bold text-base ml-2">
                  Đang xử lý...
                </Text>
              </>
            ) : (
              <Text className="text-white font-bold text-base">
                {step === maxSteps ? "Xác nhận đặt hàng" : "Tiếp theo"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
