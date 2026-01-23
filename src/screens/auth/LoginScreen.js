import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Mock login - navigate to main app
    navigation.replace("MainApp");
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

          {/* Email/Phone Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="mail-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Email hoặc số điện thoại"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999999"
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
          >
            <Text className="text-white text-base font-bold">Đăng Nhập</Text>
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
          <View className="flex-row justify-center gap-4 mb-6">
            <TouchableOpacity className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border">
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border">
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border">
              <Ionicons name="logo-apple" size={24} color="#000000" />
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
