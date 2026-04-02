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

export default function ForgotPasswordScreen({ navigation }) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = () => {
    setStep(2);
  };

  const handleVerifyOTP = () => {
    setStep(3);
  };

  const handleResetPassword = () => {
    alert("Đặt lại mật khẩu thành công!");
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
        <View className="mt-10 mb-5">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 bg-white rounded-3xl p-6 shadow-lg">
          <View className="items-center my-6">
            <Ionicons
              name={
                step === 1
                  ? "mail-outline"
                  : step === 2
                    ? "shield-checkmark-outline"
                    : "lock-closed-outline"
              }
              size={80}
              color="#2E86AB"
            />
          </View>

          <Text className="text-2xl font-bold text-text text-center mb-3">
            {step === 1
              ? "Quên Mật Khẩu?"
              : step === 2
                ? "Nhập Mã OTP"
                : "Đặt Mật Khẩu Mới"}
          </Text>

          <Text className="text-sm text-textGray text-center mb-8 leading-5">
            {step === 1
              ? "Nhập email hoặc số điện thoại để nhận mã xác thực"
              : step === 2
                ? "Mã OTP đã được gửi đến " + emailOrPhone
                : "Tạo mật khẩu mới cho tài khoản của bạn"}
          </Text>

          {/* Step 1: Enter Email/Phone */}
          {step === 1 && (
            <>
              <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
                <Ionicons name="mail-outline" size={20} color="#999999" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="Email hoặc số điện thoại"
                  placeholderTextColor="#999999"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center mb-6 shadow-lg"
                onPress={handleSendOTP}
              >
                <Text className="text-white text-base font-bold">
                  Gửi Mã OTP
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <>
              <View className="mb-6">
                <TextInput
                  className="border border-border rounded-xl py-5 text-2xl font-bold tracking-widest bg-background"
                  placeholder="------"
                  placeholderTextColor="#999999"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
              </View>

              <TouchableOpacity className="flex-row justify-center mb-6">
                <Text className="text-textGray text-sm">
                  Không nhận được mã?{" "}
                </Text>
                <Text className="text-primary text-sm font-bold">Gửi lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center mb-6 shadow-lg"
                onPress={handleVerifyOTP}
              >
                <Text className="text-white text-base font-bold">Xác Nhận</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#999999"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="Mật khẩu mới"
                  placeholderTextColor="#999999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#999999"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center border border-border rounded-xl px-4 py-3 mb-4 bg-background">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#999999"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="Xác nhận mật khẩu mới"
                  placeholderTextColor="#999999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#999999"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center mb-6 shadow-lg"
                onPress={handleResetPassword}
              >
                <Text className="text-white text-base font-bold">
                  Đặt Lại Mật Khẩu
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login */}
          <TouchableOpacity
            className="flex-row justify-center items-center gap-2"
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons name="arrow-back" size={16} color="#2E86AB" />
            <Text className="text-primary text-sm font-semibold">
              Quay lại đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
