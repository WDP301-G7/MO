import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useReturns } from "../../contexts/ReturnsContext";
import ReturnStatusBadge from "../../components/returns/ReturnStatusBadge";
import ImageUploader from "../../components/returns/ImageUploader";
import { getProductById } from "../../services/productService";
import {
  RETURN_TYPE_LABELS,
  RETURN_STATUS_LABELS,
  PRODUCT_CONDITION_LABELS,
  REFUND_METHOD_LABELS,
} from "../../services/returnService";

export default function ReturnDetailScreen({ navigation, route }) {
  const { returnId } = route.params;
  const {
    currentReturn,
    loading,
    error,
    fetchReturnDetail,
    cancelReturn,
    uploadImages,
    deleteImage,
  } = useReturns();

  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [productImagesMap, setProductImagesMap] = useState({});

  // Fetch return detail when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchReturnDetail(returnId);
    }, [returnId, fetchReturnDetail]),
  );

  // Fetch product images for all items
  useEffect(() => {
    const fetchProductImages = async () => {
      if (!currentReturn) return;

      const items = currentReturn.returnItems || currentReturn.items || [];
      const imagesMap = {};

      // Fetch images for each product
      await Promise.all(
        items.map(async (item) => {
          if (item.productId && !productImagesMap[item.productId]) {
            try {
              const result = await getProductById(item.productId);
              if (result.success && result.data?.images?.[0]) {
                imagesMap[item.productId] = result.data.images[0].imageUrl;
              }
            } catch (error) {
              // Silent error
            }
          }
        }),
      );

      if (Object.keys(imagesMap).length > 0) {
        setProductImagesMap((prev) => ({ ...prev, ...imagesMap }));
      }
    };

    fetchProductImages();
  }, [currentReturn]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReturnDetail(returnId);
    setRefreshing(false);
  };

  // Upload additional images
  const handleUploadImages = async () => {
    if (newImages.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất 1 ảnh");
      return;
    }

    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn upload ${newImages.length} ảnh?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Upload",
          onPress: async () => {
            setUploadingImages(true);
            const result = await uploadImages(returnId, newImages);
            setUploadingImages(false);

            if (result.success) {
              Alert.alert("Thành công", result.message);
              setNewImages([]);
            } else {
              Alert.alert("Lỗi", result.message);
            }
          },
        },
      ],
    );
  };

  // Delete existing image
  const handleDeleteImage = async (imageId) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa ảnh này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const result = await deleteImage(returnId, imageId);
          if (result.success) {
            Alert.alert("Thành công", result.message);
          } else {
            Alert.alert("Lỗi", result.message);
          }
        },
      },
    ]);
  };

  // Cancel return request
  const handleCancelReturn = async () => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc muốn hủy yêu cầu đổi/trả/bảo hành này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy yêu cầu",
          style: "destructive",
          onPress: async () => {
            const result = await cancelReturn(returnId);
            if (result.success) {
              Alert.alert("Thành công", result.message, [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert("Lỗi", result.message);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !currentReturn) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#F18F01" />
        <Text className="text-sm text-textGray mt-4">Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!currentReturn) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={80} color="#CCCCCC" />
        <Text className="text-lg font-bold text-text mt-4 text-center">
          Không tìm thấy yêu cầu
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

  const typeInfo = RETURN_TYPE_LABELS[currentReturn.type] || {
    label: currentReturn.type,
    icon: "📦",
  };
  const statusInfo = RETURN_STATUS_LABELS[currentReturn.status] || {};
  const canUploadImages = currentReturn.status === "PENDING";
  const canCancelReturn = currentReturn.status === "PENDING";

  // Filter customer uploaded images (check both returnImages and images fields)
  // Accept CUSTOMER_PROOF, CUSTOMER_PRODUCT, or any non-STAFF type
  const customerImages =
    currentReturn.returnImages?.filter(
      (img) =>
        img.imageType === "CUSTOMER_PROOF" ||
        img.imageType === "CUSTOMER_PRODUCT" ||
        (img.imageType && !img.imageType.includes("STAFF")),
    ) ||
    currentReturn.images?.filter(
      (img) =>
        img.imageType === "CUSTOMER_PROOF" ||
        img.imageType === "CUSTOMER_PRODUCT" ||
        (img.imageType && !img.imageType.includes("STAFF")),
    ) ||
    [];

  // Filter staff uploaded images
  const staffImages =
    currentReturn.returnImages?.filter(
      (img) =>
        img.imageType === "STAFF_RECEIVED" || img.imageType?.includes("STAFF"),
    ) ||
    currentReturn.images?.filter(
      (img) =>
        img.imageType === "STAFF_RECEIVED" || img.imageType?.includes("STAFF"),
    ) ||
    [];

  // Helper to get product image from order items
  const getProductImage = (item) => {
    // Check if we have fetched image in our cache
    if (item.productId && productImagesMap[item.productId]) {
      return productImagesMap[item.productId];
    }

    // Try to get from order.items if available
    if (currentReturn.order?.items) {
      const orderItem = currentReturn.order.items.find(
        (oi) => oi.id === item.orderItemId || oi.productId === item.productId,
      );
      if (orderItem?.product?.images?.[0]?.imageUrl) {
        return orderItem.product.images[0].imageUrl;
      }
      if (orderItem?.product?.imageUrl) {
        return orderItem.product.imageUrl;
      }
    }

    // Fallback to placeholder
    return "https://via.placeholder.com/80";
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
              <Text className="text-xl font-bold text-text">
                Chi tiết đổi/trả/bảo hành
              </Text>
              <Text className="text-xs text-textGray">
                #{currentReturn.id.slice(0, 8)}...
              </Text>
            </View>
          </View>
          <ReturnStatusBadge status={currentReturn.status} size="small" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Type & Status Info */}
        <View className="bg-white px-5 py-4 mb-2">
          <View className="flex-row items-center mb-3">
            <Text style={{ fontSize: 28 }}>{typeInfo.icon}</Text>
            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-text">
                {typeInfo.label}
              </Text>
              <Text className="text-sm text-textGray mt-1">
                {statusInfo.description || ""}
              </Text>
            </View>
          </View>

          <View className="bg-background rounded-lg p-3">
            <Text className="text-xs text-textGray mb-1">Mã đơn hàng:</Text>
            <Text className="text-sm font-semibold text-text">
              {currentReturn.orderId}
            </Text>
            <Text className="text-xs text-textGray mt-2">
              Ngày tạo yêu cầu:
            </Text>
            <Text className="text-sm font-semibold text-text">
              {formatDate(currentReturn.createdAt)}
            </Text>
          </View>
        </View>

        {/* Products */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-base font-bold text-text mb-3">
            Sản phẩm đổi/trả/bảo hành
          </Text>
          {(currentReturn.returnItems || currentReturn.items)?.map(
            (item, index) => (
              <View
                key={item.id}
                className={`flex-row mb-3 ${
                  index <
                  (currentReturn.returnItems || currentReturn.items || [])
                    .length -
                    1
                    ? "border-b border-border pb-3"
                    : ""
                }`}
              >
                <Image
                  source={{
                    uri: getProductImage(item),
                  }}
                  className="w-20 h-20 rounded-lg bg-background"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-bold text-text"
                    numberOfLines={2}
                  >
                    {item.product?.name ||
                      item.orderItem?.product?.name ||
                      "Sản phẩm"}
                  </Text>
                  <Text className="text-xs text-textGray mt-1">
                    Số lượng: {item.quantity}
                  </Text>
                  <Text className="text-xs text-textGray">
                    Tình trạng:{" "}
                    {PRODUCT_CONDITION_LABELS[item.condition]?.label ||
                      item.condition}
                  </Text>
                  {(item.product?.price || item.orderItem?.product?.price) && (
                    <Text className="text-sm font-bold text-primary mt-1">
                      {formatCurrency(
                        item.product?.price || item.orderItem?.product?.price,
                      )}
                    </Text>
                  )}

                  {/* Exchange product */}
                  {item.exchangeProduct && (
                    <View className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <Text className="text-xs font-semibold text-blue-700 mb-1">
                        🔄 Đổi sang:
                      </Text>
                      <Text className="text-xs text-blue-600">
                        {item.exchangeProduct.name}
                      </Text>
                      <Text className="text-xs font-bold text-blue-700">
                        {formatCurrency(item.exchangeProduct.price)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ),
          )}
        </View>

        {/* Reason & Description */}
        <View className="bg-white px-5 py-4 mb-2">
          <Text className="text-base font-bold text-text mb-3">Lý do</Text>
          <View className="bg-background rounded-lg p-3">
            <Text className="text-sm font-semibold text-text mb-2">
              {currentReturn.reason}
            </Text>
            {currentReturn.description && (
              <Text className="text-sm text-textGray">
                {currentReturn.description}
              </Text>
            )}
          </View>
        </View>

        {/* Customer Images */}
        {customerImages.length > 0 && (
          <View className="bg-white px-5 py-4 mb-2">
            <Text className="text-base font-bold text-text mb-3">
              Ảnh chứng minh của bạn ({customerImages.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {customerImages.map((image) => (
                <View key={image.id} className="relative">
                  <Image
                    source={{ uri: image.imageUrl }}
                    style={{ width: 120, height: 120 }}
                    className="rounded-lg bg-background"
                    resizeMode="cover"
                  />
                  {canUploadImages && (
                    <TouchableOpacity
                      className="absolute -top-2 -right-2 bg-white rounded-full"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => handleDeleteImage(image.id)}
                    >
                      <Ionicons name="close-circle" size={28} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Upload Additional Images (only when PENDING) */}
        {canUploadImages && (
          <View className="bg-white px-5 py-4 mb-2">
            <Text className="text-base font-bold text-text mb-3">
              Thêm ảnh chứng minh
            </Text>
            <ImageUploader
              images={newImages}
              onChange={setNewImages}
              maxImages={5 - customerImages.length}
            />
            {newImages.length > 0 && (
              <TouchableOpacity
                className="bg-primary rounded-xl py-3 mt-3 flex-row items-center justify-center"
                onPress={handleUploadImages}
                disabled={uploadingImages}
              >
                {uploadingImages ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-bold ml-2">
                      Upload {newImages.length} ảnh
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Approval Info (APPROVED status) */}
        {currentReturn.status === "APPROVED" && (
          <View className="bg-white px-5 py-4 mb-2">
            <View className="bg-blue-50 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                <Text className="text-base font-bold text-blue-700 ml-2">
                  Yêu cầu đã được phê duyệt
                </Text>
              </View>

              {currentReturn.type === "RETURN" &&
                currentReturn.refundAmount && (
                  <>
                    <Text className="text-sm text-blue-600 mb-1">
                      Số tiền hoàn: {formatCurrency(currentReturn.refundAmount)}
                    </Text>
                    {currentReturn.refundMethod && (
                      <Text className="text-sm text-blue-600">
                        Phương thức:{" "}
                        {REFUND_METHOD_LABELS[currentReturn.refundMethod] ||
                          currentReturn.refundMethod}
                      </Text>
                    )}
                    <Text
                      className="text-sm text-blue-600 mt-2"
                      style={{ flexWrap: "wrap" }}
                    >
                      📦 Vui lòng mang sản phẩm tới cửa hàng để nhận hoàn tiền
                    </Text>
                  </>
                )}

              {currentReturn.type === "EXCHANGE" &&
                currentReturn.priceDifference !== null &&
                currentReturn.priceDifference !== 0 && (
                  <>
                    {currentReturn.priceDifference > 0 ? (
                      <Text className="text-sm text-red-600 font-semibold">
                        Bạn cần thanh toán thêm:{" "}
                        {formatCurrency(currentReturn.priceDifference)}
                      </Text>
                    ) : (
                      <Text className="text-sm text-green-600 font-semibold">
                        Bạn sẽ được hoàn:{" "}
                        {formatCurrency(
                          Math.abs(currentReturn.priceDifference),
                        )}
                      </Text>
                    )}
                    <Text
                      className="text-sm text-blue-600 mt-2"
                      style={{ flexWrap: "wrap" }}
                    >
                      📦 Vui lòng gửi sản phẩm cũ về cửa hàng để nhận sản phẩm
                      mới
                    </Text>
                  </>
                )}

              {currentReturn.type === "WARRANTY" && (
                <Text
                  className="text-sm text-blue-600 mt-2"
                  style={{ flexWrap: "wrap" }}
                >
                  🛡️ Vui lòng gửi sản phẩm về để được sửa chữa/thay thế. Thời
                  gian dự kiến: 3-5 ngày làm việc
                </Text>
              )}

              {currentReturn.approvedAt && (
                <Text className="text-xs text-textGray mt-2">
                  Phê duyệt lúc: {formatDate(currentReturn.approvedAt)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Rejection Info (REJECTED status) */}
        {currentReturn.status === "REJECTED" && (
          <View className="bg-white px-5 py-4 mb-2">
            <View className="bg-red-50 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="close-circle" size={24} color="#F44336" />
                <Text className="text-base font-bold text-red-700 ml-2">
                  Yêu cầu đã bị từ chối
                </Text>
              </View>
              {currentReturn.rejectionReason && (
                <Text className="text-sm text-red-600">
                  Lý do: {currentReturn.rejectionReason}
                </Text>
              )}
              {currentReturn.rejectedAt && (
                <Text className="text-xs text-textGray mt-2">
                  Từ chối lúc: {formatDate(currentReturn.rejectedAt)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Completion Info (COMPLETED status) */}
        {currentReturn.status === "COMPLETED" && (
          <View className="bg-white px-5 py-4 mb-2">
            <View className="bg-green-50 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="checkmark-done-circle"
                  size={24}
                  color="#4CAF50"
                />
                <Text className="text-base font-bold text-green-700 ml-2">
                  Đã hoàn tất xử lý
                </Text>
              </View>

              {currentReturn.refundedAt && (
                <Text className="text-sm text-green-600 mb-1">
                  Hoàn tiền lúc: {formatDate(currentReturn.refundedAt)}
                </Text>
              )}

              {currentReturn.refundAmount && (
                <Text className="text-sm text-green-600 font-semibold mb-1">
                  Số tiền đã hoàn: {formatCurrency(currentReturn.refundAmount)}
                </Text>
              )}

              {currentReturn.completionNote && (
                <Text className="text-sm text-green-600 mt-2">
                  Ghi chú: {currentReturn.completionNote}
                </Text>
              )}

              {currentReturn.completedAt && (
                <Text className="text-xs text-textGray mt-2">
                  Hoàn tất lúc: {formatDate(currentReturn.completedAt)}
                </Text>
              )}
            </View>

            {/* Staff received images */}
            {staffImages.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Ảnh hàng đã nhận ({staffImages.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {staffImages.map((image) => (
                    <Image
                      key={image.id}
                      source={{ uri: image.imageUrl }}
                      style={{ width: 120, height: 120 }}
                      className="rounded-lg bg-background"
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Order Info */}
        {currentReturn.order && (
          <View className="bg-white px-5 py-4 mb-2">
            <Text className="text-base font-bold text-text mb-3">
              Thông tin đơn hàng
            </Text>
            <TouchableOpacity
              className="bg-background rounded-lg p-3 flex-row items-center justify-between"
              onPress={() =>
                navigation.navigate("OrderDetail", {
                  orderId: currentReturn.orderId,
                })
              }
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text mb-1">
                  Đơn hàng #{currentReturn.orderId.slice(0, 8)}...
                </Text>
                <Text className="text-xs text-textGray">
                  Ngày đặt: {formatDate(currentReturn.order.createdAt)}
                </Text>
                {currentReturn.order.totalAmount && (
                  <Text className="text-sm font-bold text-primary mt-1">
                    {formatCurrency(currentReturn.order.totalAmount)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {canCancelReturn && (
        <View className="bg-white border-t border-border px-5 py-4">
          <TouchableOpacity
            className="border-2 border-red-500 rounded-xl py-4 items-center"
            onPress={handleCancelReturn}
          >
            <Text className="text-red-500 font-bold text-base">
              Hủy yêu cầu đổi/trả/bảo hành 
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
