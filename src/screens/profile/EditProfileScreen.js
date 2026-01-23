import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    birthDate: "01/01/1990",
    gender: "male",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
  });

  const handleSave = () => {
    alert("Cập nhật thông tin thành công!");
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Thông tin cá nhân
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center py-6 bg-white mb-2">
          <View className="relative">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&h=240&fit=crop",
              }}
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-white"
              onPress={() => alert("Chọn ảnh đại diện")}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-base text-primary font-semibold mt-3">
            Thay đổi ảnh đại diện
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white px-5 py-5 mb-2">
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Họ và tên <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Email <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text"
              placeholder="Nhập email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Số điện thoại <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text"
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>

          {/* Birth Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Ngày sinh
            </Text>
            <TouchableOpacity className="bg-background rounded-xl px-4 py-3 flex-row items-center justify-between">
              <Text className="text-sm text-text">{formData.birthDate}</Text>
              <Ionicons name="calendar-outline" size={20} color="#999999" />
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Giới tính
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 border-2 rounded-xl py-3 items-center ${
                  formData.gender === "male"
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
                onPress={() => setFormData({ ...formData, gender: "male" })}
              >
                <Text
                  className={`text-sm font-semibold ${
                    formData.gender === "male"
                      ? "text-primary"
                      : "text-textGray"
                  }`}
                >
                  Nam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 border-2 rounded-xl py-3 items-center ${
                  formData.gender === "female"
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
                onPress={() => setFormData({ ...formData, gender: "female" })}
              >
                <Text
                  className={`text-sm font-semibold ${
                    formData.gender === "female"
                      ? "text-primary"
                      : "text-textGray"
                  }`}
                >
                  Nữ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 border-2 rounded-xl py-3 items-center ${
                  formData.gender === "other"
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
                onPress={() => setFormData({ ...formData, gender: "other" })}
              >
                <Text
                  className={`text-sm font-semibold ${
                    formData.gender === "other"
                      ? "text-primary"
                      : "text-textGray"
                  }`}
                >
                  Khác
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Địa chỉ
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text min-h-20"
              placeholder="Nhập địa chỉ"
              multiline
              textAlignVertical="top"
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
            />
          </View>
        </View>

        {/* Info Note */}
        <View className="bg-accent/10 mx-5 rounded-xl p-4 mb-6 flex-row">
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#F18F01"
          />
          <Text className="flex-1 text-sm text-text ml-2">
            Thông tin cá nhân của bạn sẽ được bảo mật và chỉ sử dụng cho mục
            đích giao dịch.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white border-t border-border px-5 py-4">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-base">Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
