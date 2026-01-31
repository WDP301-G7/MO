import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function VouchersScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("available");
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const vouchers = [
    {
      id: 1,
      code: "NEWUSER100",
      title: "Giảm 100K cho đơn hàng đầu",
      discount: "100.000đ",
      minOrder: 500000,
      expiry: "31/01/2026",
      description: "Áp dụng cho khách hàng mới. Đơn hàng tối thiểu 500.000đ",
      type: "Giảm giá",
      status: "available",
    },
    {
      id: 2,
      code: "FREESHIP50",
      title: "Miễn phí vận chuyển",
      discount: "50.000đ",
      minOrder: 300000,
      expiry: "25/01/2026",
      description: "Miễn phí ship toàn quốc. Đơn hàng từ 300.000đ",
      type: "Vận chuyển",
      status: "available",
    },
    {
      id: 3,
      code: "FLASH30",
      title: "Flash Sale giảm 30%",
      discount: "30%",
      minOrder: 1000000,
      expiry: "20/01/2026",
      description: "Giảm 30% tối đa 200.000đ. Áp dụng cho đơn từ 1.000.000đ",
      type: "Giảm giá",
      status: "available",
    },
    {
      id: 4,
      code: "BIRTHDAY200",
      title: "Sinh nhật giảm 200K",
      discount: "200.000đ",
      minOrder: 800000,
      expiry: "28/02/2026",
      description: "Ưu đãi sinh nhật. Áp dụng cho đơn hàng từ 800.000đ",
      type: "Giảm giá",
      status: "available",
    },
    {
      id: 5,
      code: "USED2024",
      title: "Voucher đã sử dụng",
      discount: "50.000đ",
      minOrder: 200000,
      expiry: "Đã dùng 15/01/2026",
      description: "Đã sử dụng cho đơn hàng #ORD123",
      type: "Giảm giá",
      status: "used",
    },
    {
      id: 6,
      code: "EXPIRED50",
      title: "Voucher hết hạn",
      discount: "50.000đ",
      minOrder: 200000,
      expiry: "Hết hạn 10/01/2026",
      description: "Voucher đã hết hạn sử dụng",
      type: "Giảm giá",
      status: "expired",
    },
  ];

  const tabs = [
    { id: "available", label: "Khả dụng", count: 4 },
    { id: "used", label: "Đã dùng", count: 1 },
    { id: "expired", label: "Hết hạn", count: 1 },
  ];

  const filterVouchers = () => {
    return vouchers.filter((v) => v.status === selectedTab);
  };

  const handleApplyVoucher = (voucher) => {
    alert(`Đã áp dụng mã: ${voucher.code}`);
    navigation.goBack();
  };

  const handleViewDetail = (voucher) => {
    setSelectedVoucher(voucher);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#10B981";
      case "used":
        return "#999999";
      case "expired":
        return "#EF4444";
      default:
        return "#999999";
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">Ví Voucher</Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="bg-background rounded-xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="pricetag-outline" size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-sm text-text"
            placeholder="Nhập mã voucher..."
            placeholderTextColor="#999999"
            value={voucherCode}
            onChangeText={setVoucherCode}
          />
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => alert("Áp dụng mã")}
          >
            <Text className="text-white font-semibold text-xs">Áp dụng</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 pb-3 items-center ${
                selectedTab === tab.id ? "border-b-2 border-primary" : ""
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === tab.id ? "text-primary" : "text-textGray"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vouchers List */}
      <ScrollView
        className="flex-1 px-5 py-4"
        showsVerticalScrollIndicator={false}
      >
        {filterVouchers().map((voucher) => (
          <TouchableOpacity
            key={voucher.id}
            className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm"
            onPress={() => handleViewDetail(voucher)}
          >
            <View className="flex-row">
              {/* Left Side - Discount */}
              <View
                className="w-28 items-center justify-center p-4"
                style={{
                  backgroundColor: getStatusColor(voucher.status) + "20",
                }}
              >
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: getStatusColor(voucher.status) }}
                >
                  {voucher.discount}
                </Text>
                <Text className="text-xs text-textGray text-center">
                  {voucher.type}
                </Text>
              </View>

              {/* Right Side - Info */}
              <View className="flex-1 p-4">
                <Text
                  className="text-base font-bold text-text mb-1"
                  numberOfLines={1}
                >
                  {voucher.title}
                </Text>
                <Text className="text-xs text-textGray mb-2" numberOfLines={2}>
                  {voucher.description}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#999999" />
                    <Text className="text-xs text-textGray ml-1">
                      HSD: {voucher.expiry}
                    </Text>
                  </View>
                  {voucher.status === "available" && (
                    <TouchableOpacity
                      className="bg-primary px-3 py-1.5 rounded-lg"
                      onPress={() => handleApplyVoucher(voucher)}
                    >
                      <Text className="text-white font-semibold text-xs">
                        Sử dụng
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Dotted Line */}
            <View className="border-t border-dashed border-border mx-4" />

            {/* Code */}
            <View className="px-4 py-2 flex-row items-center justify-between">
              <Text className="text-sm font-mono text-text">
                {voucher.code}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  alert(`Đã copy mã: ${voucher.code}`);
                }}
              >
                <Ionicons name="copy-outline" size={18} color="#2E86AB" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filterVouchers().length === 0 && (
          <View className="items-center justify-center py-16">
            <Ionicons name="pricetag-outline" size={80} color="#E0E0E0" />
            <Text className="text-lg font-bold text-text mt-4">
              Chưa có voucher
            </Text>
            <Text className="text-sm text-textGray text-center mt-2">
              Không có voucher trong mục này
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-text">
                Chi tiết voucher
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {selectedVoucher && (
              <>
                <View className="bg-background rounded-xl p-4 mb-4">
                  <Text className="text-2xl font-bold text-primary text-center mb-2">
                    {selectedVoucher.discount}
                  </Text>
                  <Text className="text-base font-bold text-text text-center">
                    {selectedVoucher.title}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-bold text-text mb-2">
                    Điều kiện:
                  </Text>
                  <Text className="text-sm text-textGray">
                    • Đơn hàng tối thiểu:{" "}
                    {`${selectedVoucher.minOrder.toLocaleString("vi-VN")}đ`}
                  </Text>
                  <Text className="text-sm text-textGray">
                    • {selectedVoucher.description}
                  </Text>
                  <Text className="text-sm text-textGray">
                    • Hạn sử dụng: {selectedVoucher.expiry}
                  </Text>
                </View>

                {selectedVoucher.status === "available" && (
                  <TouchableOpacity
                    className="bg-primary rounded-xl py-4 items-center"
                    onPress={() => {
                      setShowDetailModal(false);
                      handleApplyVoucher(selectedVoucher);
                    }}
                  >
                    <Text className="text-white font-bold text-base">
                      Sử dụng ngay
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
