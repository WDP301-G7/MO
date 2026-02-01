import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getProfile, updateProfile } from "../../services/authService";

export default function EditProfileScreen({ navigation, route }) {
  const requirePhone = route?.params?.requirePhone || false;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "male",
    address: "",
  });

  useEffect(() => {
    loadUserProfile();
    // Hiển thị alert nếu cần cập nhật phone
    if (requirePhone) {
      Alert.alert(
        "Cập nhật số điện thoại",
        "Bạn đã đăng nhập bằng Google. Vui lòng cập nhật số điện thoại để hoàn tất đăng ký.",
        [{ text: "Đã hiểu" }],
      );
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const result = await getProfile();

      if (result.success && result.data) {
        setUser(result.data);
        // Map data từ backend vào form
        setFormData({
          fullName: result.data.fullName || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          birthDate: "", // Backend chưa có field này
          gender: "male", // Backend chưa có field này
          address: result.data.address || "",
        });
      } else {
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Cần cấp quyền truy cập thư viện ảnh để chọn ảnh đại diện",
      );
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedAvatar({
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      });
    }
  };

  const handleSave = async () => {
    // Validate
    if (!formData.fullName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập họ và tên");
      return;
    }

    // Validate phone nếu cần thiết (login bằng Google)
    if (requirePhone && !formData.phone.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại");
      return;
    }

    // Validate phone format nếu có nhập
    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        Alert.alert("Thông báo", "Số điện thoại không hợp lệ (10 số)");
        return;
      }
    }

    try {
      setSaving(true);

      const updateData = {
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
      };

      // Thêm phone nếu có
      if (formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }

      // Add avatar if selected
      if (selectedAvatar) {
        updateData.avatar = selectedAvatar;
      }

      const result = await updateProfile(user.id, updateData);

      if (result.success) {
        Alert.alert(
          "Thành công",
          result.message || "Cập nhật thông tin thành công",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert("Lỗi", result.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  // Show loading
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-4">Đang tải thông tin...</Text>
      </View>
    );
  }

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
                uri:
                  selectedAvatar?.uri ||
                  user?.avatarUrl ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&h=240&fit=crop",
              }}
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-white"
              onPress={pickImage}
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
              className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-textGray"
              placeholder="Nhập email"
              keyboardType="email-address"
              value={formData.email}
              editable={false}
            />
            <Text className="text-xs text-textGray mt-1">
              Email không thể thay đổi
            </Text>
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Số điện thoại{" "}
              {requirePhone && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text"
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            {requirePhone && (
              <Text className="text-xs text-red-500 mt-1">
                Bắt buộc nhập số điện thoại
              </Text>
            )}
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
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
