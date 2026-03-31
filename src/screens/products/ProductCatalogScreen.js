import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, formatPrice } from "../../services/productService";
import { getProductAvailableQuantity } from "../../services/inventoryService";

export default function ProductCatalogScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState("popular");
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName || "Tất cả sản phẩm";

  useEffect(() => {
    loadProducts();
  }, [categoryId, selectedFilter, selectedSort]);

  const ALLOWED_CATEGORY_IDS = [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
  ];

  const loadProducts = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);

      const baseParams = { page, limit: 20 };
      if (selectedFilter === "preorder") baseParams.isPreorder = true;

      if (categoryId) {
        // Single category — normal fetch
        const result = await getProducts({ ...baseParams, categoryId });
        if (result.success) {
          if (append) setProducts((prev) => [...prev, ...result.data]);
          else setProducts(result.data);
          setPagination(result.pagination);
        }
      } else {
        // No category filter — fetch from both allowed categories in parallel
        const [resultA, resultB] = await Promise.all(
          ALLOWED_CATEGORY_IDS.map((catId) =>
            getProducts({ ...baseParams, categoryId: catId }),
          ),
        );
        const combined = [
          ...(resultA.success ? resultA.data : []),
          ...(resultB.success ? resultB.data : []),
        ];
        if (append) setProducts((prev) => [...prev, ...combined]);
        else setProducts(combined);
        // Keep pagination of whichever category still has more pages
        const paginationA = resultA.pagination;
        const paginationB = resultB.pagination;
        const hasMoreA =
          paginationA && paginationA.page < paginationA.totalPages;
        const hasMoreB =
          paginationB && paginationB.page < paginationB.totalPages;
        setPagination(
          hasMoreA ? paginationA : hasMoreB ? paginationB : paginationA,
        );
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(1, false);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages && !loadingMore) {
      setLoadingMore(true);
      loadProducts(pagination.page + 1, true);
    }
  };

  const sortOptions = [
    { id: "popular", label: "Phổ biến nhất", icon: "flame" },
    { id: "newest", label: "Mới nhất", icon: "time" },
    { id: "price-low", label: "Giá thấp đến cao", icon: "arrow-up" },
    { id: "price-high", label: "Giá cao đến thấp", icon: "arrow-down" },
    { id: "rating", label: "Đánh giá cao nhất", icon: "star" },
  ];

  const filterOptions = [
    { id: "all", label: "Tất cả" },
    { id: "preorder", label: "Đặt trước" },
  ];

  // Get placeholder image based on product type
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.isPrimary);
      return primaryImage?.imageUrl || product.images[0]?.imageUrl;
    }

    // Fallback images by type
    const typeImages = {
      FRAME:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
      LENS: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop",
      SERVICE:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    };
    return typeImages[product.type] || typeImages.FRAME;
  };

  const renderProduct = ({ item }) => {
    const price = formatPrice(item.price);

    return (
      <TouchableOpacity
        className="flex-1 m-2 bg-white rounded-xl overflow-hidden shadow-md"
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
      >
        <Image
          source={{ uri: getProductImage(item) }}
          className="w-full h-40 bg-background"
        />
        {item.isPreorder && (
          <View className="absolute top-2 left-2 bg-accent px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-bold">Đặt trước</Text>
          </View>
        )}

        <View className="p-3">
          {item.brand && (
            <Text className="text-[11px] text-textGray mb-1">{item.brand}</Text>
          )}
          <Text
            className="text-[13px] font-semibold text-text mb-1.5 h-8"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text className="text-sm font-bold text-primary">
                {price.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <TouchableOpacity className="w-8 h-8 rounded-full bg-primary items-center justify-center">
              <Ionicons name="cart" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[11px] text-textGray">
              {item.category?.name || ""}
            </Text>
            {item.isPreorder && item.leadTimeDays && (
              <Text className="text-[11px] text-accent ml-2">
                • {item.leadTimeDays} ngày
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSortModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={sortModalVisible}
      onRequestClose={() => setSortModalVisible(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={() => setSortModalVisible(false)}
      >
        <View className="bg-white rounded-t-3xl pb-10">
          <View className="flex-row justify-between items-center p-5 border-b border-border">
            <Text className="text-lg font-bold text-text">Sắp xếp theo</Text>
            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className="flex-row justify-between items-center py-4 px-5"
              onPress={() => {
                setSelectedSort(option.id);
                setSortModalVisible(false);
              }}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name={option.icon} size={20} color="#2E86AB" />
                <Text className="text-[15px] text-text">{option.label}</Text>
              </View>
              {selectedSort === option.id && (
                <Ionicons name="checkmark" size={24} color="#2E86AB" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Show loading
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-4">Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between bg-white pt-12 pb-4 px-5 shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-background items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">{categoryName}</Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-background items-center justify-center"
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* Filter & Sort Bar */}
      <View className="flex-row items-center bg-white py-3 px-5 border-b border-border">
        <TouchableOpacity
          className="flex-1 flex-row items-center gap-1.5 justify-center"
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={18} color="#2E86AB" />
          <Text className="text-sm text-primary font-semibold">Bộ lọc</Text>
        </TouchableOpacity>

        <View className="w-px h-5 bg-border" />

        <TouchableOpacity
          className="flex-1 flex-row items-center gap-1.5 justify-center"
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical-outline" size={18} color="#2E86AB" />
          <Text className="text-sm text-primary font-semibold">Sắp xếp</Text>
        </TouchableOpacity>

        <View className="w-px h-5 bg-border" />

        <View className="flex-1 items-center">
          <Text className="text-xs text-textGray">
            {pagination?.total || 0} sản phẩm
          </Text>
        </View>
      </View>

      {/* Filter Tags */}
      <View className="bg-white py-2">
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-1.5 rounded-full border ${
                selectedFilter === item.id
                  ? "bg-primary border-primary"
                  : "bg-background border-border"
              }`}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Text
                className={`text-[13px] font-medium ${
                  selectedFilter === item.id ? "text-white" : "text-text"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        />
      </View>

      {/* Products Grid */}
      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="cube-outline" size={64} color="#CCCCCC" />
          <Text className="text-textGray mt-4">Không có sản phẩm nào</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#2E86AB"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#2E86AB" />
              </View>
            ) : null
          }
        />
      )}

      {renderSortModal()}
    </View>
  );
}
