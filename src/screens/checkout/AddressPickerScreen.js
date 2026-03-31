/**
 * AddressPickerScreen
 * Cho phép user chọn địa chỉ giao hàng (Tỉnh → Huyện → Xã + địa chỉ chi tiết)
 * Chỉ dùng cho đơn hàng HOME_DELIVERY (gọng kính lẻ)
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/logisticsService";
import { setPendingAddress } from "../../utils/addressStore";

export default function AddressPickerScreen({ navigation, route }) {
  // Do NOT pass callbacks as params (non-serializable).
  // Address is returned via addressStore + navigation.goBack().
  const { initialAddress } = route.params || {};

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(
    initialAddress?.province || null,
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialAddress?.district || null,
  );
  const [selectedWard, setSelectedWard] = useState(
    initialAddress?.ward || null,
  );
  const [streetAddress, setStreetAddress] = useState(
    initialAddress?.streetAddress || "",
  );

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [provincesError, setProvincesError] = useState(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'province' | 'district' | 'ward'
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    loadProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);
      // Support both GHN (ProvinceID) and provinces.open-api.vn (code)
      loadDistricts(selectedProvince.ProvinceID ?? selectedProvince.code);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      setSelectedWard(null);
      setWards([]);
      // Support both GHN (DistrictID) and provinces.open-api.vn (code)
      loadWards(selectedDistrict.DistrictID ?? selectedDistrict.code);
    }
  }, [selectedDistrict]);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    setProvincesError(null);
    const result = await getProvinces();
    if (result.success) {
      setProvinces(result.data);
    } else {
      setProvincesError(result.message || "Không thể tải danh sách tỉnh/thành");
    }
    setLoadingProvinces(false);
  };

  const loadDistricts = async (provinceId) => {
    setLoadingDistricts(true);
    const result = await getDistricts(provinceId);
    if (result.success) {
      setDistricts(result.data);
    } else {
      Alert.alert("Lỗi", result.message || "Không thể tải quận/huyện");
    }
    setLoadingDistricts(false);
  };

  const loadWards = async (districtId) => {
    setLoadingWards(true);
    const result = await getWards(districtId);
    if (result.success) {
      setWards(result.data);
    } else {
      Alert.alert("Lỗi", result.message || "Không thể tải phường/xã");
    }
    setLoadingWards(false);
  };

  const openModal = (type) => {
    setModalType(type);
    setModalSearch("");
    setModalVisible(true);
  };

  const handleSelectItem = (item) => {
    if (modalType === "province") {
      setSelectedProvince(item);
    } else if (modalType === "district") {
      setSelectedDistrict(item);
    } else if (modalType === "ward") {
      setSelectedWard(item);
    }
    setModalVisible(false);
  };

  const getModalData = () => {
    const search = modalSearch.toLowerCase();
    if (modalType === "province") {
      return provinces.filter((p) =>
        (p.ProvinceName || p.name || "").toLowerCase().includes(search),
      );
    }
    if (modalType === "district") {
      return districts.filter((d) =>
        (d.DistrictName || d.name || "").toLowerCase().includes(search),
      );
    }
    if (modalType === "ward") {
      return wards.filter((w) =>
        (w.WardName || w.name || "").toLowerCase().includes(search),
      );
    }
    return [];
  };

  const getItemName = (item) => {
    if (!item) return "";
    return (
      item.ProvinceName || item.DistrictName || item.WardName || item.name || ""
    );
  };

  const getModalTitle = () => {
    if (modalType === "province") return "Chọn Tỉnh / Thành phố";
    if (modalType === "district") return "Chọn Quận / Huyện";
    if (modalType === "ward") return "Chọn Phường / Xã";
    return "";
  };

  const canConfirm =
    selectedProvince &&
    selectedDistrict &&
    selectedWard &&
    streetAddress.trim().length > 0;

  const handleConfirm = () => {
    const address = {
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      streetAddress: streetAddress.trim(),
      // IDs: prefer GHN fields (ProvinceID/DistrictID/WardCode),
      // fallback to provinces.open-api.vn code field
      shippingProvinceId:
        selectedProvince?.ProvinceID ?? selectedProvince?.code,
      shippingDistrictId:
        selectedDistrict?.DistrictID ?? selectedDistrict?.code,
      shippingWardCode:
        selectedWard?.WardCode ??
        selectedWard?.WardID?.toString() ??
        selectedWard?.code?.toString(),
      // Full address string for display
      shippingAddress: `${streetAddress.trim()}, ${getItemName(selectedWard)}, ${getItemName(selectedDistrict)}, ${getItemName(selectedProvince)}`,
    };

    // Store address in module-level store, then go back to the EXISTING
    // CheckoutScreen (goBack ensures no new instance is created).
    setPendingAddress(address);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between bg-white pt-12 pb-4 px-5 shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-background items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Địa chỉ giao hàng</Text>
        <View className="w-10" />
      </View>

      {loadingProvinces ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text className="text-sm text-textGray mt-3">
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : provincesError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={56} color="#EF4444" />
          <Text className="text-base font-bold text-text mt-4 text-center">
            Không thể tải dữ liệu địa chỉ
          </Text>
          <Text className="text-sm text-textGray text-center mt-2 mb-6">
            {provincesError}
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-xl"
            onPress={loadProvinces}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5 gap-4">
            {/* Province */}
            <View>
              <Text className="text-sm font-semibold text-text mb-2">
                Tỉnh / Thành phố <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-white rounded-xl px-4 py-4 border border-border"
                onPress={() => openModal("province")}
              >
                <Text
                  className={`text-sm flex-1 ${selectedProvince ? "text-text" : "text-textGray"}`}
                >
                  {selectedProvince
                    ? getItemName(selectedProvince)
                    : "Chọn tỉnh / thành phố"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* District */}
            <View>
              <Text className="text-sm font-semibold text-text mb-2">
                Quận / Huyện <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className={`flex-row items-center justify-between bg-white rounded-xl px-4 py-4 border border-border ${!selectedProvince ? "opacity-50" : ""}`}
                onPress={() => selectedProvince && openModal("district")}
                disabled={!selectedProvince}
              >
                {loadingDistricts ? (
                  <ActivityIndicator size="small" color="#2E86AB" />
                ) : (
                  <>
                    <Text
                      className={`text-sm flex-1 ${selectedDistrict ? "text-text" : "text-textGray"}`}
                    >
                      {selectedDistrict
                        ? getItemName(selectedDistrict)
                        : "Chọn quận / huyện"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#999" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Ward */}
            <View>
              <Text className="text-sm font-semibold text-text mb-2">
                Phường / Xã <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className={`flex-row items-center justify-between bg-white rounded-xl px-4 py-4 border border-border ${!selectedDistrict ? "opacity-50" : ""}`}
                onPress={() => selectedDistrict && openModal("ward")}
                disabled={!selectedDistrict}
              >
                {loadingWards ? (
                  <ActivityIndicator size="small" color="#2E86AB" />
                ) : (
                  <>
                    <Text
                      className={`text-sm flex-1 ${selectedWard ? "text-text" : "text-textGray"}`}
                    >
                      {selectedWard
                        ? getItemName(selectedWard)
                        : "Chọn phường / xã"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#999" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Street address */}
            <View>
              <Text className="text-sm font-semibold text-text mb-2">
                Địa chỉ chi tiết <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white rounded-xl px-4 py-4 text-sm text-text border border-border"
                placeholder="Số nhà, tên đường..."
                placeholderTextColor="#999"
                value={streetAddress}
                onChangeText={setStreetAddress}
              />
            </View>

            {/* Address preview */}
            {canConfirm && (
              <View className="bg-primary/10 rounded-xl p-4">
                <Text className="text-xs font-semibold text-primary mb-1">
                  Địa chỉ giao hàng:
                </Text>
                <Text className="text-sm text-text">
                  {`${streetAddress.trim()}, ${getItemName(selectedWard)}, ${getItemName(selectedDistrict)}, ${getItemName(selectedProvince)}`}
                </Text>
              </View>
            )}
          </View>

          <View className="h-32" />
        </ScrollView>
      )}

      {/* Confirm button - hide when loading or error */}
      {!loadingProvinces && !provincesError && (
        <View className="bg-white p-5 shadow-lg">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${canConfirm ? "bg-primary" : "bg-border"}`}
            onPress={handleConfirm}
            disabled={!canConfirm}
          >
            <Text
              className={`font-bold text-base ${canConfirm ? "text-white" : "text-textGray"}`}
            >
              Xác nhận địa chỉ
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: "75%" }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <Text className="text-base font-bold text-text">
                {getModalTitle()}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-5 py-3">
              <View className="flex-row items-center bg-background rounded-xl px-3 py-2 border border-border">
                <Ionicons name="search" size={18} color="#999" />
                <TextInput
                  className="flex-1 ml-2 text-sm text-text"
                  placeholder="Tìm kiếm..."
                  placeholderTextColor="#999"
                  value={modalSearch}
                  onChangeText={setModalSearch}
                  autoFocus
                />
              </View>
            </View>

            {/* List */}
            <FlatList
              data={getModalData()}
              keyExtractor={(item, index) => {
                const id =
                  item.ProvinceID ||
                  item.DistrictID ||
                  item.WardCode ||
                  item.WardID;
                return id ? `${id}-${index}` : `item-${index}`;
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-5 py-4 border-b border-border/40"
                  onPress={() => handleSelectItem(item)}
                >
                  <Text className="text-sm text-text">{getItemName(item)}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-sm text-textGray">
                    Không tìm thấy kết quả
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
