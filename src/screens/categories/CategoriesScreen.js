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
import { getCategories } from "../../services/categoryService";
import { getProducts } from "../../services/productService";

const ALLOWED_CATEGORY_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
];

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
      const result = await getCategories({ limit: 100 }); // Load all categories

      if (result.success) {
        const filtered = result.data.filter((c) =>
          ALLOWED_CATEGORY_IDS.includes(c.id),
        );
        setCategories(filtered);

        // Fetch actual product counts from products API in parallel
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
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  // Map icon cho từng category (theo tên)
  const getCategoryIcon = (name) => {
    const iconMap = {
      "Gọng kính": "glasses-outline",
      "Tròng kính": "ellipse-outline",
      "Dịch vụ": "medical-outline",
    };
    return iconMap[name] || "cube-outline";
  };

  // Map màu cho từng category
  const getCategoryColor = (index) => {
    const colors = [
      "#2E86AB",
      "#A23B72",
      "#F18F01",
      "#28A745",
      "#E91E63",
      "#17A2B8",
    ];
    return colors[index % colors.length];
  };

  // Map image placeholder cho category
  const getCategoryImage = (name) => {
    const imageMap = {
      "Gọng kính":
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
      "Tròng kính":
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop",
      "Dịch vụ":
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    };
    return (
      imageMap[name] ||
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400&h=300&fit=crop"
    );
  };

  const popularBrands = [
    { id: 1, name: "Ray-Ban", logo: "🕶️" },
    { id: 2, name: "Oakley", logo: "⚡" },
    { id: 3, name: "Gucci", logo: "👑" },
    { id: 4, name: "Prada", logo: "💎" },
    { id: 5, name: "Essilor", logo: "🔬" },
    { id: 6, name: "Zeiss", logo: "🌟" },
  ];

  // Show loading
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-4">Đang tải danh mục...</Text>
      </View>
    );
  }

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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2E86AB"]}
          />
        }
      >
        {/* Categories from API */}
        <View className="px-5 py-5">
          {categories.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="albums-outline" size={64} color="#CCCCCC" />
              <Text className="text-textGray mt-4">Không có danh mục nào</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  className="w-[48%] mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
                  onPress={() =>
                    navigation.navigate("ProductCatalog", {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                >
                  <Image
                    source={{ uri: getCategoryImage(category.name) }}
                    className="w-full h-32"
                  />
                  <View className="p-3">
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-2"
                        style={{
                          backgroundColor: getCategoryColor(index) + "20",
                        }}
                      >
                        <Ionicons
                          name={getCategoryIcon(category.name)}
                          size={18}
                          color={getCategoryColor(index)}
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
                      {categoryProductCounts[category.id] ??
                        category._count?.products ??
                        0}{" "}
                      sản phẩm
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
