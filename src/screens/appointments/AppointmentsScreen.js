import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMyPrescriptionRequests,
  PRESCRIPTION_STATUS,
} from "../../services/prescriptionService";

export default function AppointmentsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: 0, label: "Đang xử lý", statuses: ["PENDING", "CONTACTING"] },
    { id: 1, label: "Chờ thanh toán", statuses: ["QUOTED"] },
    { id: 2, label: "Đã xác nhận", statuses: ["ACCEPTED", "SCHEDULED"] },
    { id: 3, label: "Đã đóng", statuses: ["EXPIRED", "LOST"] },
  ];

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, []),
  );

  const loadRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getMyPrescriptionRequests();

      if (result.success) {
        setRequests(result.data || []);
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadRequests(true);
  };

  const filterRequests = () => {
    const currentTab = tabs[selectedTab];
    return requests.filter((request) =>
      currentTab.statuses.includes(request.status),
    );
  };

  const filteredRequests = filterRequests();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderRequest = ({ item }) => {
    const statusInfo = PRESCRIPTION_STATUS[item.status] || {};

    return (
      <TouchableOpacity
        className="bg-white mx-5 mb-4 rounded-3xl overflow-hidden shadow-md border border-gray-100"
        onPress={() => {
          // Nếu có orderId (đã báo giá), đi đến OrderDetail
          if (item.orderId) {
            navigation.navigate("OrderDetail", { orderId: item.orderId });
          }
        }}
      >
        {/* Header */}
        <View
          className="px-4 pt-4 pb-3"
          style={{ backgroundColor: statusInfo.color + "08" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
                style={{ backgroundColor: statusInfo.color + "15" }}
              >
                <Ionicons
                  name={statusInfo.icon || "document-text-outline"}
                  size={26}
                  color={statusInfo.color}
                />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-xs text-textGray">
                  Mã: {item.id?.substring(0, 8)}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                  <Text
                    className="text-sm font-bold"
                    style={{ color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-4">
          {/* Info */}
          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text className="text-sm text-textGray ml-2">
                Hình thức:{" "}
                <Text className="font-semibold text-text">
                  {item.consultationType === "PHONE"
                    ? "Tư vấn qua điện thoại"
                    : "Tư vấn tại cửa hàng"}
                </Text>
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text className="text-sm text-textGray ml-2">
                Ngày tạo:{" "}
                <Text className="font-semibold text-text">
                  {formatDate(item.createdAt)}
                </Text>
              </Text>
            </View>

            {item.symptoms && (
              <View className="flex-row items-start mt-2 bg-gray-50 rounded-xl p-3">
                <Ionicons name="medical-outline" size={16} color="#666" />
                <Text className="text-sm text-textGray ml-2 flex-1">
                  {item.symptoms}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="bg-blue-50 rounded-xl p-3 mb-3">
            <Text className="text-xs text-blue-700">
              {statusInfo.description}
            </Text>
          </View>

          {/* Actions */}
          {item.status === "QUOTED" && item.orderId && (
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              onPress={() =>
                navigation.navigate("OrderDetail", { orderId: item.orderId })
              }
            >
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={18} color="#FFF" />
                <Text className="text-white font-bold text-sm ml-2">
                  Xem báo giá & Thanh toán
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {(item.status === "ACCEPTED" || item.status === "SCHEDULED") &&
            item.orderId && (
              <TouchableOpacity
                className="bg-primary rounded-xl py-3 items-center"
                onPress={() =>
                  navigation.navigate("OrderDetail", { orderId: item.orderId })
                }
              >
                <View className="flex-row items-center">
                  <Ionicons name="receipt-outline" size={18} color="#FFF" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Theo dõi đơn hàng
                  </Text>
                </View>
              </TouchableOpacity>
            )}
        </View>
      </TouchableOpacity>
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
      <View className="bg-white pt-12 pb-4 px-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-text">
                Yêu cầu tư vấn
              </Text>
              <Text className="text-xs text-textGray mt-1">
                Theo dõi yêu cầu đặt kính theo đơn thuốc
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("PrescriptionOrder")}
          >
            <Ionicons name="add-circle" size={32} color="#2E86AB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`mr-3 px-4 py-2.5 rounded-xl ${
                selectedTab === tab.id ? "bg-primary" : "bg-gray-100"
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === tab.id ? "text-white" : "text-textGray"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {filteredRequests.length > 0 ? (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-1 items-center justify-center px-8 py-20">
            <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
            <Text className="text-base text-textGray text-center mt-4 mb-2">
              Chưa có yêu cầu tư vấn nào
            </Text>
            <Text className="text-sm text-textGray text-center mb-6">
              Tạo yêu cầu tư vấn để đặt kính theo đơn thuốc của bạn
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl px-6 py-3"
              onPress={() => navigation.navigate("PrescriptionOrder")}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text className="text-white font-bold text-sm ml-2">
                  Tạo yêu cầu mới
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
