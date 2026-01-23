import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES } from "../../constants/data";

export default function CategoriesScreen({ navigation }) {
  const allCategories = [
    {
      id: "1",
      name: "Gọng kính",
      icon: "glasses-outline",
      count: 234,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
      color: "#2E86AB",
    },
    {
      id: "2",
      name: "Tròng kính",
      icon: "ellipse-outline",
      count: 156,
      image:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop",
      color: "#A23B72",
    },
    {
      id: "3",
      name: "Kính mát",
      icon: "sunny-outline",
      count: 189,
      image:
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=300&fit=crop",
      color: "#F18F01",
    },
    {
      id: "4",
      name: "Kính áp tròng",
      icon: "eye-outline",
      count: 67,
      image:
        "https://images.unsplash.com/photo-1606206873765-2ac6ffb4e6d7?w=400&h=300&fit=crop",
      color: "#17A2B8",
    },
    {
      id: "5",
      name: "Phụ kiện",
      icon: "bag-outline",
      count: 89,
      image:
        "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=300&fit=crop",
      color: "#28A745",
    },
    {
      id: "6",
      name: "Kính trẻ em",
      icon: "happy-outline",
      count: 45,
      image:
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=400&h=300&fit=crop",
      color: "#E91E63",
    },
  ];

  const popularBrands = [
    { id: 1, name: "Ray-Ban", logo: "🕶️" },
    { id: 2, name: "Oakley", logo: "⚡" },
    { id: 3, name: "Gucci", logo: "👑" },
    { id: 4, name: "Prada", logo: "💎" },
    { id: 5, name: "Essilor", logo: "🔬" },
    { id: 6, name: "Zeiss", logo: "🌟" },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text">Danh mục sản phẩm</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Ionicons name="search-outline" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Categories */}
        <View className="px-5 py-5">
          <Text className="text-lg font-bold text-text mb-4">
            Danh mục chính
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {allCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="w-[48%] mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
                onPress={() =>
                  navigation.navigate("ProductCatalog", {
                    category: category.name,
                  })
                }
              >
                <Image
                  source={{ uri: category.image }}
                  className="w-full h-32"
                />
                <View className="p-3">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      <Ionicons
                        name={category.icon}
                        size={18}
                        color={category.color}
                      />
                    </View>
                    <Text
                      className="text-sm font-bold text-text flex-1"
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </View>
                  <Text className="text-xs text-textGray">
                    {category.count} sản phẩm
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Brands */}
        <View className="px-5 pb-5">
          <Text className="text-lg font-bold text-text mb-4">
            Thương hiệu nổi bật
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {popularBrands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                className="w-[31%] mb-3 bg-white rounded-xl p-4 items-center shadow-sm"
                onPress={() =>
                  navigation.navigate("ProductCatalog", { brand: brand.name })
                }
              >
                <Text className="text-3xl mb-2">{brand.logo}</Text>
                <Text className="text-xs font-semibold text-text text-center">
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Categories */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-text mb-4">
            Danh mục đặc biệt
          </Text>

          <TouchableOpacity
            className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 mb-3 flex-row items-center shadow-sm"
            style={{ backgroundColor: "#2E86AB" }}
            onPress={() => navigation.navigate("PrescriptionOrder")}
          >
            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-4">
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                Đặt kính theo đơn thuốc
              </Text>
              <Text className="text-sm text-white/80">
                Tư vấn miễn phí, giao hàng nhanh
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm"
            onPress={() => alert("Tính năng đang phát triển")}
          >
            <View className="w-14 h-14 rounded-full bg-accent/20 items-center justify-center mr-4">
              <Ionicons name="flash-outline" size={28} color="#F18F01" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-text mb-1">
                Flash Sale hôm nay
              </Text>
              <Text className="text-sm text-textGray">
                Giảm đến 50% - Số lượng có hạn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
