import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function VirtualTryOnScreen({ navigation, route }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const products = [
    {
      id: 1,
      name: "Gọng kính Rayban RB5154",
      price: 3500000,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop",
    },
    {
      id: 2,
      name: "Gọng kính Titanium Classic",
      price: 2800000,
      image:
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=300&h=200&fit=crop",
    },
    {
      id: 3,
      name: "Kính mát Aviator",
      price: 4200000,
      image:
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=200&fit=crop",
    },
    {
      id: 4,
      name: "Gọng kính Oakley Sport",
      price: 3900000,
      image:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=200&fit=crop",
    },
  ];

  const handleTakePicture = () => {
    // Simulate taking picture
    alert("Ảnh đã được lưu vào thư viện!");
  };

  const handleShare = () => {
    alert("Chia sẻ ảnh lên mạng xã hội");
  };

  const handleBuyNow = () => {
    if (selectedProduct) {
      navigation.navigate("ProductDetail", { productId: selectedProduct.id });
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
      <View className="absolute top-12 left-0 right-0 z-10 px-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white">Thử kính ảo</Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            onPress={() => alert("Hướng dẫn sử dụng")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View (Simulated) */}
      <View className="flex-1 items-center justify-center">
        {isCameraActive ? (
          <View className="w-full h-full bg-background items-center justify-center">
            <Ionicons name="camera-outline" size={120} color="#999999" />
            <Text className="text-textGray text-center mt-4 px-8">
              Camera đang mở...{"\n"}Nhìn thẳng vào camera
            </Text>
          </View>
        ) : (
          <View className="w-full h-full bg-background items-center justify-center">
            {/* Demo Face */}
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
              }}
              className="w-80 h-96 rounded-2xl"
            />
            {selectedProduct && (
              <View className="absolute top-1/3 items-center">
                <Image
                  source={{ uri: selectedProduct.image }}
                  className="w-64 h-20 opacity-80"
                  style={{ tintColor: "#333333" }}
                />
              </View>
            )}
            {!isCameraActive && !selectedProduct && (
              <View className="absolute items-center">
                <Ionicons name="glasses-outline" size={64} color="#999999" />
                <Text className="text-textGray text-center mt-4 px-8">
                  Chọn một sản phẩm bên dưới để thử
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Camera Controls */}
      <View className="absolute bottom-32 left-0 right-0 px-5 flex-row items-center justify-center gap-6">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-black/50 items-center justify-center"
          onPress={() => setIsCameraActive(!isCameraActive)}
        >
          <Ionicons
            name={isCameraActive ? "camera" : "camera-outline"}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-white items-center justify-center"
          onPress={handleTakePicture}
        >
          <View className="w-14 h-14 rounded-full border-4 border-white bg-transparent" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-black/50 items-center justify-center"
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Product Carousel */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-4 pb-8 px-5">
        <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />

        <Text className="text-base font-bold text-text mb-3">
          Chọn sản phẩm để thử
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 px-5"
        >
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              className={`mr-3 rounded-xl overflow-hidden border-2 ${
                selectedProduct?.id === product.id
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onPress={() => setSelectedProduct(product)}
            >
              <Image source={{ uri: product.image }} className="w-32 h-24" />
              <View className="bg-background p-2">
                <Text
                  className="text-xs font-semibold text-text"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                <Text className="text-xs text-primary font-bold mt-1">
                  {product.price.toLocaleString("vi-VN") + "đ"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedProduct && (
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 border-2 border-primary rounded-xl py-3 items-center"
              onPress={() => setSelectedProduct(null)}
            >
              <Text className="text-primary font-bold">Bỏ chọn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-xl py-3 items-center"
              onPress={handleBuyNow}
            >
              <Text className="text-white font-bold">Mua ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Feature Tags */}
      <View className="absolute top-24 right-5 z-10 gap-2">
        <View className="bg-accent px-3 py-2 rounded-full">
          <Text className="text-xs text-white font-semibold">
            AR Technology
          </Text>
        </View>
        <View className="bg-primary px-3 py-2 rounded-full">
          <Text className="text-xs text-white font-semibold">Real-time</Text>
        </View>
      </View>
    </View>
  );
}
