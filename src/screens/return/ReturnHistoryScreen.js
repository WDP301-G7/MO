import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useReturns } from "../../contexts/ReturnsContext";
import ReturnCard from "../../components/returns/ReturnCard";

export default function ReturnHistoryScreen({ navigation }) {
  const {
    returns,
    loading,
    error,
    pagination,
    fetchMyReturns,
    refreshReturns,
    loadMoreReturns,
    getReturnsCountByStatus,
  } = useReturns();

  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch returns when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchMyReturns(1, 10, null, null, true);
    }, [fetchMyReturns]),
  );

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReturns();
    setRefreshing(false);
  };

  // Load more handler
  const handleLoadMore = async () => {
    if (loadingMore || loading) return;
    if (pagination.page >= pagination.totalPages) return;

    setLoadingMore(true);
    await loadMoreReturns();
    setLoadingMore(false);
  };

  // Tab change handler
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const statusFilter = tabKey === "all" ? null : tabKey.toUpperCase();
    fetchMyReturns(1, 10, statusFilter, null, true);
  };

  const tabs = [
    { key: "all", label: "Tất cả", count: pagination.total || 0 },
    {
      key: "pending",
      label: "Đang xử lý",
      count: getReturnsCountByStatus("PENDING"),
    },
    {
      key: "approved",
      label: "Đã duyệt",
      count: getReturnsCountByStatus("APPROVED"),
    },
    {
      key: "completed",
      label: "Hoàn tất",
      count: getReturnsCountByStatus("COMPLETED"),
    },
    {
      key: "rejected",
      label: "Từ chối",
      count: getReturnsCountByStatus("REJECTED"),
    },
  ];

  // Navigate to return detail
  const handleReturnPress = (returnItem) => {
    navigation.navigate("ReturnDetail", { returnId: returnItem.id });
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">
            Lịch sử đổi trả và bảo hành
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 py-3"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeTab === tab.key ? "bg-primary" : "bg-background"
              }`}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key ? "text-white" : "text-text"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 50;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && !refreshing && returns.length === 0 ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#F18F01" />
            <Text className="text-sm text-textGray mt-4">
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : returns.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <Ionicons
              name="swap-horizontal-outline"
              size={80}
              color="#CCCCCC"
            />
            <Text className="text-lg font-bold text-text mt-4">
              Chưa có yêu cầu đổi trả
            </Text>
            <Text className="text-sm text-textGray text-center mt-2">
              Lịch sử các yêu cầu đổi trả hàng của bạn sẽ hiển thị ở đây
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl px-6 py-3 mt-6 flex-row items-center"
              onPress={() => navigation.navigate("Orders")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-2">
                Tạo yêu cầu mới
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-5 py-5">
            {returns.map((returnItem) => (
              <ReturnCard
                key={returnItem.id}
                returnItem={returnItem}
                onPress={() => handleReturnPress(returnItem)}
              />
            ))}

            {/* Loading more indicator */}
            {loadingMore && (
              <View className="py-4">
                <ActivityIndicator size="small" color="#F18F01" />
              </View>
            )}

            {/* End of list message */}
            {!loadingMore &&
              pagination.page >= pagination.totalPages &&
              returns.length > 0 && (
                <Text className="text-center text-textGray text-sm py-4">
                  Đã hiển thị tất cả yêu cầu
                </Text>
              )}
          </View>
        )}
      </ScrollView>

      {/* New Return Request Button */}
      {returns.length > 0 && (
        <View className="bg-white border-t border-border px-5 py-4">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center flex-row justify-center"
            onPress={() => navigation.navigate("Orders")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">
              Tạo yêu cầu mới
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
