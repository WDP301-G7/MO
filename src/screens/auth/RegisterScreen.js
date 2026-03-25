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
import { register } from "../../services/authService";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !address
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    // Phone validation (Vietnamese phone number)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10 chữ số");
      return;
    }

    // Password validation
    if (password.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (!agreeTerms) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        fullName,
        email,
        phone,
        password,
        address,
      });

      if (result.success) {
        Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      } else {
        Alert.alert("Đăng ký thất bại", result.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
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
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: "rgba(255,255,255,0.07)",
          top: -70,
          right: -70,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: "rgba(255,255,255,0.06)",
          top: 120,
          left: -50,
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="items-center pt-14 pb-6">
          {/* Back button */}
          <TouchableOpacity
            className="absolute left-5 top-14 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View
            className="w-16 h-16 rounded-2xl bg-card items-center justify-center mb-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="person-add" size={34} color="#2E86AB" />
          </View>
          <Text className="text-2xl font-extrabold text-white tracking-wide">
            Tạo tài khoản
          </Text>
          <Text
            className="text-sm mt-1"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Bắt đầu hành trình chăm sóc mắt
          </Text>
        </View>

        {/* Card */}
        <View
          className="bg-card px-6 pt-7 pb-10"
          style={{
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            flex: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {[
            {
              key: "fullName",
              placeholder: "Họ và tên",
              icon: "person-outline",
              value: fullName,
              setter: setFullName,
              keyboard: "default",
              cap: "words",
            },
            {
              key: "email",
              placeholder: "Email",
              icon: "mail-outline",
              value: email,
              setter: setEmail,
              keyboard: "email-address",
              cap: "none",
            },
            {
              key: "phone",
              placeholder: "Số điện thoại (10 chữ số)",
              icon: "call-outline",
              value: phone,
              setter: setPhone,
              keyboard: "phone-pad",
              cap: "none",
              maxLen: 10,
            },
            {
              key: "address",
              placeholder: "Địa chỉ",
              icon: "location-outline",
              value: address,
              setter: setAddress,
              keyboard: "default",
              cap: "sentences",
            },
          ].map((field) => (
            <View
              key={field.key}
              className="flex-row items-center rounded-2xl px-4 py-3.5 mb-3"
              style={{
                backgroundColor:
                  focusedField === field.key ? "#F0F8FF" : "#F7F9FC",
                borderWidth: 1.5,
                borderColor: focusedField === field.key ? "#2E86AB" : "#EEEEEE",
              }}
            >
              <Ionicons
                name={field.icon}
                size={20}
                color={focusedField === field.key ? "#2E86AB" : "#AAAAAA"}
              />
              <TextInput
                className="flex-1 ml-2.5 text-base text-text"
                placeholder={field.placeholder}
                placeholderTextColor="#BBBBBB"
                value={field.value}
                onChangeText={field.setter}
                keyboardType={field.keyboard}
                autoCapitalize={field.cap}
                maxLength={field.maxLen}
                editable={!loading}
                onFocus={() => setFocusedField(field.key)}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          ))}

          {/* Password */}
          <View
            className="flex-row items-center rounded-2xl px-4 py-3.5 mb-3"
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
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
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

          {/* Confirm Password */}
          <View
            className="flex-row items-center rounded-2xl px-4 py-3.5 mb-4"
            style={{
              backgroundColor:
                focusedField === "confirmPassword" ? "#F0F8FF" : "#F7F9FC",
              borderWidth: 1.5,
              borderColor:
                focusedField === "confirmPassword" ? "#2E86AB" : "#EEEEEE",
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedField === "confirmPassword" ? "#2E86AB" : "#AAAAAA"}
            />
            <TextInput
              className="flex-1 ml-2.5 text-base text-text"
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#BBBBBB"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#AAAAAA"
              />
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <TouchableOpacity
            className="flex-row items-start mb-6"
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.7}
          >
            <View
              className="w-5 h-5 rounded items-center justify-center mr-2 mt-0.5"
              style={{
                borderWidth: 2,
                borderColor: agreeTerms ? "#2E86AB" : "#CCCCCC",
                backgroundColor: agreeTerms ? "#2E86AB" : "transparent",
              }}
            >
              {agreeTerms && (
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              )}
            </View>
            <Text className="flex-1 text-xs text-textGray leading-5">
              {"Tôi đồng ý với "}
              <Text className="text-primary font-semibold">
                Điều khoản sử dụng
              </Text>
              {" và "}
              <Text className="text-primary font-semibold">
                Chính sách bảo mật
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Register button */}
          <TouchableOpacity
            className="rounded-2xl overflow-hidden mb-5"
            style={[
              {
                shadowColor: "#2E86AB",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: agreeTerms && !loading ? 0.35 : 0,
                shadowRadius: 12,
                elevation: agreeTerms && !loading ? 8 : 0,
              },
              (!agreeTerms || loading) && { opacity: 0.55 },
            ]}
            onPress={handleRegister}
            disabled={!agreeTerms || loading}
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
                  Đăng Ký
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

          {/* Google only */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-card rounded-2xl py-3.5 border border-border mb-7"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
              borderWidth: 1.5,
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text className="text-base font-semibold text-textLight ml-2.5">
              Tiếp tục với Google
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-textGray">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-sm font-bold text-primary">Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
