import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getEligibleReviews,
  getMyReviews,
  isReviewEditable,
} from "../../services/reviewService";
import { getProductImages } from "../../services/productService";

const FALLBACK_IMAGES = {
  FRAME: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
  LENS: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
  DEFAULT: "https://images.unsplash.com/photo-1622519407650-3df9883f76e6?w=400",
};

function ProductThumbnail({ productId, productType }) {
  const [imageUri, setImageUri] = React.useState(null);

  React.useEffect(() => {
    if (!productId) return;
    getProductImages(productId).then((result) => {
      if (result.success && result.data?.length > 0) {
        const sorted = [...result.data].sort((a, b) =>
          b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
        );
        setImageUri(sorted[0].imageUrl);
      } else {
        setImageUri(FALLBACK_IMAGES[productType] || FALLBACK_IMAGES.DEFAULT);
      }
    });
  }, [productId]);

  const sizeStyle = { width: 80, height: 80 };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[sizeStyle, { borderRadius: 8 }]}
        className="bg-gray-100"
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[sizeStyle, { borderRadius: 8 }]}
      className="bg-gray-100 items-center justify-center"
    >
      <Ionicons
        name={productType === "FRAME" ? "glasses-outline" : "eye-outline"}
        size={32}
        color="#2E86AB"
      />
    </View>
  );
}

