import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function StoreMapScreen({ navigation, route }) {
  const { storeName, storeAddress, appointmentDate, appointmentTime } =
    route.params || {};

  const openInGoogleMaps = () => {
    // Encode address for URL
    const encodedAddress = encodeURIComponent(storeAddress || storeName);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url);
  };

  const callStore = () => {
    Linking.openURL("tel:0283456789");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3 w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text flex-1">
            Thông tin cửa hàng
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Store Information Card */}
        <View className="mx-5 mt-5">
          <View className="bg-white rounded-3xl p-5 shadow-md border border-gray-100">
            {/* Store Header */}
            <View className="flex-row items-start mb-4">
              <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                <Ionicons name="storefront" size={28} color="#2E86AB" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-text mb-1">
                  {storeName}
                </Text>
                <View className="flex-row items-start">
                  <Ionicons
                    name="location"
                    size={16}
                    color="#666"
                    style={{ marginTop: 2 }}
                  />
                  <Text className="text-sm text-textGray ml-2 flex-1 leading-5">
                    {storeAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* Appointment Info */}
            {appointmentDate && appointmentTime && (
              <View className="bg-blue-50 rounded-2xl p-4 mb-4 border-l-4 border-primary">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="calendar" size={18} color="#2E86AB" />
                  <Text className="text-xs font-bold text-primary ml-2">
                    LỊCH HẸN CỦA BẠN
                  </Text>
                </View>
                <Text className="text-base font-bold text-text">
                  {appointmentDate}
                </Text>
                <Text className="text-sm font-semibold text-primary mt-1">
                  {appointmentTime}
                </Text>
              </View>
            )}

            {/* Distance & Time (Mock data) */}
            <View className="flex-row mb-4">
              <View className="flex-1 bg-gray-50 rounded-xl p-3 mr-2">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color="#F18F01" />
                  <Text className="text-xs text-textGray ml-2">
                    Khoảng cách
                  </Text>
                </View>
                <Text className="text-lg font-bold text-text mt-1">4.2 km</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-xl p-3 ml-2">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#10B981" />
                  <Text className="text-xs text-textGray ml-2">Thời gian</Text>
                </View>
                <Text className="text-lg font-bold text-text mt-1">
                  ~15 phút
                </Text>
              </View>
            </View>

            {/* Contact */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="call" size={18} color="#2E86AB" />
                <Text className="text-sm font-bold text-text ml-2">
                  Liên hệ cửa hàng
                </Text>
              </View>
              <TouchableOpacity onPress={callStore}>
                <Text className="text-base font-bold text-primary">
                  028 3456 7890
                </Text>
              </TouchableOpacity>
            </View>

            {/* Operating Hours */}
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={18} color="#2E86AB" />
                <Text className="text-sm font-bold text-text ml-2">
                  Giờ mở cửa
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-textGray">Thứ 2 - Thứ 6:</Text>
                <Text className="text-sm font-semibold text-text">
                  08:00 - 20:00
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-textGray">Thứ 7 - Chủ nhật:</Text>
                <Text className="text-sm font-semibold text-text">
                  08:00 - 21:00
                </Text>
              </View>
              <View className="mt-2 pt-2 border-t border-gray-200">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <Text className="text-sm font-semibold text-green-600">
                    Đang mở cửa
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="bg-white px-5 py-4 border-t border-gray-100 shadow-lg">
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center shadow-md"
          onPress={openInGoogleMaps}
        >
          <View className="flex-row items-center">
            <Ionicons name="navigate" size={22} color="#FFF" />
            <Text className="text-white font-bold text-base ml-2">
              Chỉ đường
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
