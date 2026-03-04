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
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getProducts, formatPrice } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getProfile } from "../../services/authService";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const bannerScrollRef = useRef(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  // Reload user profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const reloadUserProfile = async () => {
        const userResult = await getProfile();
        if (userResult.success) {
          setUser(userResult.data);
        }
      };

      reloadUserProfile();
    }, []),
  );

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const userResult = await getProfile();
      if (userResult.success) {
        setUser(userResult.data);
      }

      // Load categories
      const categoriesResult = await getCategories({ limit: 6 });
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }

      // Load featured products (first 10 products)
      const productsResult = await getProducts({ limit: 10 });
      if (productsResult.success) {
        setFeaturedProducts(productsResult.data);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

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
    if (banners.length === 0) return;

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

  // Map icon cho category
  const getCategoryIcon = (name) => {
    const iconMap = {
      "Gọng kính": "glasses-outline",
      "Tròng kính": "ellipse-outline",
      "Dịch vụ": "medical-outline",
      "Phụ kiện": "bag-outline",
    };
    return iconMap[name] || "cube-outline";
  };

  // Get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.isPrimary);
      return primaryImage?.imageUrl || product.images[0]?.imageUrl;
    }

    const typeImages = {
      FRAME:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
      LENS: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop",
      SERVICE:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    };
    return typeImages[product.type] || typeImages.FRAME;
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      className="items-center w-20"
      onPress={() =>
        navigation.navigate("ProductCatalog", {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
      <View className="w-16 h-16 rounded-full bg-white items-center justify-center mb-2 shadow-md">
        <Ionicons name={getCategoryIcon(item.name)} size={32} color="#2E86AB" />
      </View>
      <Text className="text-xs text-text text-center" numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => {
    const price = formatPrice(item.price);

    return (
      <TouchableOpacity
        className="w-40 bg-white rounded-xl overflow-hidden shadow-md"
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
      >
        <Image
          source={{ uri: getProductImage(item) }}
          className="w-full h-40 bg-background"
        />
        {item.isPreorder && (
          <View className="absolute top-2 right-2 bg-accent px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-bold">Đặt trước</Text>
          </View>
        )}
        <View className="p-3">
          {item.brand && (
            <Text className="text-xs text-textGray mb-1">{item.brand}</Text>
          )}
          <Text
            className="text-sm font-semibold text-text mb-1 h-9"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-base font-bold text-primary mr-2">
              {price.toLocaleString("vi-VN")}đ
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs text-textGray">
              {item.category?.name || ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-4">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 px-5 pb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              navigation.navigate("MainApp", { screen: "ProfileTab" })
            }
          >
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
              }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="text-sm text-textGray">Xin chào 👋</Text>
              <Text className="text-xl font-bold text-text mt-1">
                {user?.fullName || "Khách hàng"}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="relative"
              onPress={() => navigation.navigate("CartTab")}
            >
              <Ionicons name="cart-outline" size={24} color="#333333" />
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

          {/* Quick Actions Row */}
          <View className="flex-row gap-3">
            {/* View Prescription Requests */}
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              onPress={() => navigation.navigate("Appointments")}
            >
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={20} color="#2E86AB" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold text-text"
                    numberOfLines={1}
                  >
                    Yêu cầu của tôi
                  </Text>
                  <Text className="text-xs text-textGray" numberOfLines={1}>
                    Xem tình trạng
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Virtual Try-On */}
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              onPress={() => navigation.navigate("VirtualTryOn")}
            >
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                  <Ionicons name="camera-outline" size={20} color="#9333EA" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold text-text"
                    numberOfLines={1}
                  >
                    Thử kính AR
                  </Text>
                  <Text className="text-xs text-textGray" numberOfLines={1}>
                    Thử ngay
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
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
          {categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            />
          ) : (
            <View className="px-5 py-4">
              <Text className="text-textGray text-center">
                Đang tải danh mục...
              </Text>
            </View>
          )}
        </View>

        {/* Featured Products */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center px-5 mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="star" size={24} color="#F18F01" />
              <Text className="text-lg font-bold text-text">
                Sản phẩm nổi bật
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("ProductCatalog", {})}
            >
              <Text className="text-sm text-primary font-semibold">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>
          {featuredProducts.length > 0 ? (
            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            />
          ) : (
            <View className="px-5 py-4">
              <Text className="text-textGray text-center">
                Không có sản phẩm
              </Text>
            </View>
          )}
        </View>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
