import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SAMPLE_PRODUCTS } from "../../constants/data";

export default function ProductCatalogScreen({ navigation, route }) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState("popular");

  const category = route.params?.category || "Tất cả";

  const sortOptions = [
    { id: "popular", label: "Phổ biến nhất", icon: "flame" },
    { id: "newest", label: "Mới nhất", icon: "time" },
    { id: "price-low", label: "Giá thấp đến cao", icon: "arrow-up" },
    { id: "price-high", label: "Giá cao đến thấp", icon: "arrow-down" },
    { id: "rating", label: "Đánh giá cao nhất", icon: "star" },
  ];

  const filterOptions = [
    { id: "all", label: "Tất cả" },
    { id: "available", label: "Còn hàng" },
    { id: "preorder", label: "Đặt trước" },
    { id: "sale", label: "Giảm giá" },
  ];

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      className="flex-1 m-2 bg-white rounded-xl overflow-hidden shadow-md"
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-40 bg-background"
      />
      {item.discount && (
        <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
          <Text className="text-white text-xs font-bold">
            -{item.discount}%
          </Text>
        </View>
      )}
      <TouchableOpacity
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white items-center justify-center shadow-md"
        onPress={() => alert("Đã thêm vào yêu thích")}
      >
        <Ionicons name="heart-outline" size={20} color="#EF4444" />
      </TouchableOpacity>

      <View className="p-3">
        <Text className="text-[11px] text-textGray mb-1">{item.brand}</Text>
        <Text
          className="text-[13px] font-semibold text-text mb-1.5 h-8"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={14} color="#FFC107" />
          <Text className="text-[11px] font-bold text-text ml-1">
            {item.rating}
          </Text>
          <Text className="text-[11px] text-textGray ml-1">
            ({item.reviews})
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-1">
            <Text className="text-sm font-bold text-primary">
              {item.price.toLocaleString("vi-VN") + "đ"}
            </Text>
            {item.originalPrice && (
              <Text className="text-xs text-textGray line-through">
                {item.originalPrice.toLocaleString("vi-VN") + "đ"}
              </Text>
            )}
          </View>
          <TouchableOpacity className="w-8 h-8 rounded-full bg-primary items-center justify-center">
            <Ionicons name="cart" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <View
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.stock === "Còn hàng" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <Text className="text-[11px] text-textGray">{item.stock}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text className="text-lg font-bold text-text">{category}</Text>
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
            {SAMPLE_PRODUCTS.length} sản phẩm
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
      <FlatList
        data={SAMPLE_PRODUCTS}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />

      {renderSortModal()}
    </View>
  );
}
