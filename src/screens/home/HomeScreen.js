import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SAMPLE_PRODUCTS, CATEGORIES } from "../../constants/data";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);

  const banners = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=360&fit=crop",
      title: "Kính thời trang",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=360&fit=crop",
      title: "Kính mát cao cấp",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&h=360&fit=crop",
      title: "Gọng kính hiện đại",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&h=360&fit=crop",
      title: "Kính chống ánh sáng xanh",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        bannerScrollRef.current?.scrollToOffset({
          offset: nextIndex * (width - 40),
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      className="items-center w-20"
      onPress={() =>
        navigation.navigate("ProductCatalog", { category: item.name })
      }
    >
      <View className="w-16 h-16 rounded-full bg-white items-center justify-center mb-2 shadow-md">
        <Ionicons name={item.icon} size={32} color="#2E86AB" />
      </View>
      <Text className="text-xs text-text text-center">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      className="w-40 bg-white rounded-xl overflow-hidden shadow-md"
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-40 bg-background"
      />
      {item.discount && (
        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-md">
          <Text className="text-white text-xs font-bold">
            -{item.discount}%
          </Text>
        </View>
      )}
      <View className="p-3">
        <Text className="text-xs text-textGray mb-1">{item.brand}</Text>
        <Text
          className="text-sm font-semibold text-text mb-1 h-9"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={14} color="#FFC107" />
          <Text className="text-xs font-bold text-text ml-1">
            {item.rating}
          </Text>
          <Text className="text-xs text-textGray ml-1">({item.reviews})</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <Text className="text-base font-bold text-primary mr-2">
            {item.price.toLocaleString("vi-VN") + "đ"}
          </Text>
          {item.originalPrice && (
            <Text className="text-xs text-textGray line-through">
              {item.originalPrice.toLocaleString("vi-VN") + "đ"}
            </Text>
          )}
        </View>
        <View className="flex-row items-center">
          <View
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.stock === "Còn hàng" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <Text className="text-xs text-textGray">{item.stock}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBannerItem = ({ item }) => (
    <View className="px-5" style={{ width: width }}>
      <Image
        source={{ uri: item.image }}
        className="rounded-2xl"
        style={{ width: width - 40, height: 160 }}
      />
    </View>
  );

  const handleBannerScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 40));
    setActiveBannerIndex(index);
  };

  const renderBanner = () => (
    <View className="pt-5 pb-4">
      <FlatList
        ref={bannerScrollRef}
        data={banners}
        renderItem={renderBannerItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleBannerScroll}
        scrollEventThrottle={16}
      />
      {/* Pagination Dots */}
      <View className="flex-row justify-center items-center mt-4 gap-2">
        {banners.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === activeBannerIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 px-5 pb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => navigation.navigate("ProfileTab")}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
              }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="text-sm text-textGray">Xin chào 👋</Text>
              <Text className="text-xl font-bold text-text mt-1">
                Nguyễn Văn A
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="relative"
              onPress={() => navigation.navigate("CartTab")}
            >
              <Ionicons name="cart-outline" size={24} color="#333333" />
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4.5 h-4.5 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="relative"
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#333333"
              />
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4.5 h-4.5 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center bg-background rounded-xl px-4 py-3 gap-3"
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search-outline" size={20} color="#999999" />
          <Text className="flex-1 text-sm text-textGray">
            Tìm kiếm sản phẩm...
          </Text>
          <Ionicons name="options-outline" size={20} color="#999999" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Banner */}
        {renderBanner()}

        {/* Service Banners */}
        <View className="px-5 mt-8 gap-3">
          {/* Prescription Order Banner */}
          <TouchableOpacity
            className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 flex-row items-center shadow-md"
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
                Tư vấn miễn phí - Giao hàng nhanh chóng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Lens Order Banner */}
          <TouchableOpacity
            className="bg-gradient-to-r rounded-2xl p-5 flex-row items-center shadow-md"
            style={{ backgroundColor: "#F18F01" }}
            onPress={() => navigation.navigate("LensOrder")}
          >
            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-4">
              <Ionicons name="eye-outline" size={28} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                Đặt tròng + gọng kính
              </Text>
              <Text className="text-sm text-white/80">
                Không cần đơn thuốc - Nhiều loại tròng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-lg font-bold text-text">Danh Mục</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Categories")}>
              <Text className="text-sm text-primary font-semibold">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          />
        </View>

        {/* Flash Sale */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="flash" size={24} color="#F18F01" />
              <Text className="text-lg font-bold text-text">Flash Sale</Text>
              <View className="flex-row items-center bg-red-500 px-2 py-1 rounded-md gap-1">
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text className="text-white text-xs font-bold">02:45:30</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-sm text-primary font-semibold">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SAMPLE_PRODUCTS.filter((p) => p.discount)}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          />
        </View>

        {/* Popular Products */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-lg font-bold text-text">
              Sản Phẩm Phổ Biến
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ProductCatalog")}
            >
              <Text className="text-sm text-primary font-semibold">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SAMPLE_PRODUCTS}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          />
        </View>

        {/* New Arrivals */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-lg font-bold text-text">Hàng Mới Về</Text>
            <TouchableOpacity>
              <Text className="text-sm text-primary font-semibold">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SAMPLE_PRODUCTS.slice(0, 3)}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          />
        </View>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
