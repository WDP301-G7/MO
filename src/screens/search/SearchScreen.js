import React, { useState, useEffect } from "react";
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
import { getProducts, formatPrice } from "../../services/productService";

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    loadTrendingProducts();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch();
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(delaySearch);
  }, [searchQuery, selectedFilter]);

  const loadTrendingProducts = async () => {
    try {
      const { data } = await getProducts({ page: 1, limit: 4 });
      setTrendingProducts(data);
    } catch (error) {
      // Silent error
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setIsSearching(true);

      const params = {
        search: searchQuery.trim(),
        page: 1,
        limit: 20,
      };

      // Apply filter
      if (selectedFilter !== "all") {
        const typeMap = {
          frames: "FRAME",
          sunglasses: "FRAME", // Could add a separate field for sunglasses
          lenses: "LENS",
          accessories: "SERVICE",
        };
        params.type = typeMap[selectedFilter];
      }

      const { data } = await getProducts(params);
      setSearchResults(data);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const recentSearches = [
    "Gọng kính Rayban",
    "Kính cận nam",
    "Tròng kính chống ánh sáng xanh",
    "Kính mát nữ",
  ];

  const popularKeywords = [
    { id: 1, text: "Rayban", icon: "flame" },
    { id: 2, text: "Oakley", icon: "flame" },
    { id: 3, text: "Kính cận", icon: "trending-up" },
    { id: 4, text: "Kính mát", icon: "sunny" },
    { id: 5, text: "Gọng nhựa", icon: "trending-up" },
    { id: 6, text: "Tròng chống UV", icon: "shield-checkmark" },
  ];

  const filters = [
    { id: "all", label: "Tất cả", icon: "apps-outline" },
    { id: "frames", label: "Gọng kính", icon: "glasses-outline" },
    { id: "sunglasses", label: "Kính mát", icon: "sunny-outline" },
    { id: "lenses", label: "Tròng kính", icon: "ellipse-outline" },
    { id: "accessories", label: "Phụ kiện", icon: "bag-outline" },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRecentSearch = (keyword) => {
    setSearchQuery(keyword);
    handleSearch(keyword);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const renderProductItem = ({ item }) => {
    const primaryImage =
      item.images?.find((img) => img.isPrimary)?.imageUrl ||
      item.images?.[0]?.imageUrl ||
      (item.type === "FRAME"
        ? "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400"
        : item.type === "LENS"
          ? "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400"
          : "https://images.unsplash.com/photo-1622519407650-3df9883f76e6?w=400");

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-3 mb-3 flex-row shadow-sm"
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
      >
        <Image
          source={{ uri: primaryImage }}
          className="w-24 h-24 rounded-xl"
        />
        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text className="text-sm font-bold text-text" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-xs text-textGray mt-1">
              {item.brandName || "Không rõ"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold text-primary">
                {`${formatPrice(item.price).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F18F01" />
              <Text className="text-xs text-textGray ml-1">4.5</Text>
            </View>
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
              className="flex-1 ml-2 text-sm text-text"
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
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
            {filters.map((filter) => (
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
                  <TouchableOpacity>
                    <Text className="text-sm text-primary font-semibold">
                      Xóa tất cả
                    </Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((keyword, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-3 border-b border-border"
                    onPress={() => handleRecentSearch(keyword)}
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

            {/* Popular Keywords */}
            <View className="px-5 pt-5">
              <Text className="text-base font-bold text-text mb-3">
                Từ khóa phổ biến
              </Text>
              <View className="flex-row flex-wrap">
                {popularKeywords.map((keyword) => (
                  <TouchableOpacity
                    key={keyword.id}
                    className="bg-white rounded-full px-4 py-2.5 mr-2 mb-2 flex-row items-center shadow-sm"
                    onPress={() => handleRecentSearch(keyword.text)}
                  >
                    <Ionicons name={keyword.icon} size={16} color="#F18F01" />
                    <Text className="text-sm text-text ml-1.5">
                      {keyword.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Trending Products */}
            <View className="px-5 pt-5 pb-6">
              <Text className="text-base font-bold text-text mb-3">
                Sản phẩm nổi bật
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {trendingProducts.map((product) => {
                  const primaryImage =
                    product.images?.find((img) => img.isPrimary)?.imageUrl ||
                    product.images?.[0]?.imageUrl ||
                    (product.type === "FRAME"
                      ? "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400"
                      : product.type === "LENS"
                        ? "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400"
                        : "https://images.unsplash.com/photo-1622519407650-3df9883f76e6?w=400");

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
                      <Image
                        source={{ uri: primaryImage }}
                        className="w-full h-32 rounded-xl"
                      />
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
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={12} color="#F18F01" />
                          <Text className="text-xs text-textGray ml-1">
                            4.5
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Search Results */}
            <View className="px-5 pt-4">
              <Text className="text-sm text-textGray mb-3">
                Tìm thấy {searchResults.length} kết quả cho &quot;{searchQuery}
                &quot;
              </Text>
              {loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#2E86AB" />
                  <Text className="text-sm text-textGray mt-2">
                    Đang tìm kiếm...
                  </Text>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}
