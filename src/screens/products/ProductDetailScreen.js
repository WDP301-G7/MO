import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getProductById,
  getProductImages,
  formatPrice,
} from "../../services/productService";
import { getProductAvailableQuantity } from "../../services/inventoryService";
import {
  getProductReviews,
  getEligibleReviews,
} from "../../services/reviewService";
import { getCurrentUser } from "../../services/authService";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen({ navigation, route }) {
  const productId = route.params?.productId || route.params?.id;
  const orderItemId = route.params?.orderItemId;
  const orderId = route.params?.orderId;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [eligibleOrderItem, setEligibleOrderItem] = useState(null);
  // TODO: Remove these when variants/favorites APIs are available
  // const [selectedColor, setSelectedColor] = useState("");
  // const [selectedSize, setSelectedSize] = useState("");
  // const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
    loadCurrentUser();
  }, [productId]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      // Silent error
    }
  };

  // Reload reviews and eligible status when screen is focused (e.g., after writing a review)
  useFocusEffect(
    React.useCallback(() => {
      if (productId) {
        loadReviews(1);
        loadEligibleOrderItem();
      }
    }, [productId]),
  );

  const loadEligibleOrderItem = async () => {
    try {
      const response = await getEligibleReviews();
      const items = response?.data || [];
      const match = items.find((item) => item.productId === productId);
      setEligibleOrderItem(match || null);
    } catch (error) {
      // Silent error
    }
  };

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const [productResult, imagesResult, quantityResult] = await Promise.all([
        getProductById(productId),
        getProductImages(productId),
        getProductAvailableQuantity(productId),
      ]);

      // Check if product data loaded successfully
      if (!productResult.success || !productResult.data) {
        Alert.alert(
          "Lỗi",
          productResult.message || "Không thể tải thông tin sản phẩm",
        );
        return;
      }

      const productData = productResult.data;
      setProduct(productData);

      // Set images or use fallback
      if (
        imagesResult.success &&
        imagesResult.data &&
        imagesResult.data.length > 0
      ) {
        const sortedImages = [...imagesResult.data].sort((a, b) =>
          b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
        );
        setImages(sortedImages.map((img) => img.imageUrl));
      } else {
        // Fallback image based on product type
        const fallbackImage =
          productData.type === "FRAME"
            ? "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400"
            : productData.type === "LENS"
              ? "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400"
              : "https://images.unsplash.com/photo-1622519407650-3df9883f76e6?w=400";
        setImages([fallbackImage]);
      }

      setAvailableQuantity(
        quantityResult.success && quantityResult.data?.totalAvailable
          ? quantityResult.data.totalAvailable
          : 0,
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (page = 1) => {
    try {
      setReviewsLoading(true);
      const response = await getProductReviews(productId, page, 5);

      // API returns: {statusCode, message, data: {data: [...], meta: {...}}, error}
      let reviewsData = [];
      let meta = {};
      let avgRating = 0;
      let total = 0;

      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Nested structure - standard API response
        reviewsData = response.data.data;
        meta = response.data.meta || {};
        total = meta.total || 0;

        // Calculate average rating from reviews data if not provided by backend
        if (reviewsData.length > 0) {
          const sumRatings = reviewsData.reduce(
            (sum, review) => sum + (review.rating || 0),
            0,
          );
          avgRating = parseFloat((sumRatings / reviewsData.length).toFixed(1));
        }
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array structure
        reviewsData = response.data;
        meta = response.meta || {};
        total = meta.total || reviewsData.length;

        // Calculate average rating
        if (reviewsData.length > 0) {
          const sumRatings = reviewsData.reduce(
            (sum, review) => sum + (review.rating || 0),
            0,
          );
          avgRating = parseFloat((sumRatings / reviewsData.length).toFixed(1));
        }
      }

      if (page === 1) {
        setReviews(reviewsData);
      } else {
        setReviews((prev) => [...prev, ...reviewsData]);
      }

      setAverageRating(avgRating);
      setTotalReviews(total);
      setHasMoreReviews(meta.page < meta.totalPages);
      setReviewsPage(page);
    } catch (error) {
      // Don't show alert, just log the error
      if (page === 1) {
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  // TODO: Colors and sizes should come from backend product variants
  // Temporarily hidden until backend API is available
  // const colors = [];
  // const sizes = [];

  const specifications = product
    ? [
        {
          label: "Loại sản phẩm",
          value:
            product.type === "FRAME"
              ? "Gọng kính"
              : product.type === "LENS"
                ? "Tròng kính"
                : "Dịch vụ",
        },
        { label: "Thương hiệu", value: product.brand || "Chưa cập nhật" },
        {
          label: "Tình trạng",
          value: product.isPreorder
            ? `Đặt trước (${product.leadTimeDays || 7} ngày)`
            : availableQuantity > 0
              ? "Sẵn hàng"
              : "Hết hàng",
        },
      ]
    : [];

  // Derived: check if the current user already has a review for this product
  const userHasReviewed =
    currentUserId && reviews.some((r) => r.customerId === currentUserId);

  // Cart functionality removed - user goes directly to checkout
  // const handleAddToCart = () => {
  //   if (!product) return;
  //   if (availableQuantity === 0) {
  //     Alert.alert("Thông báo", "Sản phẩm hiện đã hết hàng");
  //     return;
  //   }
  //   if (product.type === "LENS") {
  //     navigation.navigate("LensOrder", {...});
  //     return;
  //   }
  //   Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
  //   navigation.navigate("Cart");
  // };

  const handleBuyNow = () => {
    if (!product) return;

    // Check if out of stock
    if (availableQuantity === 0) {
      Alert.alert("Thông báo", "Sản phẩm hiện đã hết hàng");
      return;
    }

    // Kiểm tra nếu là tròng kính thì phải đến cửa hàng
    const isLens = product.type === "LENS";

    navigation.navigate("Checkout", {
      productType: isLens ? "lens_only" : "normal",
      requiresStore: isLens, // Tròng kính phải lắp tại cửa hàng
      fromProduct: true,
      product: {
        id: product.id,
        name: product.name,
        price: formatPrice(product.price),
        image: images[0],
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-sm text-textGray mt-4">Đang tải...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-lg text-text">Không tìm thấy sản phẩm</Text>
        <TouchableOpacity
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
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
      <View className="absolute top-0 left-0 right-0 flex-row justify-between pt-12 px-5 pb-4 z-10">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-lg"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-lg"
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={24} color="#333333" />
          {/* TODO: Cart count badge - need cart API */}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="bg-white">
          <Image
            source={{ uri: images[selectedImage] }}
            style={{ width: width, height: width }}
            resizeMode="cover"
          />

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <View className="px-5 py-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {images.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(index)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      <Image
                        source={{ uri: image }}
                        className="w-16 h-16"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          {/* TODO: Favorite button - need favorites API */}
        </View>

        {/* Product Info */}
        <View className="bg-white mt-2 p-5">
          {/* Stock Status */}
          <View className="flex-row items-center self-start bg-background px-3 py-1.5 rounded-xl mb-3">
            <View
              className={`w-2 h-2 rounded-full mr-1.5 ${
                product.isPreorder
                  ? "bg-yellow-500"
                  : availableQuantity > 0
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />
            <Text className="text-xs font-semibold text-text">
              {product.isPreorder
                ? `Đặt trước (${product.leadTimeDays || 7} ngày)`
                : availableQuantity > 0
                  ? `Còn ${availableQuantity} sản phẩm`
                  : "Hết hàng"}
            </Text>
          </View>

          <Text className="text-sm text-textGray mb-2">
            {product.brand || "Không rõ thương hiệu"}
          </Text>
          <Text className="text-2xl font-bold text-text mb-3">
            {product.name}
          </Text>

          {/* Rating Summary */}
          {totalReviews > 0 && (
            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={
                      star <= Math.round(averageRating)
                        ? "star"
                        : "star-outline"
                    }
                    size={18}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text className="text-sm font-semibold text-text mr-1">
                {averageRating.toFixed(1)}
              </Text>
              <Text className="text-sm text-textGray">
                ({totalReviews} đánh giá)
              </Text>
            </View>
          )}

          {/* Price */}
          <View className="flex-row items-center mb-5">
            <Text className="text-[28px] font-bold text-primary mr-3">
              {`${formatPrice(product.price).toLocaleString("vi-VN")}đ`}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-border my-5" />

          {/* TODO: Colors and Sizes - need product variants API */}

          {/* Quantity */}
          <View className="mb-5">
            <Text className="text-base font-bold text-text mb-3">Số lượng</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                className="w-10 h-10 rounded-full border-2 border-border items-center justify-center"
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                <Ionicons name="remove" size={20} color="#333333" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-text min-w-[40px] text-center">
                {quantity}
              </Text>
              <TouchableOpacity
                className="w-10 h-10 rounded-full border-2 border-border items-center justify-center"
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#333333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-border my-5" />

          {/* Description */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-text mb-3">
              Mô tả sản phẩm
            </Text>
            <Text className="text-sm text-textGray leading-[22px]">
              {product.description ||
                `${product.name} - Sản phẩm chất lượng cao với thiết kế hiện đại và tinh tế.`}
            </Text>
          </View>

          {/* Virtual Try-On */}
          {/* Specifications */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-text mb-3">
              Thông số kỹ thuật
            </Text>
            {specifications.map((spec, index) => (
              <View
                key={index}
                className="flex-row justify-between py-3 border-b border-border"
              >
                <Text className="text-sm text-textGray">{spec.label}</Text>
                <Text className="text-sm font-semibold text-text">
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Reviews Section */}
          {reviewsLoading && totalReviews === 0 && (
            <View className="mb-5 py-6 items-center">
              <ActivityIndicator size="small" color="#2E86AB" />
              <Text className="text-sm text-textGray mt-2">
                Đang tải đánh giá...
              </Text>
            </View>
          )}

          {!reviewsLoading && totalReviews > 0 && (
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-lg font-bold text-text mb-1">
                    Đánh giá sản phẩm
                  </Text>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={
                            star <= Math.round(averageRating)
                              ? "star"
                              : "star-outline"
                          }
                          size={16}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                    <Text className="text-sm text-textGray">
                      {averageRating.toFixed(1)} ({totalReviews} đánh giá)
                    </Text>
                  </View>
                </View>
                {eligibleOrderItem && !userHasReviewed && (
                  <TouchableOpacity
                    className="bg-primary rounded-lg px-3 py-2 flex-row items-center"
                    onPress={() =>
                      navigation.navigate("WriteReview", {
                        orderItem: {
                          id: eligibleOrderItem.orderItemId,
                          productId: productId,
                          product: product,
                        },
                        isEdit: false,
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-xs ml-1">
                      Viết đánh giá
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Reviews List */}
              {reviews.map((review, index) => {
                return (
                  <View
                    key={review.id}
                    className="bg-background rounded-xl p-4 mb-3"
                  >
                    <View className="flex-row items-start mb-2">
                      <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                        <Text className="text-white font-bold">
                          {review.customer?.fullName?.charAt(0).toUpperCase() ||
                            "U"}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm font-semibold text-text">
                            {review.customer?.fullName || "Khách hàng"}
                          </Text>
                          {currentUserId === review.customerId &&
                            new Date(review.editableUntil) > new Date() && (
                              <TouchableOpacity
                                className="bg-background rounded-lg px-2 py-1 flex-row items-center"
                                onPress={() =>
                                  navigation.navigate("WriteReview", {
                                    orderItem: {
                                      id: review.orderItemId,
                                      productId: review.productId,
                                      product: review.product,
                                    },
                                    isEdit: true,
                                    existingReview: review,
                                  })
                                }
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={14}
                                  color="#F18F01"
                                />
                                <Text className="text-primary font-semibold text-xs ml-1">
                                  Sửa
                                </Text>
                              </TouchableOpacity>
                            )}
                        </View>
                        <View className="flex-row items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={
                                star <= review.rating ? "star" : "star-outline"
                              }
                              size={14}
                              color="#FFD700"
                            />
                          ))}
                          <Text className="text-xs text-textGray ml-2">
                            {formatDate(review.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {review.comment && (
                      <Text className="text-sm text-text leading-5 mb-2">
                        {review.comment}
                      </Text>
                    )}

                    {review.images && review.images.length > 0 && (
                      <View className="flex-row gap-2">
                        {review.images.slice(0, 3).map((img, idx) => {
                          const uri =
                            typeof img === "string" ? img : img?.imageUrl;
                          if (!uri) return null;
                          return (
                            <Image
                              key={idx}
                              source={{ uri }}
                              className="w-16 h-16 rounded-lg"
                              resizeMode="cover"
                            />
                          );
                        })}
                        {review.images.length > 3 && (
                          <View className="w-16 h-16 rounded-lg bg-gray-200 items-center justify-center">
                            <Text className="text-xs text-textGray font-semibold">
                              +{review.images.length - 3}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {review.replyContent && (
                      <View className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
                        <View className="flex-row items-center mb-1">
                          <Ionicons
                            name="storefront"
                            size={14}
                            color="#2E86AB"
                          />
                          <Text className="text-xs font-bold text-primary ml-1">
                            Phản hồi từ cửa hàng
                          </Text>
                        </View>
                        <Text className="text-sm text-text">
                          {review.replyContent}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Load More Button */}
              {hasMoreReviews && (
                <TouchableOpacity
                  className="bg-white rounded-xl py-3 items-center border border-border"
                  onPress={() => loadReviews(reviewsPage + 1)}
                  disabled={reviewsLoading}
                >
                  {reviewsLoading ? (
                    <ActivityIndicator size="small" color="#2E86AB" />
                  ) : (
                    <Text className="text-primary font-semibold">
                      Xem thêm đánh giá
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {!reviewsLoading && totalReviews === 0 && (
            <View className="mb-5">
              <Text className="text-lg font-bold text-text mb-4">
                Đánh giá sản phẩm
              </Text>
              <View className="bg-background rounded-xl p-6 items-center">
                <Ionicons name="chatbox-outline" size={48} color="#CCCCCC" />
                <Text className="text-sm text-textGray mt-2 mb-4">
                  Chưa có đánh giá nào cho sản phẩm này
                </Text>
                {eligibleOrderItem && !userHasReviewed && (
                  <TouchableOpacity
                    className="bg-primary rounded-lg px-4 py-2.5 flex-row items-center"
                    onPress={() =>
                      navigation.navigate("WriteReview", {
                        orderItem: {
                          id: eligibleOrderItem.orderItemId,
                          productId: productId,
                          product: product,
                        },
                        isEdit: false,
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-sm ml-2">
                      Viết đánh giá đầu tiên
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Bar - Buy Now Only */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center justify-center"
          onPress={handleBuyNow}
        >
          <Text className="text-base font-bold text-white">Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
