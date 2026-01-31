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
import {
  getProductById,
  getProductImages,
  formatPrice,
} from "../../services/productService";
import { getProductAvailableQuantity } from "../../services/inventoryService";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen({ navigation, route }) {
  const productId = route.params?.productId || route.params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // TODO: Remove these when variants/favorites APIs are available
  // const [selectedColor, setSelectedColor] = useState("");
  // const [selectedSize, setSelectedSize] = useState("");
  // const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

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

      setAvailableQuantity(quantityResult.success ? quantityResult.data : 0);
    } catch (error) {
      console.error("Error loading product details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
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
        { label: "Tồn kho", value: `${availableQuantity} sản phẩm` },
        {
          label: "Tình trạng",
          value: product.isPreorder
            ? `Đặt trước (${product.leadTimeDays || 7} ngày)`
            : availableQuantity > 0 ? "Sẵn hàng" : "Hết hàng",
        },
      ]
    : [];

  const handleAddToCart = () => {
    if (!product) return;

    // Check if out of stock
    if (availableQuantity === 0) {
      Alert.alert("Thông báo", "Sản phẩm hiện đã hết hàng");
      return;
    }

    // Nếu là tròng kính, chuyển đến màn hình đặt tròng + gọng
    if (product.type === "LENS") {
      navigation.navigate("LensOrder", {
        selectedLensFromProduct: {
          id: product.id,
          name: product.name,
          price: formatPrice(product.price),
          image:
            images[0] ||
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
        },
      });
      return;
    }

    Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
    navigation.navigate("Cart");
  };

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
      requireDeposit: product.isPreorder || false,
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

          {/* TODO: Rating section - need reviews API */}

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
          <TouchableOpacity
            className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 mb-5 flex-row items-center shadow-md"
            style={{ backgroundColor: "#2E86AB" }}
            onPress={() =>
              navigation.navigate("VirtualTryOn", { productId: product.id })
            }
          >
            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-4">
              <Ionicons name="glasses-outline" size={28} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                Thử kính ảo AR
              </Text>
              <Text className="text-sm text-white/80">
                Xem kính vừa với khuôn mặt của bạn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

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

          {/* TODO: Reviews Section - need reviews API */}
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 flex-row bg-white p-4 gap-3 shadow-lg">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-background rounded-xl py-3.5 border-2 border-primary gap-2"
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#2E86AB" />
          <Text className="text-base font-bold text-primary">Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary rounded-xl py-4 items-center justify-center"
          onPress={handleBuyNow}
        >
          <Text className="text-base font-bold text-white">Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
