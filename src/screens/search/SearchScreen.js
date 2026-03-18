import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getProducts,
  getProductImages,
  formatPrice,
} from "../../services/productService";

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT = 8;

const CATEGORY_FILTERS = [
  { id: "all", label: "Tất cả", icon: "apps-outline", categoryId: null },
  {
    id: "frame",
    label: "Gọng kính",
    icon: "glasses-outline",
    categoryId: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "lens",
    label: "Tròng kính",
    icon: "ellipse-outline",
    categoryId: "00000000-0000-0000-0000-000000000002",
  },
];

const ALLOWED_CATEGORY_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredImages, setFeaturedImages] = useState({});
  const [searchImages, setSearchImages] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    loadRecentSearches();
    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch();
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchQuery, selectedFilter]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  };

  const saveRecentSearch = async (query) => {
    try {
      const trimmed = query.trim();
      if (!trimmed) return;
      const updated = [
        trimmed,
        ...recentSearches.filter((s) => s !== trimmed),
      ].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const loadFeaturedProducts = async () => {
    try {
      const results = await Promise.all(
        ALLOWED_CATEGORY_IDS.map((categoryId) =>
          getProducts({ categoryId, limit: 2 }).then((r) => r.data || []),
        ),
      );
      const products = results.flat().slice(0, 4);
      setFeaturedProducts(products);

      const uniqueIds = products.map((p) => p.id);
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
      setFeaturedImages(imgMap);
    } catch {}
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setIsSearching(true);

      const filter = CATEGORY_FILTERS.find((f) => f.id === selectedFilter);
      const params = { search: searchQuery.trim(), page: 1, limit: 20 };
      if (filter?.categoryId) params.categoryId = filter.categoryId;

      let allResults = [];
      if (!filter?.categoryId) {
        // Search across both allowed categories
        const results = await Promise.all(
          ALLOWED_CATEGORY_IDS.map((categoryId) =>
            getProducts({ ...params, categoryId }).then((r) => r.data || []),
          ),
        );
        allResults = results.flat();
      } else {
        const r = await getProducts(params);
        allResults = r.data || [];
      }

      setSearchResults(allResults);

      // Fetch images for results
      const uniqueIds = [...new Set(allResults.map((p) => p.id))];
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
      setSearchImages(imgMap);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSelectKeyword = (keyword) => {
    setSearchQuery(keyword);
    saveRecentSearch(keyword);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSubmitSearch = () => {
    if (searchQuery.trim()) saveRecentSearch(searchQuery);
  };

  const renderProductItem = ({ item }) => {
    const image = searchImages[item.id];
    const rating = item.averageRating ?? item.rating ?? null;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-3 mb-3 flex-row shadow-sm"
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
      >
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-24 h-24 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-24 rounded-xl bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#CCCCCC" />
          </View>
        )}
        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text className="text-sm font-bold text-text" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-xs text-textGray mt-1">
              {item.brandName || ""}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-primary">
              {`${formatPrice(item.price).toLocaleString("vi-VN")}đ`}
            </Text>
            {rating != null && (
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#F18F01" />
                <Text className="text-xs text-textGray ml-1">
                  {Number(rating).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header with Search Bar */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <View className="flex-1 bg-background rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#999999" />
            <TextInput
              ref={inputRef}
              className="flex-1 ml-2 text-sm text-text"
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
              onSubmitEditing={handleSubmitSearch}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        {isSearching && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 flex-row"
          >
            {CATEGORY_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                  selectedFilter === filter.id
                    ? "bg-primary"
                    : "bg-background border border-border"
                }`}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.id ? "#FFFFFF" : "#999999"}
                />
                <Text
                  className={`text-sm font-semibold ml-1.5 ${
                    selectedFilter === filter.id
                      ? "text-white"
                      : "text-textGray"
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {!isSearching ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View className="px-5 pt-5">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-bold text-text">
                    Tìm kiếm gần đây
                  </Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text className="text-sm text-primary font-semibold">
                      Xóa tất cả
                    </Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((keyword, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-3 border-b border-border"
                    onPress={() => handleSelectKeyword(keyword)}
                  >
                    <Ionicons name="time-outline" size={20} color="#999999" />
                    <Text className="flex-1 text-sm text-text ml-3">
                      {keyword}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#999999" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <View className="px-5 pt-5 pb-6">
                <Text className="text-base font-bold text-text mb-3">
                  Sản phẩm nổi bật
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {featuredProducts.map((product) => {
                    const image = featuredImages[product.id];
                    const rating =
                      product.averageRating ?? product.rating ?? null;
                    return (
                      <TouchableOpacity
                        key={product.id}
                        className="bg-white rounded-2xl p-3 mb-3 shadow-sm"
                        style={{ width: "48%" }}
                        onPress={() =>
                          navigation.navigate("ProductDetail", {
                            productId: product.id,
                          })
                        }
                      >
                        {image ? (
                          <Image
                            source={{ uri: image }}
                            className="w-full h-32 rounded-xl"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-32 rounded-xl bg-gray-100 items-center justify-center">
                            <Ionicons
                              name="image-outline"
                              size={36}
                              color="#CCCCCC"
                            />
                          </View>
                        )}
                        <Text
                          className="text-sm font-semibold text-text mt-2"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>
                        <View className="flex-row items-center justify-between mt-2">
                          <Text className="text-base font-bold text-primary">
                            {`${formatPrice(product.price).toLocaleString("vi-VN")}đ`}
                          </Text>
                          {rating != null && (
                            <View className="flex-row items-center">
                              <Ionicons name="star" size={12} color="#F18F01" />
                              <Text className="text-xs text-textGray ml-1">
                                {Number(rating).toFixed(1)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        ) : (
          <View className="px-5 pt-4">
            <Text className="text-sm text-textGray mb-3">
              {loading
                ? "Đang tìm kiếm..."
                : `Tìm thấy ${searchResults.length} kết quả cho "${searchQuery}"`}
            </Text>
            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#2E86AB" />
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View className="items-center py-16">
                <Ionicons name="search-outline" size={80} color="#E0E0E0" />
                <Text className="text-lg font-bold text-text mt-4">
                  Không tìm thấy kết quả
                </Text>
                <Text className="text-sm text-textGray text-center mt-2 px-8">
                  Không tìm thấy sản phẩm phù hợp với từ khóa của bạn
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
