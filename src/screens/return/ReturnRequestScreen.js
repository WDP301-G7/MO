import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getOrderById } from "../../services/orderService";
import { getProductImages } from "../../services/productService";
import { useReturns } from "../../contexts/ReturnsContext";
import ReturnTypeSelector from "../../components/returns/ReturnTypeSelector";
import ProductConditionSelector from "../../components/returns/ProductConditionSelector";
import ImageUploader from "../../components/returns/ImageUploader";
import ProductSelectorModal from "../../components/returns/ProductSelectorModal";
import { RETURN_REASONS } from "../../services/returnService";

export default function ReturnRequestScreen({ navigation, route }) {
  const {
    orderId,
    warrantyOnly = false,
    returnOnly = false,
    isPrescription = false,
  } = route.params || {};
  const { createReturn } = useReturns();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [returnType, setReturnType] = useState(
    warrantyOnly ? "WARRANTY" : returnOnly ? "EXCHANGE" : "RETURN",
  );
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  // Product images map { productId: imageUrl }
  const [productImages, setProductImages] = useState({});

  // Product selector modal state
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectingForOrderItemId, setSelectingForOrderItemId] = useState(null);

  // Fetch order detail
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(orderId);
      if (result.success) {
        setOrder(result.data);
        // Fetch images for all products in parallel
        const items = result.data?.orderItems || [];
        const uniqueProductIds = [
          ...new Set(items.map((i) => i.productId).filter(Boolean)),
        ];
        const imageResults = await Promise.all(
          uniqueProductIds.map((pid) =>
            getProductImages(pid).then((r) => ({ pid, r })),
          ),
        );
        const imageMap = {};
        imageResults.forEach(({ pid, r }) => {
          if (r.success && r.data?.length > 0) {
            const sorted = [...r.data].sort((a, b) =>
              b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
            );
            imageMap[pid] = sorted[0].imageUrl;
          }
        });
        setProductImages(imageMap);
      } else {
        Alert.alert("Lỗi", result.message);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (orderItem) => {
    const existingIndex = selectedItems.findIndex(
      (item) => item.orderItemId === orderItem.id,
    );

    if (existingIndex >= 0) {
      // Remove item
      setSelectedItems(
        selectedItems.filter((_, index) => index !== existingIndex),
      );
    } else {
      // Add item with default values
      setSelectedItems([
        ...selectedItems,
        {
          orderItemId: orderItem.id,
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          condition: "GOOD",
          exchangeProductId: null,
          exchangeProduct: null, // Store selected product info
          orderItem: orderItem, // Keep reference for display
        },
      ]);
    }
  };

  // Update exchange product for an item
  const updateExchangeProduct = (orderItemId, product) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.orderItemId === orderItemId
          ? {
              ...item,
              exchangeProductId: product?.id || null,
              exchangeProduct: product || null,
            }
          : item,
      ),
    );
  };

  // Open product selector for specific item
  const openProductSelector = (orderItemId) => {
    setSelectingForOrderItemId(orderItemId);
    setShowProductSelector(true);
  };

  // Handle product selection from modal
  const handleProductSelected = (product) => {
    if (selectingForOrderItemId) {
      updateExchangeProduct(selectingForOrderItemId, product);
      setSelectingForOrderItemId(null);
    }
  };

  // Calculate price difference for exchange
  const calculatePriceDifference = (originalPrice, newPrice) => {
    return newPrice - originalPrice;
  };

  // Update item condition
  const updateItemCondition = (orderItemId, condition) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.orderItemId === orderItemId ? { ...item, condition } : item,
      ),
    );
  };

  // Update item quantity
  const updateItemQuantity = (orderItemId, quantity) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.orderItemId === orderItemId ? { ...item, quantity } : item,
      ),
    );
  };

  // Filter applicable reasons based on return type
  const getApplicableReasons = () => {
    return RETURN_REASONS.filter((r) => r.applicable.includes(returnType));
  };

  // Validate form
  const validateForm = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 1 sản phẩm để đổi/trả");
      return false;
    }

    // Validate exchange products are selected for EXCHANGE type
    if (returnType === "EXCHANGE") {
      const missingExchangeProduct = selectedItems.find(
        (item) => !item.exchangeProductId,
      );
      if (missingExchangeProduct) {
        Alert.alert(
          "Lỗi",
          "Vui lòng chọn sản phẩm muốn đổi cho tất cả sản phẩm đã chọn",
        );
        return false;
      }
    }

    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn lý do đổi/trả");
      return false;
    }

    if (reason.trim().length < 10) {
      Alert.alert("Lỗi", "Lý do phải có ít nhất 10 ký tự");
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn tạo yêu cầu ${
        returnType === "RETURN"
          ? "trả hàng"
          : returnType === "EXCHANGE"
            ? "đổi hàng"
            : "bảo hành"
      }?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              setSubmitting(true);

              // Prepare items (remove orderItem reference and null values)
              const items = selectedItems.map((item) => {
                const itemData = {
                  orderItemId: item.orderItemId,
                  productId: item.productId,
                  quantity: item.quantity,
                  condition: item.condition,
                };

                // Only include exchangeProductId for EXCHANGE type and if it has value
                if (returnType === "EXCHANGE" && item.exchangeProductId) {
                  itemData.exchangeProductId = item.exchangeProductId;
                }

                return itemData;
              });

              const params = {
                orderId,
                type: returnType,
                reason: reason.trim(),
                description: description.trim() || undefined,
                items,
                images,
              };

              const result = await createReturn(params);

              if (result.success) {
                Alert.alert(
                  "Thành công",
                  result.message || "Tạo yêu cầu đổi/trả/bảo hành thành công",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        navigation.navigate("ReturnHistory");
                      },
                    },
                  ],
                );
              } else {
                Alert.alert("Lỗi", result.message);
              }
            } catch (error) {
              Alert.alert("Lỗi", error.message || "Không thể tạo yêu cầu");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#F18F01" />
        <Text className="text-sm text-textGray mt-4">
          Đang tải thông tin đơn hàng...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={80} color="#CCCCCC" />
        <Text className="text-lg font-bold text-text mt-4 text-center">
          Không tìm thấy đơn hàng
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-xl px-6 py-3 mt-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            Yêu cầu{" "}
            {returnType === "RETURN"
              ? "trả hàng"
              : returnType === "EXCHANGE"
                ? "đổi hàng"
                : "bảo hành"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Thông tin đơn hàng
          </Text>
          <View className="bg-background rounded-lg p-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-textGray">Mã đơn hàng:</Text>
              <Text className="text-xs font-semibold text-text">
                {order.id}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-textGray">Trạng thái:</Text>
              <Text className="text-xs font-semibold text-green-600">
                {order.status}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-textGray">Tổng tiền:</Text>
              <Text className="text-xs font-semibold text-primary">
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Return Type Selection */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-1">
            Loại yêu cầu <Text className="text-red-500">*</Text>
          </Text>
          {warrantyOnly ? (
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <View className="flex-1 ml-2">
                  <Text className="text-amber-800 text-sm font-semibold mb-1">
                    Chỉ có thể yêu cầu bảo hành
                  </Text>
                  <Text className="text-amber-700 text-xs">
                    {isPrescription
                      ? "Sản phẩm theo toa không được phép đổi/trả, chỉ có thể yêu cầu bảo hành."
                      : "Đơn hàng đã quá hạn đổi/trả, chỉ có thể yêu cầu bảo hành."}
                  </Text>
                </View>
              </View>
            </View>
          ) : returnOnly ? (
            <View>
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-1">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#F59E0B"
                  />
                  <Text className="text-amber-700 text-xs ml-2 flex-1">
                    Đã quá hạn trả hàng, chỉ có thể yêu cầu đổi hàng hoặc bảo
                    hành.
                  </Text>
                </View>
              </View>
              <ReturnTypeSelector
                value={returnType}
                onChange={setReturnType}
                disabledTypes={["RETURN"]}
              />
            </View>
          ) : (
            <ReturnTypeSelector value={returnType} onChange={setReturnType} />
          )}
        </View>

        {/* Product Selection */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Chọn sản phẩm <Text className="text-red-500">*</Text>
          </Text>
          {order.orderItems?.map((orderItem, index) => {
            const isSelected = selectedItems.some(
              (item) => item.orderItemId === orderItem.id,
            );
            const selectedItem = selectedItems.find(
              (item) => item.orderItemId === orderItem.id,
            );

            return (
              <View
                key={`orderitem-${orderItem.id}-${index}`}
                className={`mb-3 border-2 rounded-xl overflow-hidden ${
                  isSelected ? "border-primary" : "border-border"
                }`}
              >
                <TouchableOpacity
                  className="flex-row p-3"
                  onPress={() => toggleItemSelection(orderItem)}
                >
                  <Image
                    source={{
                      uri:
                        productImages[orderItem.productId] ||
                        orderItem.product?.images?.[0]?.imageUrl ||
                        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
                    }}
                    className="w-16 h-16 rounded-lg bg-background"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-3">
                    <Text
                      className="text-sm font-bold text-text"
                      numberOfLines={2}
                    >
                      {orderItem.product?.name || "Sản phẩm"}
                    </Text>
                    <Text className="text-xs text-textGray mt-1">
                      Số lượng: {orderItem.quantity}
                    </Text>
                    <Text className="text-sm font-bold text-primary mt-1">
                      {formatCurrency(orderItem.unitPrice)}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      isSelected ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Product Condition (when selected) */}
                {isSelected && (
                  <View className="px-3 pb-3 border-t border-border pt-3">
                    <Text className="text-xs font-semibold text-text mb-2">
                      Tình trạng sản phẩm:
                    </Text>
                    <ProductConditionSelector
                      value={selectedItem?.condition || "GOOD"}
                      onChange={(condition) =>
                        updateItemCondition(orderItem.id, condition)
                      }
                    />

                    {/* Exchange Product Selection (only for EXCHANGE type) */}
                    {returnType === "EXCHANGE" && (
                      <View className="mt-3 pt-3 border-t border-border">
                        <Text className="text-xs font-semibold text-text mb-2">
                          Đổi sang sản phẩm:
                        </Text>
                        {selectedItem?.exchangeProduct ? (
                          <View className="bg-background rounded-lg p-3">
                            <View className="flex-row">
                              <Image
                                source={{
                                  uri:
                                    selectedItem.exchangeProduct.images?.[0]
                                      ?.imageUrl ||
                                    "https://via.placeholder.com/50",
                                }}
                                className="w-12 h-12 rounded-lg bg-white"
                                resizeMode="cover"
                              />
                              <View className="flex-1 ml-3">
                                <Text
                                  className="text-xs font-semibold text-text"
                                  numberOfLines={2}
                                >
                                  {selectedItem.exchangeProduct.name}
                                </Text>
                                <Text className="text-xs font-bold text-primary mt-1">
                                  {formatCurrency(
                                    selectedItem.exchangeProduct.price,
                                  )}
                                </Text>
                              </View>
                              <TouchableOpacity
                                className="p-2"
                                onPress={() =>
                                  updateExchangeProduct(orderItem.id, null)
                                }
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color="#999999"
                                />
                              </TouchableOpacity>
                            </View>

                            {/* Price Difference */}
                            {(() => {
                              const priceDiff = calculatePriceDifference(
                                orderItem.unitPrice,
                                selectedItem.exchangeProduct.price,
                              );
                              return priceDiff !== 0 ? (
                                <View
                                  className={`mt-2 p-2 rounded-lg ${
                                    priceDiff > 0 ? "bg-red-50" : "bg-green-50"
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-semibold ${
                                      priceDiff > 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {priceDiff > 0
                                      ? `Bạn cần thanh toán thêm: ${formatCurrency(priceDiff)}`
                                      : `Bạn sẽ được hoàn: ${formatCurrency(Math.abs(priceDiff))}`}
                                  </Text>
                                </View>
                              ) : (
                                <View className="mt-2 p-2 rounded-lg bg-blue-50">
                                  <Text className="text-xs font-semibold text-blue-600">
                                    Đổi ngang giá
                                  </Text>
                                </View>
                              );
                            })()}
                          </View>
                        ) : (
                          <TouchableOpacity
                            className="bg-primary/10 border border-primary border-dashed rounded-xl p-3 flex-row items-center justify-center"
                            onPress={() => openProductSelector(orderItem.id)}
                          >
                            <Ionicons
                              name="add-circle-outline"
                              size={20}
                              color="#F18F01"
                            />
                            <Text className="text-primary font-semibold text-xs ml-2">
                              Chọn sản phẩm muốn đổi
                            </Text>
                          </TouchableOpacity>
                        )}
                        <Text className="text-xs text-textGray mt-2">
                          💡 Chọn sản phẩm cùng loại để đổi sang
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {order.orderItems?.length === 0 && (
            <Text className="text-center text-textGray py-4">
              Không có sản phẩm trong đơn hàng
            </Text>
          )}
        </View>

        {/* Return Reasons */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Lý do{" "}
            {returnType === "RETURN"
              ? "trả hàng"
              : returnType === "EXCHANGE"
                ? "đổi hàng"
                : "bảo hành"}{" "}
            <Text className="text-red-500">*</Text>
          </Text>
          {getApplicableReasons().map((reasonOption, index) => (
            <TouchableOpacity
              key={`reason-${reasonOption.id}-${index}`}
              className={`flex-row items-center p-3 mb-2 rounded-xl border-2 ${
                reason === reasonOption.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }`}
              onPress={() => setReason(reasonOption.value)}
            >
              <Ionicons
                name={reasonOption.icon}
                size={24}
                color={reason === reasonOption.value ? "#F18F01" : "#999999"}
              />
              <Text
                className={`flex-1 text-sm ml-3 ${
                  reason === reasonOption.value
                    ? "text-primary font-semibold"
                    : "text-text"
                }`}
              >
                {reasonOption.value}
              </Text>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  reason === reasonOption.value
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {reason === reasonOption.value && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Custom reason input */}
          {reason === "Lý do khác" && (
            <TextInput
              className="bg-background rounded-xl p-3 text-sm text-text mt-2"
              placeholder="Nhập lý do cụ thể (ít nhất 10 ký tự)..."
              value={description}
              onChangeText={setReason}
              multiline
              numberOfLines={2}
            />
          )}
        </View>

        {/* Description */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Mô tả chi tiết (Tùy chọn)
          </Text>
          <TextInput
            className="bg-background rounded-xl p-3 text-sm text-text min-h-24"
            placeholder="Vui lòng mô tả chi tiết về lý do đổi/trả..."
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
          />
          <Text className="text-xs text-textGray mt-2">
            {description.length}/1000 ký tự
          </Text>
        </View>

        {/* Upload Images */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-sm font-bold text-text mb-1">
            Hình ảnh chứng minh
          </Text>
          <ImageUploader images={images} onChange={setImages} maxImages={5} />
        </View>

        {/* Return Policy */}
        <View className="bg-accent/10 mx-5 rounded-xl p-4 mb-6">
          <View className="flex-row items-start mb-2">
            <Ionicons name="information-circle" size={20} color="#F18F01" />
            <Text className="text-sm font-bold text-text ml-2">
              Chính sách đổi/trả/bảo hành
            </Text>
          </View>
          <Text className="text-xs text-textGray leading-5">
            {returnType === "RETURN" &&
              `• Sản phẩm còn nguyên tem, nhãn mác, chưa qua sử dụng\n• Trong thời gian 7 ngày kể từ khi đơn hàng hoàn thành\n• Không áp dụng với sản phẩm theo toa`}
            {returnType === "EXCHANGE" &&
              `• Sản phẩm còn nguyên tem, nhãn mác, chưa qua sử dụng\n• Trong thời gian 7 ngày kể từ khi đơn hàng hoàn thành\n• Thanh toán chênh lệch (nếu có)`}
            {returnType === "WARRANTY" &&
              `• Sản phẩm bị lỗi do nhà sản xuất\n• Trong thời gian 15 ngày kể từ khi đơn hàng hoàn thành\n• Thời gian xử lý: 3-5 ngày làm việc`}
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white border-t border-border px-5 py-4">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            submitting ? "bg-gray-400" : "bg-primary"
          }`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Gửi yêu cầu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Selector Modal */}
      {selectingForOrderItemId && (
        <ProductSelectorModal
          visible={showProductSelector}
          onClose={() => {
            setShowProductSelector(false);
            setSelectingForOrderItemId(null);
          }}
          onSelectProduct={handleProductSelected}
          currentProductType={
            selectedItems.find(
              (item) => item.orderItemId === selectingForOrderItemId,
            )?.orderItem?.product?.type || "FRAME"
          }
          currentProductId={
            selectedItems.find(
              (item) => item.orderItemId === selectingForOrderItemId,
            )?.orderItem?.productId
          }
        />
      )}
    </View>
  );
}
