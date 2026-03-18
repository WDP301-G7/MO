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
import {
  getStores,
  createPrescriptionRequest,
  CONSULTATION_TYPES,
} from "../../services/prescriptionService";
import { getProfile } from "../../services/authService";

export default function PrescriptionOrderScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState([]);
  const [userPhone, setUserPhone] = useState("");

  const [formData, setFormData] = useState({
    storeId: "00000000-0000-0000-0000-000000000011",
    consultationType: "PHONE",
    phone: "",
    symptoms: "",
    images: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load stores
      const storesResult = await getStores();
      if (storesResult.success) {
        const storesData = Array.isArray(storesResult.data)
          ? storesResult.data
          : [];
        setStores(storesData);
        // Set default store to Chi nhánh Quận 3
        const defaultStoreId = "00000000-0000-0000-0000-000000000011";
        const hasDefaultStore = storesData.some(
          (store) => store.id === defaultStoreId,
        );
        if (hasDefaultStore) {
          setFormData((prev) => ({
            ...prev,
            storeId: defaultStoreId,
          }));
        } else if (storesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            storeId: storesData[0].id,
          }));
        }
      } else {
        setStores([]);
        Alert.alert(
          "Thông báo",
          storesResult.message || "Không thể tải danh sách cửa hàng",
        );
      }

      // Load user profile to get phone
      const profileResult = await getProfile();
      if (profileResult.success && profileResult.data) {
        const phone = profileResult.data.phone || "";
        setUserPhone(phone);
        setFormData((prev) => ({ ...prev, phone }));
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (formData.images.length >= 3) {
      Alert.alert("Thông báo", "Chỉ có thể upload tối đa 3 ảnh");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Cần cấp quyền truy cập thư viện ảnh để chọn ảnh đơn thuốc",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6, // Compress to reduce size
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newImage = {
        uri: asset.uri,
        name: asset.fileName || `prescription_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.storeId) {
      Alert.alert("Thông báo", "Vui lòng chọn cửa hàng");
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại");
      return;
    }

    const phoneRegex = /^[0-9]{10,20}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ (10-20 số)");
      return;
    }

    if (formData.images.length === 0) {
      Alert.alert(
        "Xác nhận",
        "Bạn chưa upload ảnh đơn thuốc. Bạn có muốn tiếp tục?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Tiếp tục", onPress: () => submitRequest() },
        ],
      );
      return;
    }

    submitRequest();
  };

  const submitRequest = async () => {
    try {
      setSubmitting(true);

      const result = await createPrescriptionRequest(formData);

      if (result.success) {
        Alert.alert(
          "Thành công",
          "Yêu cầu tư vấn đã được gửi. Tư vấn viên sẽ liên hệ với bạn trong 1-2 giờ.",
          [
            {
              text: "Về trang chủ",
              style: "cancel",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainApp", params: { screen: "HomeTab" } }],
                });
              },
            },
            {
              text: "Xem yêu cầu",
              onPress: () => {
                navigation.navigate("Appointments");
              },
            },
          ],
        );
      } else {
        Alert.alert("Lỗi", result.message || "Không thể gửi yêu cầu tư vấn");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-4">Đang tải...</Text>
      </View>
    );
  }

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
          <View className="flex-1">
            <Text className="text-xl font-bold text-text">
              Đặt kính theo đơn thuốc
            </Text>
            <Text className="text-sm text-textGray mt-1">
              Upload đơn thuốc và nhận tư vấn
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl border border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-blue-900">
                Quy trình đặt kính
              </Text>
              <Text className="text-xs text-blue-700 mt-1">
                1. Upload ảnh đơn thuốc{"\n"}
                2. Tư vấn viên sẽ gọi điện tư vấn{"\n"}
                3. Nhận báo giá và thanh toán{"\n"}
                4. Nhận kính tại cửa hàng
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="bg-white mt-4 px-5 py-5">
          {/* Store Selection */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">
              Cửa hàng nhận kính <Text className="text-red-500">*</Text>
            </Text>
            {Array.isArray(stores) && stores.length > 0 ? (
              <>
                {stores.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    className={`flex-row items-center p-4 border rounded-xl mb-2 ${
                      formData.storeId === store.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, storeId: store.id }))
                    }
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                        formData.storeId === store.id
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      {formData.storeId === store.id && (
                        <View className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text">
                        {store.name}
                      </Text>
                      <Text className="text-xs text-textGray mt-1">
                        {store.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View className="p-4 border border-border bg-background rounded-xl">
                <Text className="text-sm text-textGray text-center">
                  Không có cửa hàng nào khả dụng
                </Text>
              </View>
            )}
          </View>

          {/* Consultation Type */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">
              Hình thức tư vấn <Text className="text-red-500">*</Text>
            </Text>
            {Object.entries(CONSULTATION_TYPES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                className={`flex-row items-center p-4 border rounded-xl mb-2 ${
                  formData.consultationType === key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, consultationType: key }))
                }
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    formData.consultationType === key
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  {formData.consultationType === key && (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </View>
                <Ionicons
                  name={value.icon}
                  size={20}
                  color={
                    formData.consultationType === key ? "#2E86AB" : "#999999"
                  }
                />
                <Text className="text-sm text-text ml-2">{value.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">
              Số điện thoại <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text"
              placeholder="Nhập số điện thoại liên hệ"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
            />
          </View>

          {/* Symptoms */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">
              Triệu chứng/Ghi chú
            </Text>
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-sm text-text"
              placeholder="Mô tả triệu chứng hoặc ghi chú (nếu có)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.symptoms}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, symptoms: text }))
              }
            />
          </View>

          {/* Images */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-text mb-2">
              Ảnh đơn thuốc (1-3 ảnh)
            </Text>

            <View className="flex-row flex-wrap">
              {formData.images.map((image, index) => (
                <View key={index} className="relative mr-2 mb-2">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-24 h-24 rounded-xl"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {formData.images.length < 3 && (
                <TouchableOpacity
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-border items-center justify-center bg-background"
                  onPress={pickImage}
                >
                  <Ionicons name="camera-outline" size={32} color="#999999" />
                  <Text className="text-xs text-textGray mt-1">Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-xs text-textGray mt-2">
              * Chụp rõ nét, đầy đủ thông tin đơn thuốc
            </Text>
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-border">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            submitting ? "bg-gray-400" : "bg-primary"
          }`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Gửi yêu cầu tư vấn
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
