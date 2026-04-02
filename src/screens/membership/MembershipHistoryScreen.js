import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMyMembershipHistory,
  getTierColor,
  getTierIcon,
  getReasonLabel,
} from "../../services/membershipService";

export default function MembershipHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadHistory = async (pageNum = 1, append = false) => {
    try {
      const result = await getMyMembershipHistory(pageNum, 20);
      if (result.success) {
        setHistory((prev) =>
          append ? [...prev, ...result.data] : result.data,
        );
        setMeta(result.meta);
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory(1, false);
  };

  const handleLoadMore = async () => {
    if (!meta || page >= meta.totalPages || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await loadHistory(nextPage, true);
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      loadHistory(1, false);
    }, []),
  );

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  const renderHistoryItem = ({ item, index }) => {
    const isUpgrade =
      (item.newTier?.sortOrder ?? 0) > (item.oldTier?.sortOrder ?? 0);
    const isDowngrade =
      (item.newTier?.sortOrder ?? 0) < (item.oldTier?.sortOrder ?? 0);
    const newTierColor = getTierColor(item.newTier?.name);
    const oldTierColor = getTierColor(item.oldTier?.name);

    return (
      <View className="bg-white mx-5 rounded-2xl p-4 mb-3 shadow-sm">
        {/* Change direction indicator */}
        <View className="flex-row items-center justify-between mb-3">
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: isUpgrade
                ? "#10B98120"
                : isDowngrade
                  ? "#EF444420"
                  : "#6B728020",
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{
                color: isUpgrade
                  ? "#10B981"
                  : isDowngrade
                    ? "#EF4444"
                    : "#6B7280",
              }}
            >
              {isUpgrade
                ? "▲ Thăng hạng"
                : isDowngrade
                  ? "▼ Xuống hạng"
                  : "↔ Cập nhật"}
            </Text>
          </View>
          <Text className="text-xs text-textGray">
            {formatDateTime(item.changedAt)}
          </Text>
        </View>

        {/* Tier change arrow */}
        <View className="flex-row items-center mb-3">
          {/* Old Tier */}
          <View className="items-center flex-1">
            {item.oldTier ? (
              <>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-1"
                  style={{ backgroundColor: oldTierColor + "20" }}
                >
                  <Ionicons
                    name={getTierIcon(item.oldTier.name)}
                    size={22}
                    color={oldTierColor}
                  />
                </View>
                <Text
                  className="text-sm font-bold"
                  style={{ color: oldTierColor }}
                >
                  {item.oldTier.name.toUpperCase()}
                </Text>
              </>
            ) : (
              <>
                <View className="w-10 h-10 rounded-full items-center justify-center mb-1 bg-border">
                  <Ionicons name="person-outline" size={22} color="#999" />
                </View>
                <Text className="text-sm font-bold text-textGray">CHƯA CÓ</Text>
              </>
            )}
          </View>

          {/* Arrow */}
          <Ionicons
            name="arrow-forward"
            size={24}
            color={isUpgrade ? "#10B981" : isDowngrade ? "#EF4444" : "#6B7280"}
          />

          {/* New Tier */}
          <View className="items-center flex-1">
            {item.newTier ? (
              <>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-1"
                  style={{ backgroundColor: newTierColor + "20" }}
                >
                  <Ionicons
                    name={getTierIcon(item.newTier.name)}
                    size={22}
                    color={newTierColor}
                  />
                </View>
                <Text
                  className="text-sm font-bold"
                  style={{ color: newTierColor }}
                >
                  {item.newTier.name.toUpperCase()}
                </Text>
              </>
            ) : (
              <View className="w-10 h-10 rounded-full items-center justify-center mb-1 bg-border">
                <Ionicons name="person-outline" size={22} color="#999" />
              </View>
            )}
          </View>
        </View>

        {/* Reason */}
        <View className="flex-row items-center pt-3 border-t border-border">
          <Ionicons name="information-circle-outline" size={16} color="#999" />
          <Text className="text-xs text-textGray ml-2">
            Lý do: {getReasonLabel(item.reason)}
          </Text>
        </View>
      </View>
    );
  };

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
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3 w-10 h-10 rounded-full bg-background items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#333333" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text">
            Lịch sử thay đổi hạng
          </Text>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="time-outline" size={64} color="#CCCCCC" />
            <Text className="text-textGray mt-4 text-center">
              Chưa có lịch sử thay đổi hạng
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#2E86AB" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