export default function MyReviewsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("pending"); // pending, reviewed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eligibleItems, setEligibleItems] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, reviews] = await Promise.all([
        loadEligibleItems(),
        loadMyReviews(),
      ]);

      // Remove products already reviewed and deduplicate by productId
      // (user may have bought the same product multiple times, but can only review once per product)
      const reviewedProductIds = new Set(reviews.map((r) => r.productId));
      const seenProductIds = new Set();
      const filteredItems = items.filter((item) => {
        if (reviewedProductIds.has(item.productId)) return false;
        if (seenProductIds.has(item.productId)) return false;
        seenProductIds.add(item.productId);
        return true;
      });
      setEligibleItems(filteredItems);
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleItems = async () => {
    try {
      const response = await getEligibleReviews();

      // API returns: {data: [...], error, message, statusCode}
      return response?.data || [];
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm chờ đánh giá");
      return [];
    }
  };

  const loadMyReviews = async (pageNum = 1) => {
    try {
      const response = await getMyReviews(pageNum, 10);

      // API returns: {data: {data: [...], meta: {...}}, error, message, statusCode}
      const reviewsData = response?.data?.data || [];
      const meta = response?.data?.meta || {};

      if (pageNum === 1) {
        setMyReviews(reviewsData);
      } else {
        setMyReviews((prev) => [...prev, ...reviewsData]);
      }

      // Handle pagination from meta
      setHasMore(meta.page < meta.totalPages);
      setPage(pageNum);
      return reviewsData;
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lịch sử đánh giá");
      // Ensure myReviews remains an array on error
      if (pageNum === 1) {
        setMyReviews([]);
      }
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleWriteReview = (item) => {
    navigation.navigate("ProductDetail", { productId: item.productId });
  };

  const handleEditReview = (review) => {
    if (!isReviewEditable(review.createdAt)) {
      Alert.alert(
        "Không thể sửa",
        "Đánh giá chỉ có thể sửa trong vòng 7 ngày sau khi tạo",
      );
      return;
    }

    // Transform review data to orderItem structure for WriteReviewScreen
    const transformedOrderItem = {
      id: review.orderItemId,
      orderId: review.orderId,
      productId: review.productId,
      product: {
        id: review.productId,
        name: review.productName,
        type: review.productType,
        images: review.images || [],
      },
    };

    navigation.navigate("WriteReview", {
      orderItem: transformedOrderItem,
      isEdit: true,
      existingReview: review,
      onRefresh: loadData,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const tabs = [
    {
      key: "pending",
      label: "Chờ đánh giá",
      count: Array.isArray(eligibleItems) ? eligibleItems.length : 0,
    },
    {
      key: "reviewed",
      label: "Đã đánh giá",
      count: Array.isArray(myReviews) ? myReviews.length : 0,
    },
  ];

  const renderPendingItems = () => {
    // Safety check to ensure eligibleItems is an array
    const items = Array.isArray(eligibleItems) ? eligibleItems : [];

    if (items.length === 0) {
      return (
        <View className="items-center justify-center py-20 px-8">
          <Ionicons name="checkmark-circle-outline" size={80} color="#4CAF50" />
          <Text className="text-lg font-bold text-text mt-4">
            Không có sản phẩm cần đánh giá
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Bạn đã đánh giá tất cả sản phẩm hoặc chưa có đơn hàng nào hoàn thành
          </Text>
        </View>
      );
    }

    return (
      <View className="px-5 py-5">
        {items.map((item) => {
          // API returns: orderItemId, orderId, productId, productName, productType, unitPrice, quantity, orderCompletedAt, deadline
          // No images in API response - will need to fetch from Product API or show placeholder

          // Extract product name (direct field from API)
          const productName = item.productName || "Sản phẩm không xác định";

          // Extract product type (direct field from API)
          const productType = item.productType || "UNKNOWN";

          const productTypeLabel =
            productType === "FRAME"
              ? "Gọng kính"
              : productType === "LENS"
                ? "Tròng kính"
                : "Sản phẩm";

          // Format order ID to be shorter (first 8 chars)
          const shortOrderId = item.orderId
            ? item.orderId.substring(0, 8).toUpperCase()
            : "N/A";

          // Format order completed date
          const formattedDate = item.orderCompletedAt
            ? formatDate(item.orderCompletedAt)
            : "";

          return (
            <View
              key={item.orderItemId}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row mb-3">
                <ProductThumbnail
                  productId={item.productId}
                  productType={productType}
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-bold text-text mb-1"
                    numberOfLines={2}
                  >
                    {productName}
                  </Text>
                  <Text className="text-xs text-textGray mb-1">
                    {productTypeLabel}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-textGray">
                      Đơn #{shortOrderId}
                    </Text>
                    {formattedDate && (
                      <>
                        <Text className="text-xs text-textGray mx-1">•</Text>
                        <Text className="text-xs text-textGray">
                          {formattedDate}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              <View className="bg-yellow-50 rounded-lg p-3 mb-3 flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#F18F01" />
                <Text className="text-xs text-yellow-800 ml-2 flex-1">
                  Bạn có 30 ngày để đánh giá sản phẩm này
                </Text>
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-3 items-center"
                onPress={() => handleWriteReview(item)}
              >
                <Text className="text-white font-bold">Viết đánh giá</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const handleViewProduct = (review) => {
    // Navigate to product detail with productId
    const productId = review.productId || review.orderItem?.productId;
    if (productId) {
      navigation.navigate("ProductDetail", { productId });
    } else {
      Alert.alert("Lỗi", "Không tìm thấy thông tin sản phẩm");
    }
  };

  const renderReviewedItems = () => {
    // Safety check to ensure myReviews is an array
    const reviews = Array.isArray(myReviews) ? myReviews : [];

    if (reviews.length === 0) {
      return (
        <View className="items-center justify-center py-20 px-8">
          <Ionicons name="chatbox-outline" size={80} color="#CCCCCC" />
          <Text className="text-lg font-bold text-text mt-4">
            Chưa có đánh giá
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Bạn chưa đánh giá sản phẩm nào
          </Text>
        </View>
      );
    }

    return (
      <View className="px-5 py-5">
        {reviews.map((review) => {
          const canEdit = isReviewEditable(review.createdAt);

          // Extract product info from API response
          // API might return: id, productId, productName, productType, orderItemId, orderId, rating, comment, images, status, reply...
          const productId = review.productId;

          // Try multiple possible field names for product name
          const productName =
            review.productName ||
            review.product?.name ||
            review.orderItem?.product?.name ||
            review.orderItem?.productSnapshot?.name ||
            "Sản phẩm";

          // Try multiple possible field names for product type
          const productType =
            review.productType ||
            review.product?.type ||
            review.orderItem?.product?.type ||
            review.orderItem?.productSnapshot?.type ||
            "FRAME";

          const productTypeLabel =
            productType === "FRAME"
              ? "Gọng kính"
              : productType === "LENS"
                ? "Tròng kính"
                : "Sản phẩm";

          return (
            <TouchableOpacity
              key={review.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              onPress={() => handleViewProduct(review)}
              activeOpacity={0.8}
            >
              <View className="flex-row mb-3">
                <ProductThumbnail
                  productId={productId}
                  productType={productType}
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-bold text-text mb-1"
                    numberOfLines={2}
                  >
                    {productName}
                  </Text>
                  <Text className="text-xs text-textGray mb-1">
                    {productTypeLabel}
                  </Text>
                  <Text className="text-xs text-textGray">
                    {formatDate(review.createdAt)}
                  </Text>
                  {review.status === "PUBLISHED" && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#4CAF50"
                      />
                      <Text className="text-xs text-green-600 ml-1">
                        Đã công khai
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="flex-row mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= review.rating ? "star" : "star-outline"}
                    size={18}
                    color="#FFD700"
                  />
                ))}
              </View>

              {review.comment && (
                <Text className="text-sm text-text leading-5 mb-3">
                  {review.comment}
                </Text>
              )}

              {review.images && review.images.length > 0 && (
                <View className="flex-row gap-2 mb-3">
                  {review.images.map((img, idx) => {
                    const uri = typeof img === "string" ? img : img?.imageUrl;
                    if (!uri) return null;
                    return (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={{ width: 64, height: 64, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                    );
                  })}
                </View>
              )}

              {review.reply && (
                <View className="bg-blue-50 rounded-lg p-3 mb-3 border-l-4 border-primary">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="storefront" size={16} color="#2E86AB" />
                    <Text className="text-xs font-bold text-primary ml-1">
                      Phản hồi từ cửa hàng
                    </Text>
                  </View>
                  <Text className="text-sm text-text">{review.reply}</Text>
                </View>
              )}

              <View className="flex-row items-center justify-between border-t border-border pt-3">
                <TouchableOpacity
                  className="flex-1 flex-row items-center"
                  onPress={() => handleViewProduct(review)}
                >
                  <Ionicons name="eye-outline" size={14} color="#2E86AB" />
                  <Text className="text-xs text-primary ml-1">
                    Xem sản phẩm
                  </Text>
                </TouchableOpacity>
                {canEdit ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditReview(review);
                    }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#4CAF50"
                      />
                      <Text className="text-sm text-green-600 font-semibold ml-1">
                        Chỉnh sửa
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="lock-closed" size={12} color="#999999" />
                    <Text className="text-xs text-textGray ml-1">
                      Không thể sửa
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {hasMore && (
          <TouchableOpacity
            className="bg-white rounded-xl py-3 items-center mt-2"
            onPress={() => loadMyReviews(page + 1)}
          >
            <Text className="text-primary font-semibold">Xem thêm</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-sm text-textGray mt-4">Đang tải...</Text>
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
          <Text className="text-xl font-bold text-text">Đánh giá của tôi</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white px-5 py-3 flex-row border-b border-border">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-2 items-center border-b-2 ${
              activeTab === tab.key ? "border-primary" : "border-transparent"
            }`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? "text-primary" : "text-textGray"
              }`}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "pending" ? renderPendingItems() : renderReviewedItems()}
      </ScrollView>
    </View>
  );
}
