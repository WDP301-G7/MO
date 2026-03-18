import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMyMembership,
  getAllTiers,
  formatCurrency,
  getTierColor,
  getTierIcon,
} from "../../services/membershipService";

export default function MembershipScreen({ navigation }) {
  const [membership, setMembership] = useState(null);
  const [allTiers, setAllTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [membershipResult, tiersResult] = await Promise.all([
        getMyMembership(),
        getAllTiers(),
      ]);

      if (membershipResult.success) {
        setMembership(membershipResult.data);
      }
      if (tiersResult.success) {
        setAllTiers(tiersResult.data);
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  const getProgressPercent = () => {
    if (!membership) return 0;
    // Highest tier — 100%
    if (membership.amountToNextTier === null) return 100;
    const spent = membership.spendInPeriod || 0;
    const needed = membership.amountToNextTier || 0;
    // Next tier is free (minSpend = 0) but user hasn't spent yet → 0%
    if (needed === 0 && spent === 0) return 0;
    // If needed is 0 and user already qualified → 100%
    if (needed === 0) return 100;
    const total = spent + needed;
    return Math.min(100, (spent / total) * 100);
  };

  const currentTierName = membership?.tier || null;
  const tierColor = getTierColor(currentTierName);
  const tierIcon = getTierIcon(currentTierName);
  const progressPercent = getProgressPercent();
  // Has activity if tier assigned OR any spend recorded (totalSpent/spendInPeriod may come as number or string)
  const hasActivity = !!(
    currentTierName ||
    Number(membership?.totalSpent) > 0 ||
    Number(membership?.spendInPeriod) > 0
  );

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
      <StatusBar style="light" />

      {/* Header */}
      <View className="pt-12 pb-6 px-5" style={{ backgroundColor: tierColor }}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Hạng thành viên</Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            onPress={() => navigation.navigate("MembershipHistory")}
          >
            <Ionicons name="time-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tier Badge */}
        <View className="items-center mb-5">
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
            <Ionicons name={tierIcon} size={44} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-white">
            {currentTierName ? currentTierName.toUpperCase() : "CHƯA CÓ HẠNG"}
          </Text>
          {currentTierName ? (
            <Text className="text-white/80 text-sm mt-1">Thành viên</Text>
          ) : (
            <Text className="text-white/70 text-sm mt-1 text-center px-4">
              Hoàn thành đơn hàng đầu tiên để được xếp hạng
            </Text>
          )}
        </View>

        {/* Progress to next tier */}
        {membership && (
          <View className="bg-white/20 rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-sm font-semibold">
                Chi tiêu kỳ này
              </Text>
              <Text className="text-white text-sm font-bold">
                {formatCurrency(membership.spendInPeriod || 0)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-3 bg-white/30 rounded-full mb-2 overflow-hidden">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${progressPercent}%` }}
              />
            </View>

            {membership.amountToNextTier !== null ? (
              <Text className="text-white/90 text-xs text-center">
                {membership.amountToNextTier === 0 &&
                (membership.spendInPeriod || 0) === 0
                  ? `Mua hàng đầu tiên để vào hạng ${membership.nextTier?.toUpperCase()}`
                  : membership.amountToNextTier === 0
                    ? `Đủ điều kiện lên hạng ${membership.nextTier?.toUpperCase()}!`
                    : `Còn ${formatCurrency(membership.amountToNextTier)} để lên hạng ${membership.nextTier?.toUpperCase()}`}
              </Text>
            ) : (
              <Text className="text-white/90 text-xs text-center">
                Bạn đang ở hạng cao nhất! 🎉
              </Text>
            )}
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Membership Details — show whenever user has any activity */}
        {membership && hasActivity && (
          <View className="bg-white mx-5 mt-5 rounded-2xl p-5 shadow-sm">
            <Text className="text-base font-bold text-text mb-4">
              Thông tin kỳ hiện tại
            </Text>

            <View className="flex-row justify-between mb-3">
              <Text className="text-sm text-textGray">Bắt đầu kỳ</Text>
              <Text className="text-sm font-semibold text-text">
                {formatDate(membership.periodStartDate)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm text-textGray">Kết thúc kỳ</Text>
              <Text className="text-sm font-semibold text-text">
                {formatDate(membership.periodEndDate)}
              </Text>
            </View>
            <View className="h-px bg-border my-1" />
            <View className="flex-row justify-between mt-3 mb-3">
              <Text className="text-sm text-textGray">Tổng chi tiêu</Text>
              <Text className="text-sm font-bold text-primary">
                {formatCurrency(membership.totalSpent)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-textGray">Chi tiêu kỳ này</Text>
              <Text className="text-sm font-bold text-primary">
                {formatCurrency(membership.spendInPeriod)}
              </Text>
            </View>
          </View>
        )}

        {/* No activity placeholder */}
        {membership && !hasActivity && (
          <View className="bg-white mx-5 mt-5 rounded-2xl p-5 shadow-sm items-center">
            <Ionicons name="bag-outline" size={40} color="#CCCCCC" />
            <Text className="text-sm font-semibold text-text mt-3 mb-1">
              Chưa có đơn hàng nào
            </Text>
            <Text className="text-xs text-textGray text-center">
              Hoàn thành đơn hàng đầu tiên để bắt đầu tích lũy và được xếp hạng
              thành viên.
            </Text>
          </View>
        )}

        {/* Current Benefits */}
        {membership && currentTierName && (
          <View className="bg-white mx-5 mt-4 rounded-2xl p-5 shadow-sm">
            <Text className="text-base font-bold text-text mb-4">
              Quyền lợi của bạn
            </Text>

            <View className="flex-row items-center mb-3">
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: tierColor + "20" }}
              >
                <Ionicons name="pricetag" size={18} color={tierColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text">
                  Giảm giá mỗi đơn hàng
                </Text>
                <Text className="text-xs text-textGray">
                  {membership.discountPercent}% trên tổng đơn
                </Text>
              </View>
              <Text
                className="text-base font-bold"
                style={{ color: tierColor }}
              >
                -{membership.discountPercent}%
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: tierColor + "20" }}
              >
                <Ionicons name="shield-checkmark" size={18} color={tierColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text">
                  Bảo hành
                </Text>
                <Text className="text-xs text-textGray">
                  {membership.warrantyMonths} tháng kể từ ngày mua
                </Text>
              </View>
              <Text
                className="text-base font-bold"
                style={{ color: tierColor }}
              >
                {membership.warrantyMonths}T
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: tierColor + "20" }}
              >
                <Ionicons name="refresh" size={18} color={tierColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text">
                  Đổi hàng
                </Text>
                <Text className="text-xs text-textGray">
                  Trong vòng {membership.exchangeDays} ngày sau khi nhận hàng
                </Text>
              </View>
              <Text
                className="text-base font-bold"
                style={{ color: tierColor }}
              >
                {membership.exchangeDays}N
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: tierColor + "20" }}
              >
                <Ionicons name="return-down-back" size={18} color={tierColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text">
                  Trả hàng
                </Text>
                <Text className="text-xs text-textGray">
                  Trong vòng {membership.returnDays} ngày sau khi nhận hàng
                </Text>
              </View>
              <Text
                className="text-base font-bold"
                style={{ color: tierColor }}
              >
                {membership.returnDays}N
              </Text>
            </View>
          </View>
        )}

        {/* All Tiers Comparison */}
        {allTiers.length > 0 && (
          <View className="mx-5 mt-4 mb-8">
            <Text className="text-base font-bold text-text mb-3">
              So sánh hạng thành viên
            </Text>
            {allTiers
              .slice()
              .sort((a, b) => b.sortOrder - a.sortOrder)
              .map((tier) => {
                const isCurrentTier =
                  tier.name.toLowerCase() ===
                  (currentTierName || "").toLowerCase();
                const color = getTierColor(tier.name);
                return (
                  <View
                    key={tier.id}
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                    style={
                      isCurrentTier
                        ? { borderWidth: 2, borderColor: color }
                        : {}
                    }
                  >
                    <View className="flex-row items-center mb-3">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <Ionicons
                          name={getTierIcon(tier.name)}
                          size={22}
                          color={color}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text
                            className="text-base font-bold"
                            style={{ color }}
                          >
                            {tier.name.toUpperCase()}
                          </Text>
                          {isCurrentTier && (
                            <View
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: color }}
                            >
                              <Text className="text-white text-[10px] font-bold">
                                HIỆN TẠI
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-textGray">
                          {tier.minSpend === 0
                            ? "Mặc định"
                            : `Chi tiêu từ ${formatCurrency(tier.minSpend)}/kỳ`}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                      <View className="bg-background rounded-lg px-3 py-1.5">
                        <Text className="text-xs text-textGray">Giảm giá</Text>
                        <Text className="text-sm font-bold" style={{ color }}>
                          {tier.discountPercent}%
                        </Text>
                      </View>
                      <View className="bg-background rounded-lg px-3 py-1.5">
                        <Text className="text-xs text-textGray">Bảo hành</Text>
                        <Text className="text-sm font-bold" style={{ color }}>
                          {tier.warrantyMonths} tháng
                        </Text>
                      </View>
                      <View className="bg-background rounded-lg px-3 py-1.5">
                        <Text className="text-xs text-textGray">Đổi hàng</Text>
                        <Text className="text-sm font-bold" style={{ color }}>
                          {tier.exchangeDays} ngày
                        </Text>
                      </View>
                      <View className="bg-background rounded-lg px-3 py-1.5">
                        <Text className="text-xs text-textGray">Trả hàng</Text>
                        <Text className="text-sm font-bold" style={{ color }}>
                          {tier.returnDays} ngày
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
