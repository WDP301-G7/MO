import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { login, loginWithGoogle } from "../../services/authService";
import { useGoogleAuth } from "../../services/googleAuthService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Auth Hook
  const { request, response, promptAsync } = useGoogleAuth();

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        Alert.alert("Thành công", "Đăng nhập thành công!", [
          {
            text: "OK",
            onPress: () => navigation.replace("MainApp"),
          },
        ]);
      } else {
        Alert.alert("Đăng nhập thất bại", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return; // Prevent double tap

    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(promptAsync, request);

      if (result.success) {
        // Kiểm tra xem user có cần cập nhật số điện thoại không
        if (result.requiresPhoneUpdate) {
          // Navigate trực tiếp vào MainApp trước
          navigation.replace("MainApp");
          // Delay nhỏ rồi navigate vào EditProfile
          setTimeout(() => {
            Alert.alert(
              "Cập nhật thông tin",
              "Vui lòng cập nhật số điện thoại để tiếp tục sử dụng dịch vụ.",
              [
                {
                  text: "Cập nhật ngay",
                  onPress: () => {
                    navigation.navigate("EditProfile", { requirePhone: true });
                  },
                },
              ],
              { cancelable: false },
            );
          }, 500);
        } else {
          Alert.alert("Thành công", "Đăng nhập với Google thành công!", [
            {
              text: "OK",
              onPress: () => navigation.replace("MainApp"),
            },
          ]);
        }
      } else {
        Alert.alert("Đăng nhập thất bại", result.message);
      }
    } catch (error) {
      console.error("❌ Google Login Error:", error);
      Alert.alert("Lỗi", "Không thể mở Google Sign-In");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mt-10 mb-10">
          <View className="w-30 h-30 rounded-full bg-white items-center justify-center shadow-lg">
            <Ionicons name="glasses-outline" size={60} color="#2E86AB" />
          </View>
          <Text className="text-3xl font-bold text-primary mt-4">
            EyeCare Store
          </Text>
          <Text className="text-sm text-textGray mt-1">
            Chăm sóc đôi mắt của bạn
          </Text>
        </View>

        {/* Login Form */}
        <View className="bg-white rounded-3xl p-6 shadow-lg">
          <Text className="text-2xl font-bold text-text mb-6 text-center">
            Đăng Nhập
          </Text>

          {/* Email Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="mail-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999999"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="lock-closed-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999999"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999999"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="self-end mb-6"
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text className="text-primary text-sm font-semibold">
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center shadow-lg"
            onPress={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Đăng Nhập</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-textGray text-xs font-semibold">
              HOẶC
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Login */}
          <View className="flex-row justify-center mb-6">
            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border"
              onPress={handleGoogleLogin}
              disabled={googleLoading || loading}
              style={{ opacity: googleLoading || loading ? 0.5 : 1 }}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#DB4437" />
              ) : (
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-textLight text-sm">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-primary text-sm font-bold">
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
