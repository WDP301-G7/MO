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

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = () => {
    // Mock registration
    alert("Đăng ký thành công!");
    navigation.navigate("Login");
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
        {/* Header */}
        <View className="flex-row items-center justify-between mt-10 mb-6">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">Đăng Ký Tài Khoản</Text>
          <View className="w-10" />
        </View>

        {/* Form */}
        <View className="bg-white rounded-3xl p-6 shadow-lg">
          <Text className="text-sm text-textGray text-center mb-6">
            Tạo tài khoản mới để bắt đầu mua sắm
          </Text>

          {/* Full Name Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="person-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Họ và tên"
              placeholderTextColor="#999999"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="mail-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="call-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Số điện thoại"
              placeholderTextColor="#999999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="lock-closed-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Mật khẩu"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999999"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
            <Ionicons name="lock-closed-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-3 text-base text-text"
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999999"
              />
            </TouchableOpacity>
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            className="flex-row items-start mb-6"
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center mr-2 mt-0.5 ${
                agreeTerms ? "bg-primary border-primary" : "border-border"
              }`}
            >
              {agreeTerms && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text className="flex-1 text-xs text-textGray leading-5">
              Tôi đồng ý với{" "}
              <Text className="text-primary font-semibold">
                Điều khoản sử dụng
              </Text>{" "}
              và{" "}
              <Text className="text-primary font-semibold">
                Chính sách bảo mật
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center shadow-lg ${
              agreeTerms ? "bg-primary" : "bg-textGray opacity-50"
            }`}
            onPress={handleRegister}
            disabled={!agreeTerms}
          >
            <Text className="text-white text-base font-bold">Đăng Ký</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-textGray text-xs font-semibold">
              HOẶC
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Register */}
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

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-textGray text-sm">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-primary text-sm font-bold">Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
