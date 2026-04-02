import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { login, loginWithGoogle } from "../../services/authService";
import { useGoogleAuth } from "../../services/googleAuthService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { request, response, promptAsync } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const result = await login({ email, password });
      if (result.success) {
        navigation.replace("MainApp");
      } else {
        Alert.alert("Đăng nhập thất bại", result.message);
      }
    } catch {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(promptAsync, request);
      if (result.success) {
        if (result.requiresPhoneUpdate) {
          navigation.replace("MainApp");
          setTimeout(() => {
            Alert.alert(
              "Cập nhật thông tin",
              "Vui lòng cập nhật số điện thoại để tiếp tục sử dụng dịch vụ.",
              [
                {
                  text: "Cập nhật ngay",
                  onPress: () =>
                    navigation.navigate("EditProfile", { requirePhone: true }),
                },
              ],
              { cancelable: false },
            );
          }, 500);
        } else {
          navigation.replace("MainApp");
        }
      } else {
        Alert.alert("Đăng nhập thất bại", result.message);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể mở Google Sign-In");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      {/* Gradient background */}
      <LinearGradient
        colors={["#1565C0", "#2E86AB", "#48B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Decorative circles */}
      <View
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(255,255,255,0.07)",
          top: -80,
          right: -80,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "rgba(255,255,255,0.06)",
          top: 160,
          left: -60,
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="items-center pt-20 pb-8">
          <View
            className="w-20 h-20 rounded-3xl bg-card items-center justify-center mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Ionicons name="glasses" size={44} color="#2E86AB" />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-wide">
            EyeCare Store
          </Text>
          <Text
            className="text-sm mt-1"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Chăm sóc đôi mắt của bạn
          </Text>
        </View>

        {/* Card */}
        <View
          className="bg-card flex-1 px-7 pt-9 pb-10"
          style={{
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Text className="text-2xl font-extrabold text-text mb-1">
            Chào mừng trở lại 👋
          </Text>
          <Text className="text-sm text-textGray mb-7">
            Đăng nhập để tiếp tục
          </Text>

          {/* Email */}
          <View
            className="flex-row items-center rounded-2xl px-4 py-3.5 mb-3.5"
            style={{
              backgroundColor: focusedField === "email" ? "#F0F8FF" : "#F7F9FC",
              borderWidth: 1.5,
              borderColor: focusedField === "email" ? "#2E86AB" : "#EEEEEE",
            }}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={focusedField === "email" ? "#2E86AB" : "#AAAAAA"}
            />
            <TextInput
              className="flex-1 ml-2.5 text-base text-text"
              placeholder="Email"
              placeholderTextColor="#BBBBBB"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <View
            className="flex-row items-center rounded-2xl px-4 py-3.5 mb-2"
            style={{
              backgroundColor:
                focusedField === "password" ? "#F0F8FF" : "#F7F9FC",
              borderWidth: 1.5,
              borderColor: focusedField === "password" ? "#2E86AB" : "#EEEEEE",
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedField === "password" ? "#2E86AB" : "#AAAAAA"}
            />
            <TextInput
              className="flex-1 ml-2.5 text-base text-text"
              placeholder="Mật khẩu"
              placeholderTextColor="#BBBBBB"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#AAAAAA"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity
            className="self-end mb-6"
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text className="text-sm text-primary font-semibold">
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            className="rounded-2xl overflow-hidden mb-5"
            style={[
              {
                shadowColor: "#2E86AB",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#2E86AB", "#1565C0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold tracking-wide">
                  Đăng Nhập
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-5">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-xs font-bold text-textGray mx-3 tracking-widest">
              HOẶC
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Google */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-card rounded-2xl py-3.5 border border-border mb-7"
            style={[
              {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
                borderWidth: 1.5,
              },
              (googleLoading || loading) && { opacity: 0.5 },
            ]}
            onPress={handleGoogleLogin}
            disabled={googleLoading || loading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#DB4437" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text className="text-base font-semibold text-textLight ml-2.5">
                  Tiếp tục với Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register */}
          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-textGray">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-sm font-bold text-primary">
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
