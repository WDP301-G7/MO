import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getCategories } from "../../services/categoryService";
import { getProducts } from "../../services/productService";

const ALLOWED_CATEGORY_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
];

const CATEGORY_CONFIG = {
  "Gọng kính": {
    icon: "glasses",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=500&fit=crop",
    gradient: ["rgba(46,134,171,0.15)", "rgba(46,134,171,0.85)"],
    accentColor: "#2E86AB",
    tag: "Thời trang",
  },
  "Tròng kính": {
    icon: "eye",
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=500&fit=crop",
    gradient: ["rgba(124,58,237,0.15)", "rgba(124,58,237,0.85)"],
    accentColor: "#7C3AED",
    tag: "Chăm sóc mắt",
  },
};

const FALLBACK_CONFIG = {
  icon: "cube",
  image:
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&h=500&fit=crop",
  gradient: ["rgba(241,143,1,0.15)", "rgba(241,143,1,0.85)"],
  accentColor: "#F18F01",
  tag: "Sản phẩm",
};

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await getCategories({ limit: 100 });
      if (result.success) {
        const filtered = result.data.filter((c) =>
          ALLOWED_CATEGORY_IDS.includes(c.id) ||
          ["Gọng kính", "Tròng kính"].includes(c.name),
        );
        setCategories(filtered);
        const countResults = await Promise.all(
          filtered.map((c) =>
            getProducts({ categoryId: c.id, limit: 1, page: 1 }).then((r) => ({
              id: c.id,
              count: r.pagination?.total ?? 0,
            })),
          ),
        );
        const countsMap = {};
        countResults.forEach(({ id, count }) => {
          countsMap[id] = count;
        });
        setCategoryProductCounts(countsMap);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-3 text-sm">Đang tải danh mục...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={["#1565C0", "#2E86AB"]}
        style={{ paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-xs opacity-80 mb-0.5">Khám phá</Text>
            <Text className="text-white text-2xl font-extrabold">Danh mục</Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            onPress={() => navigation.navigate("Search")}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Subtitle pill */}
        <View
          className="flex-row items-center self-start rounded-full px-3 py-1"
          style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
        >
          <Ionicons name="grid" size={12} color="#fff" />
          <Text className="text-white text-xs ml-1.5 font-medium">
            {categories.length} danh mục · {Object.values(categoryProductCounts).reduce((a, b) => a + b, 0)} sản phẩm
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2E86AB"]}
            tintColor="#2E86AB"
          />
        }
      >
        {categories.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="albums-outline" size={64} color="#CCCCCC" />
            <Text className="text-textGray mt-4 text-base">Không có danh mục nào</Text>
          </View>
        ) : (
          categories.map((category) => {
            const cfg = CATEGORY_CONFIG[category.name] ?? FALLBACK_CONFIG;
            const count =
              categoryProductCounts[category.id] ??
              category._count?.products ??
              0;
            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate("ProductCatalog", {
                    categoryId: category.id,
                    categoryName: category.name,
                  })
                }
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  shadowColor: cfg.accentColor,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.22,
                  shadowRadius: 14,
                  elevation: 6,
                }}
              >
                {/* Hero image */}
                <Image
                  source={{ uri: cfg.image }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="cover"
                />
                {/* Gradient overlay */}
                <LinearGradient
                  colors={cfg.gradient}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 24,
                  }}
                />
                {/* Tag pill top-left */}
                <View
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    backgroundColor: "rgba(255,255,255,0.22)",
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                    {cfg.tag}
                  </Text>
                </View>
                {/* Chevron top-right */}
                <View
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    backgroundColor: "rgba(255,255,255,0.22)",
                    borderRadius: 20,
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
                {/* Bottom content */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 18,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {/* Icon circle */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "rgba(255,255,255,0.22)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                      borderWidth: 1.5,
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <Ionicons name={cfg.icon} size={24} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 2 }}>
                      {category.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="cube-outline" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginLeft: 4 }}>
                        {count} sản phẩm
                      </Text>
                    </View>
                  </View>
                  {/* CTA */}
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: cfg.accentColor, fontSize: 12, fontWeight: "700" }}>
                      Xem ngay
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Bottom spacer */}
        <View style={{ height: 8 }} />
      </ScrollView>
    </View>
  );
}
