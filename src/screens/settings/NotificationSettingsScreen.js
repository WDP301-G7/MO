import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: true,
    newProducts: false,
    priceDrops: true,
    newsletter: false,
    appNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const toggleSwitch = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const notificationGroups = [
    {
      title: "Thông báo đơn hàng",
      items: [
        {
          key: "orderUpdates",
          title: "Cập nhật đơn hàng",
          description: "Nhận thông báo về trạng thái đơn hàng",
          icon: "receipt-outline",
        },
      ],
    },
    {
      title: "Thông báo khuyến mãi",
      items: [
        {
          key: "promotions",
          title: "Chương trình khuyến mãi",
          description: "Thông báo về các chương trình giảm giá",
          icon: "pricetag-outline",
        },
        {
          key: "newProducts",
          title: "Sản phẩm mới",
          description: "Thông báo khi có sản phẩm mới ra mắt",
          icon: "sparkles-outline",
        },
        {
          key: "priceDrops",
          title: "Giảm giá sản phẩm yêu thích",
          description: "Thông báo khi sản phẩm yêu thích giảm giá",
          icon: "trending-down-outline",
        },
      ],
    },
    {
      title: "Tin tức & Cập nhật",
      items: [
        {
          key: "newsletter",
          title: "Bản tin hàng tuần",
          description: "Nhận email tổng hợp tin tức, mẹo sử dụng",
          icon: "mail-outline",
        },
      ],
    },
    {
      title: "Kênh nhận thông báo",
      items: [
        {
          key: "appNotifications",
          title: "Thông báo trong ứng dụng",
          description: "Hiển thị thông báo khi mở ứng dụng",
          icon: "phone-portrait-outline",
        },
        {
          key: "emailNotifications",
          title: "Thông báo qua Email",
          description: "Gửi thông báo đến email của bạn",
          icon: "mail-outline",
        },
        {
          key: "smsNotifications",
          title: "Thông báo qua SMS",
          description: "Gửi tin nhắn SMS (có thể phát sinh phí)",
          icon: "chatbubble-outline",
        },
      ],
    },
  ];

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
          <Text className="text-xl font-bold text-text">Cài đặt thông báo</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {notificationGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-2">
            <View className="px-5 py-3">
              <Text className="text-sm font-bold text-textGray">
                {group.title}
              </Text>
            </View>
            <View className="bg-white">
              {group.items.map((item, itemIndex) => (
                <View
                  key={item.key}
                  className={`px-5 py-4 flex-row items-center ${
                    itemIndex < group.items.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <Ionicons name={item.icon} size={22} color="#2E86AB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-text mb-1">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-textGray">
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggleSwitch(item.key)}
                    trackColor={{ false: "#D1D5DB", true: "#A3C9E2" }}
                    thumbColor={settings[item.key] ? "#2E86AB" : "#F3F4F6"}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Info Note */}
        <View className="bg-accent/10 mx-5 mt-2 rounded-xl p-4 mb-6 flex-row">
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#F18F01"
          />
          <Text className="flex-1 text-sm text-text ml-2">
            Bạn có thể thay đổi cài đặt thông báo bất cứ lúc nào. Một số thông
            báo quan trọng về đơn hàng sẽ luôn được gửi.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
