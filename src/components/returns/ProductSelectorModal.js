import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProducts } from "../../services/productService";

/**
 * ProductSelectorModal - Modal to select a product for exchange
 * Allows searching and browsing products from catalog
 */
export default function ProductSelectorModal({
  visible,
  onClose,
  onSelectProduct,
  currentProductType = "FRAME", // FRAME, LENS, SERVICE
  currentProductId = null, // Exclude current product from list
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProducts(1, true);
    }
  }, [visible, searchQuery]);

  const loadProducts = async (pageNum = 1, reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    try {
      setLoading(true);

      const result = await getProducts({
        page: pageNum,
        limit: 20,
        type: currentProductType, // Only show products of same type
        search: searchQuery || undefined,
      });

      if (result.success) {
        let newProducts = result.data || [];

        // Filter out current product
        if (currentProductId) {
          newProducts = newProducts.filter((p) => p.id !== currentProductId);
        }

        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts([...products, ...newProducts]);
        }

        setPage(pageNum);
        setHasMore(
          result.pagination &&
            result.pagination.currentPage < result.pagination.totalPages,
        );
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadProducts(page + 1, false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setPage(1);
    setHasMore(true);
  };

  const handleSelectProduct = (product) => {
    onSelectProduct(product);
    onClose();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row bg-white p-3 mb-2 rounded-xl border border-border"
      onPress={() => handleSelectProduct(item)}
    >
      <Image
        source={{
          uri: item.images?.[0]?.imageUrl || "https://via.placeholder.com/80",
        }}
        className="w-20 h-20 rounded-lg bg-background"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-sm font-bold text-text" numberOfLines={2}>
            {item.name}
          </Text>
          {item.categoryName && (
            <Text className="text-xs text-textGray mt-1">
              {item.categoryName}
            </Text>
          )}
        </View>
        <Text className="text-base font-bold text-primary">
          {formatCurrency(item.price)}
        </Text>
      </View>
      <View className="justify-center">
        <Ionicons name="chevron-forward" size={20} color="#999999" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading && products.length === 0) {
      return null;
    }

    return (
      <View className="items-center justify-center py-12">
        <Ionicons name="cube-outline" size={64} color="#CCCCCC" />
        <Text className="text-textGray text-center mt-4 px-8">
          {searchQuery
            ? "Không tìm thấy sản phẩm phù hợp"
            : "Không có sản phẩm nào"}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#F18F01" />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-text">
              Chọn sản phẩm đổi
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={onClose}
            >
              <Ionicons name="close" size={28} color="#333333" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="mt-4 flex-row items-center bg-background rounded-xl px-4 py-2">
            <Ionicons name="search" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-2 text-sm text-text py-1"
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Product List */}
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}
