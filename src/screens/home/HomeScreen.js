import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import {
  getProducts,
  formatPrice,
  getProductImages,
} from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getProfile } from "../../services/authService";
import { getProductReviews } from "../../services/reviewService";
import NotificationBell from "../../components/notifications/NotificationBell";

const { width } = Dimensions.get("window");

const ALLOWED_CATEGORY_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
];

const BANNERS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=400&fit=crop",
    tag: "Mới nhất",
    title: "Tròng kính\ncao cấp",
    subtitle: "Công nghệ chống UV tiên tiến",
    colors: ["#1565C0", "#2E86AB"],
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=400&fit=crop",
    tag: "Bán chạy",
    title: "Gọng kính\nthời trang",
    subtitle: "Hàng trăm mẫu mã đa dạng",
    colors: ["#7C3AED", "#A855F7"],
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&h=400&fit=crop",
    tag: "Ưu đãi",
    title: "Mắt kính\nchống sáng xanh",
    subtitle: "Bảo vệ mắt khi làm việc màn hình",
    colors: ["#065F46", "#10B981"],
  },
];

export default function HomeScreen({ navigation }) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [productRatings, setProductRatings] = useState({});
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const bannerRef = useRef(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getProfile().then((r) => {
        if (r.success) setUser(r.data);
      });
    }, []),
  );

  // Auto-scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollToOffset({
          offset: next * width,
          animated: true,
        });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [userResult, categoriesResult, featuredA, featuredB] =
        await Promise.all([
          getProfile(),
          getCategories({ limit: 6 }),
          getProducts({ categoryId: ALLOWED_CATEGORY_IDS[0], limit: 10 }),
          getProducts({ categoryId: ALLOWED_CATEGORY_IDS[1], limit: 10 }),
        ]);

      if (userResult.success) setUser(userResult.data);
      if (categoriesResult.success) {
        setCategories(
          categoriesResult.data.filter((c) =>
            ALLOWED_CATEGORY_IDS.includes(c.id),
          ),
        );
      }

      const combined = [
        ...(featuredA.success ? featuredA.data : []),
        ...(featuredB.success ? featuredB.data : []),
      ];
      setFeaturedProducts(combined);

      // Fetch images (same as before)
      const uniqueIds = combined.map((p) => p.id);
      const imgResults = await Promise.all(
        uniqueIds.map((pid) => getProductImages(pid).then((r) => ({ pid, r }))),
      );
      const imgMap = {};
      imgResults.forEach(({ pid, r }) => {
        if (r.success && r.data?.length > 0) {
          const sorted = [...r.data].sort((a, b) =>
            b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
          );
          imgMap[pid] = sorted[0].imageUrl;
        }
      });
      setProductImages(imgMap);

      // Fetch ratings separately — each failure is isolated
      const ratingMap = {};
      await Promise.all(
        uniqueIds.map(async (pid) => {
          try {
            const r = await getProductReviews(pid, 1, 100);
            // r is response.data: { statusCode, message, data: { data: [...], meta } }
            const reviews = Array.isArray(r?.data?.data)
              ? r.data.data
              : Array.isArray(r?.data)
                ? r.data
                : [];
            if (reviews.length > 0) {
              const sum = reviews.reduce(
                (acc, rv) => acc + (rv.rating || 0),
                0,
              );
              ratingMap[pid] = parseFloat((sum / reviews.length).toFixed(1));
            }
          } catch {
            // no reviews for this product
          }
        }),
      );
      setProductRatings(ratingMap);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-3 text-sm">Đang tải...</Text>
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* ── HEADER ── */}
      <View
        className="bg-card px-5 pb-3"
        style={{
          paddingTop: 52,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <TouchableOpacity
          className="flex-row items-center mb-3"
          onPress={() =>
            navigation.navigate("MainApp", { screen: "ProfileTab" })
          }
          activeOpacity={0.75}
        >
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user?.fullName || "U") +
                  "&background=2E86AB&color=fff&size=100",
            }}
            className="w-12 h-12 rounded-full mr-3"
            style={{ borderWidth: 2, borderColor: "#E0F0FF" }}
          />
          <View className="flex-1">
            <Text className="text-xs text-textGray mb-0.5">{greeting} 👋</Text>
            <Text
              className="text-lg font-extrabold text-text"
              numberOfLines={1}
            >
              {user?.fullName || "Khách hàng"}
            </Text>
          </View>
          
          {/* Right icons: Notification + Calendar */}
          <View className="flex-row items-center gap-2">
            <NotificationBell
              onPress={() => navigation.navigate("NotificationList")}
              color="#1F2937"
              size={22}
            />
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
              onPress={() => navigation.navigate("MyAppointments")}
            >
              <Ionicons name="calendar-outline" size={22} color="#2E86AB" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Search bar */}
        <TouchableOpacity
          className="flex-row items-center bg-background rounded-2xl px-4 py-3 border border-border"
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search-outline" size={18} color="#AAAAAA" />
          <Text className="flex-1 ml-2 text-sm text-textGray">
            Tìm kiếm sản phẩm...
          </Text>
          <View className="w-px h-4 bg-border mx-2" />
          <Ionicons name="options-outline" size={18} color="#2E86AB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── BANNER CAROUSEL ── */}
        <View className="mb-1">
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveBannerIndex(idx);
            }}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <View
                  className="mx-5 mt-4 rounded-3xl overflow-hidden"
                  style={{ height: 185 }}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.72)"]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <View className="absolute bottom-4 left-4 right-4">
                    <View
                      className="self-start px-3 py-0.5 rounded-full mb-1.5"
                      style={{ backgroundColor: item.colors[1] }}
                    >
                      <Text className="text-white text-xs font-bold">
                        {item.tag}
                      </Text>
                    </View>
                    <Text className="text-white font-extrabold text-2xl leading-8 mb-1">
                      {item.title}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
          {/* Dots */}
          <View className="flex-row justify-center mt-2.5 gap-1.5">
            {BANNERS.map((_, i) => (
              <View
                key={i}
                className="h-1.5 rounded-full"
                style={{
                  width: i === activeBannerIndex ? 20 : 6,
                  backgroundColor:
                    i === activeBannerIndex ? "#2E86AB" : "#CCCCCC",
                }}
              />
            ))}
          </View>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View className="mt-5 px-5">
          {/* Row 1: Prescription full-width banner */}
          <TouchableOpacity
            className="rounded-2xl overflow-hidden mb-2.5"
            onPress={() => navigation.navigate("PrescriptionOrder")}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#1565C0", "#2E86AB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center px-5"
              style={{ height: 80 }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Ionicons name="document-text" size={26} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-extrabold text-base">
                  Đặt kính theo đơn thuốc
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Tư vấn miễn phí
                </Text>
              </View>
              <View
                className="w-8 h-8 rounded-full items-center justify-center ml-3"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Row 2: 3 equal cards */}
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 rounded-2xl overflow-hidden"
              onPress={() => navigation.navigate("LensOrder")}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#F18F01", "#E07800"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center justify-center py-5 gap-2"
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center mb-1"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Ionicons name="eye" size={22} color="#FFFFFF" />
                </View>
                <Text className="text-white font-bold text-xs text-center leading-4">
                  Đặt tròng{"\n"}+ gọng
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-2xl overflow-hidden"
              onPress={() => navigation.navigate("VirtualTryOn")}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center justify-center py-5 gap-2"
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center mb-1"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Ionicons name="camera" size={22} color="#FFFFFF" />
                </View>
                <Text className="text-white font-bold text-xs text-center leading-4">
                  Thử kính{"\n"}AR
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-2xl overflow-hidden"
              onPress={() => navigation.navigate("MyAppointments")}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#0E7490", "#0891B2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center justify-center py-5 gap-2"
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center mb-1"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Ionicons name="calendar" size={22} color="#FFFFFF" />
                </View>
                <Text className="text-white font-bold text-xs text-center leading-4">
                  Lịch hẹn{"\n"}của tôi
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CATEGORIES ── */}
        {categories.length > 0 && (
          <View className="mt-5">
            <View className="flex-row justify-between items-center px-5 mb-3.5">
              <Text className="text-lg font-extrabold text-text">Danh mục</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("CategoriesTab")}
              >
                <Text className="text-sm text-primary font-semibold">
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row px-5 gap-3">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className="flex-1 items-center bg-card rounded-3xl p-3.5"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                  onPress={() =>
                    navigation.navigate("ProductCatalog", {
                      categoryId: cat.id,
                      categoryName: cat.name,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      cat.id === ALLOWED_CATEGORY_IDS[0]
                        ? ["#EFF6FF", "#DBEAFE"]
                        : ["#F0FDF4", "#DCFCE7"]
                    }
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2.5"
                  >
                    <Ionicons
                      name={
                        cat.id === ALLOWED_CATEGORY_IDS[0]
                          ? "glasses"
                          : "ellipse-outline"
                      }
                      size={32}
                      color={
                        cat.id === ALLOWED_CATEGORY_IDS[0]
                          ? "#2563EB"
                          : "#16A34A"
                      }
                    />
                  </LinearGradient>
                  <Text
                    className="text-sm font-bold text-text text-center"
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── FEATURED PRODUCTS ── */}
        {featuredProducts.length > 0 && (
          <View className="mt-5">
            <View className="flex-row justify-between items-center px-5 mb-3.5">
              <View className="flex-row items-center">
                <Ionicons name="star" size={18} color="#F18F01" />
                <Text className="text-lg font-extrabold text-text ml-1.5">
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

            <FlatList
              data={featuredProducts}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              renderItem={({ item }) => {
                const img = productImages[item.id];
                const rating =
                  productRatings[item.id] ??
                  item.averageRating ??
                  item.rating ??
                  null;
                return (
                  <TouchableOpacity
                    className="bg-card rounded-3xl overflow-hidden"
                    style={{
                      width: 155,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    onPress={() =>
                      navigation.navigate("ProductDetail", {
                        productId: item.id,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <View className="relative">
                      {img ? (
                        <Image
                          source={{ uri: img }}
                          className="w-full"
                          style={{ height: 140 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          className="w-full bg-gray-100 items-center justify-center"
                          style={{ height: 140 }}
                        >
                          <Ionicons
                            name="image-outline"
                            size={32}
                            color="#DDDDDD"
                          />
                        </View>
                      )}
                      {item.isPreorder && (
                        <View className="absolute top-2 right-2 bg-accent px-2 py-0.5 rounded-lg">
                          <Text className="text-white text-xs font-bold">
                            Đặt trước
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="p-3">
                      {item.brandName ? (
                        <Text
                          className="text-xs text-textGray mb-0.5 uppercase tracking-widest"
                          numberOfLines={1}
                        >
                          {item.brandName}
                        </Text>
                      ) : null}
                      <Text
                        className="text-sm font-bold text-text leading-5 mb-1.5"
                        style={{ height: 40 }}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      {/* Rating row — always shown */}
                      <View className="flex-row items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={
                              rating != null && star <= Math.round(rating)
                                ? "star"
                                : "star-outline"
                            }
                            size={12}
                            color="#F18F01"
                            style={{ marginRight: 1 }}
                          />
                        ))}
                        <Text className="text-xs text-textGray ml-1">
                          {rating != null
                            ? Number(rating).toFixed(1)
                            : "Chưa có"}
                        </Text>
                      </View>
                      <Text className="text-sm font-extrabold text-primary">
                        {formatPrice(item.price).toLocaleString("vi-VN")}đ
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* bottom padding */}
      </ScrollView>
    </View>
  );
}
