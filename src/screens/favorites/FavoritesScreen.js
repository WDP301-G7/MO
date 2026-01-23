import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: "Gọng kính Rayban RB5154",
      price: 3500000,
      originalPrice: 4200000,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop",
      brand: "Ray-Ban",
      stock: "Còn hàng",
      discount: 15,
    },
    {
      id: 2,
      name: "Kính mát Aviator Classic",
      price: 2800000,
      originalPrice: null,
      image:
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=200&fit=crop",
      brand: "Oakley",
      stock: "Còn hàng",
      discount: 0,
    },
    {
      id: 3,
      name: "Gọng kính Titanium Premium",
      price: 4500000,
      originalPrice: 5000000,
      image:
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=300&h=200&fit=crop",
      brand: "Titan",
      stock: "Còn hàng",
      discount: 10,
    },
  ]);

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter((item) => item.id !== id));
  };

  const handleAddToCart = (product) => {
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Sản phẩm yêu thích
            </Text>
          </View>
          <Text className="text-sm text-textGray">
            {favorites.length} sản phẩm
          </Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="heart-outline" size={80} color="#CCCCCC" />
          <Text className="text-lg font-bold text-text mt-4">
            Chưa có sản phẩm yêu thích
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Hãy thêm các sản phẩm bạn yêu thích để dễ dàng theo dõi và mua sắm
            sau
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3 mt-6"
            onPress={() => navigation.navigate("Home")}
          >
            <Text className="text-white font-bold">Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 py-5"
          showsVerticalScrollIndicator={false}
        >
          {favorites.map((product) => (
            <View
              key={product.id}
              className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm"
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: product })
                }
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: product.image }}
                    className="w-28 h-28"
                  />
                  {product.discount > 0 && (
                    <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
                      <Text className="text-white text-xs font-bold">
                        -{product.discount}%
                      </Text>
                    </View>
                  )}
                  <View className="flex-1 p-3">
                    <Text
                      className="text-sm font-bold text-text mb-1"
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>
                    <Text className="text-xs text-textGray mb-2">
                      {product.brand}
                    </Text>
                    <View className="flex-row items-center mb-2">
                      <Text className="text-base font-bold text-primary mr-2">
                        {product.price.toLocaleString()}đ
                      </Text>
                      {product.originalPrice && (
                        <Text className="text-xs text-textGray line-through">
                          {product.originalPrice.toLocaleString()}đ
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#10B981"
                      />
                      <Text className="text-xs text-green-600 ml-1">
                        {product.stock}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white items-center justify-center shadow-md"
                    onPress={() => handleRemoveFavorite(product.id)}
                  >
                    <Ionicons name="heart" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <View className="flex-row border-t border-border">
                <TouchableOpacity
                  className="flex-1 py-3 items-center border-r border-border"
                  onPress={() => handleAddToCart(product)}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="cart-outline" size={20} color="#2E86AB" />
                    <Text className="text-primary font-semibold ml-2">
                      Thêm vào giỏ
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 items-center"
                  onPress={() =>
                    navigation.navigate("ProductDetail", { product: product })
                  }
                >
                  <Text className="text-text font-semibold">Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
