import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SAMPLE_PRODUCTS } from "../../constants/data";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen({ navigation, route }) {
  const product = route.params?.product || SAMPLE_PRODUCTS[0];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedSize, setSelectedSize] = useState("M");
  const [isFavorite, setIsFavorite] = useState(false);

  const images = [product.image, product.image, product.image];
  const colors = [
    { id: "black", name: "Đen", hex: "#000000" },
    { id: "blue", name: "Xanh", hex: "#2E86AB" },
    { id: "brown", name: "Nâu", hex: "#8B4513" },
  ];
  const sizes = ["S", "M", "L"];

  const specifications = [
    { label: "Thương hiệu", value: product.brand },
    { label: "Chất liệu", value: "Titanium" },
    { label: "Màu sắc", value: "Đen, Xanh, Nâu" },
    { label: "Kích thước", value: "52-18-140" },
    { label: "Trọng lượng", value: "15g" },
    { label: "Bảo hành", value: "12 tháng" },
  ];

  const handleAddToCart = () => {
    // Nếu là tròng kính, chuyển đến màn hình đặt tròng + gọng
    if (product.category === "Tròng kính") {
      navigation.navigate("LensOrder", {
        selectedLensFromProduct: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        },
      });
      return;
    }

    alert("Đã thêm vào giỏ hàng");
    navigation.navigate("Cart");
  };

  const handleBuyNow = () => {
    // Kiểm tra nếu là tròng kính thì phải đến cửa hàng
    const isLens = product.category === "Tròng kính";

    navigation.navigate("Checkout", {
      productType: isLens ? "lens_only" : "normal",
      requireDeposit: false,
      requiresStore: isLens, // Tròng kính phải lắp tại cửa hàng
      fromProduct: true,
      product: product,
    });
  };

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
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4.5 h-4.5 items-center justify-center">
            <Text className="text-white text-[10px] font-bold">2</Text>
          </View>
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
          {product.discount && (
            <View className="absolute top-[100px] left-5 bg-red-500 px-3 py-1.5 rounded-lg">
              <Text className="text-white text-sm font-bold">
                -{product.discount}%
              </Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-[100px] right-5 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg"
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View className="bg-white mt-2 p-5">
          {/* Stock Status */}
          <View className="flex-row items-center self-start bg-background px-3 py-1.5 rounded-xl mb-3">
            <View
              className={`w-2 h-2 rounded-full mr-1.5 ${
                product.category === "Tròng kính"
                  ? "bg-yellow-500"
                  : product.stock === "Còn hàng"
                    ? "bg-green-500"
                    : product.stock === "Hết hàng"
                      ? "bg-red-500"
                      : "bg-yellow-500"
              }`}
            />
            <Text className="text-xs font-semibold text-text">
              {product.category === "Tròng kính"
                ? "Đặt trước"
                : product.stock || "Còn hàng"}
            </Text>
          </View>

          <Text className="text-sm text-textGray mb-2">{product.brand}</Text>
          <Text className="text-2xl font-bold text-text mb-3">
            {product.name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-2">
              <Ionicons name="star" size={18} color="#FFC107" />
              <Text className="text-base font-bold text-text ml-1">
                {product.rating}
              </Text>
            </View>
            <Text className="text-sm text-textGray mr-3">
              ({product.reviews} đánh giá)
            </Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary font-semibold">
                Xem đánh giá
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View className="flex-row items-center mb-5">
            <Text className="text-[28px] font-bold text-primary mr-3">
              {product.price.toLocaleString("vi-VN") + "đ"}
            </Text>
            {product.originalPrice && (
              <Text className="text-lg text-textGray line-through">
                {product.originalPrice.toLocaleString("vi-VN") + "đ"}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-border my-5" />

          {/* Colors */}
          <View className="mb-5">
            <Text className="text-base font-bold text-text mb-3">Màu sắc</Text>
            <View className="flex-row gap-3">
              {colors.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  className={`flex-row items-center px-4 py-2 rounded-full border-2 gap-2 ${
                    selectedColor === color.id
                      ? "border-primary bg-background"
                      : "border-border"
                  }`}
                  onPress={() => setSelectedColor(color.id)}
                >
                  <View
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <Text className="text-sm text-text">{color.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sizes */}
          <View className="mb-5">
            <Text className="text-base font-bold text-text mb-3">
              Kích thước
            </Text>
            <View className="flex-row gap-3">
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  className={`w-[50px] h-[50px] rounded-full border-2 items-center justify-center ${
                    selectedSize === size
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    className={`text-base font-bold ${
                      selectedSize === size ? "text-white" : "text-text"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
              Gọng kính {product.name} là sự kết hợp hoàn hảo giữa phong cách
              hiện đại và chất lượng cao cấp. Được làm từ chất liệu Titanium
              siêu nhẹ, mang lại sự thoải mái tối đa cho người đeo. Thiết kế
              tinh tế, phù hợp với nhiều khuôn mặt khác nhau.
            </Text>
          </View>

          {/* Virtual Try-On */}
          <TouchableOpacity
            className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 mb-5 flex-row items-center shadow-md"
            style={{ backgroundColor: "#2E86AB" }}
            onPress={() =>
              navigation.navigate("VirtualTryOn", { product: product })
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

          {/* Reviews Section */}
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-5 border border-border"
            onPress={() => navigation.navigate("Reviews", { product: product })}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-text">
                Đánh giá sản phẩm
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </View>
            <View className="flex-row items-center">
              <View className="flex-row mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#F18F01" />
                ))}
              </View>
              <Text className="text-sm text-text font-semibold mr-1">4.8</Text>
              <Text className="text-sm text-textGray">
                ({product.reviews || 234} đánh giá)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Related Products */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-text mb-3">
              Sản phẩm liên quan
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {SAMPLE_PRODUCTS.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="mr-3"
                  style={{ width: 120 }}
                  onPress={() =>
                    navigation.push("ProductDetail", { product: item })
                  }
                >
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 120, height: 120 }}
                    className="rounded-lg bg-background mb-2"
                    resizeMode="cover"
                  />
                  <Text
                    className="text-xs text-text mb-1"
                    numberOfLines={2}
                    style={{ height: 32 }}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    {item.price.toLocaleString("vi-VN") + "đ"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
