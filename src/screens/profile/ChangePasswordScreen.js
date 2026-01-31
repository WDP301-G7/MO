import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { changePassword, logout } from "../../services/authService";

export default function ChangePasswordScreen({ navigation }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp!");
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setLoading(false);

      if (result.success) {
        Alert.alert(
          "Đổi mật khẩu thành công",
          "Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại với mật khẩu mới.",
          [
            {
              text: "Đăng nhập lại",
              onPress: async () => {
                // Logout user
                await logout();
                // Navigate to Login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        // Show detailed error message
        const errorMsg = result.message || "Đổi mật khẩu thất bại";
        Alert.alert("Lỗi", errorMsg);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra. Vui lòng thử đăng nhập lại nếu token hết hạn.",
      );
    }
  };

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
          <Text className="text-xl font-bold text-text">Đổi mật khẩu</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Security Icon */}
        <View className="items-center py-8 bg-white mb-2">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Ionicons name="lock-closed" size={48} color="#2E86AB" />
          </View>
          <Text className="text-base font-bold text-text">
            Bảo mật tài khoản
          </Text>
          <Text className="text-sm text-textGray text-center mt-2 px-8">
            Mật khẩu mạnh giúp bảo vệ tài khoản của bạn tốt hơn
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white px-5 py-5 mb-2">
          {/* Current Password */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Mật khẩu hiện tại <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-background rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                className="flex-1 text-sm text-text"
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showPassword.current}
                value={formData.currentPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, currentPassword: text })
                }
              />
              <TouchableOpacity
                onPress={() =>
                  setShowPassword({
                    ...showPassword,
                    current: !showPassword.current,
                  })
                }
              >
                <Ionicons
                  name={
                    showPassword.current ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Mật khẩu mới <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-background rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                className="flex-1 text-sm text-text"
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showPassword.new}
                value={formData.newPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, newPassword: text })
                }
              />
              <TouchableOpacity
                onPress={() =>
                  setShowPassword({ ...showPassword, new: !showPassword.new })
                }
              >
                <Ionicons
                  name={showPassword.new ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              Xác nhận mật khẩu mới <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-background rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                className="flex-1 text-sm text-text"
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showPassword.confirm}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
              />
              <TouchableOpacity
                onPress={() =>
                  setShowPassword({
                    ...showPassword,
                    confirm: !showPassword.confirm,
                  })
                }
              >
                <Ionicons
                  name={
                    showPassword.confirm ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color="#999999"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Password Requirements */}
        <View className="bg-white px-5 py-5 mb-2">
          <Text className="text-sm font-bold text-text mb-3">
            Mật khẩu cần có:
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center">
              <Ionicons
                name={
                  formData.newPassword.length >= 6
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={18}
                color={formData.newPassword.length >= 6 ? "#10B981" : "#CCCCCC"}
              />
              <Text
                className={`text-sm ml-2 ${
                  formData.newPassword.length >= 6
                    ? "text-green-600"
                    : "text-textGray"
                }`}
              >
                Ít nhất 6 ký tự
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={
                  /[A-Z]/.test(formData.newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={18}
                color={
                  /[A-Z]/.test(formData.newPassword) ? "#10B981" : "#CCCCCC"
                }
              />
              <Text
                className={`text-sm ml-2 ${
                  /[A-Z]/.test(formData.newPassword)
                    ? "text-green-600"
                    : "text-textGray"
                }`}
              >
                Có chữ in hoa
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={
                  /[0-9]/.test(formData.newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={18}
                color={
                  /[0-9]/.test(formData.newPassword) ? "#10B981" : "#CCCCCC"
                }
              />
              <Text
                className={`text-sm ml-2 ${
                  /[0-9]/.test(formData.newPassword)
                    ? "text-green-600"
                    : "text-textGray"
                }`}
              >
                Có chữ số
              </Text>
            </View>
          </View>
        </View>

        {/* Forgot Password Link */}
        <View className="px-5 py-4">
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text className="text-primary text-center font-semibold">
              Quên mật khẩu hiện tại?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white border-t border-border px-5 py-4">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
