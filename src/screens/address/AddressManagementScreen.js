import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function AddressManagementScreen({ navigation }) {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Đường Lê Lợi, Phường Bến Nghé",
      ward: "Phường Bến Nghé",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
      type: "home",
      isDefault: true,
    },
    {
      id: 2,
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "456 Đường Nguyễn Huệ, Phường Bến Thành",
      ward: "Phường Bến Thành",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
      type: "office",
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    type: "home",
  });

  const handleSetDefault = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSaveAddress = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr,
        ),
      );
    } else {
      setAddresses([
        ...addresses,
        {
          ...formData,
          id: Date.now(),
          isDefault: addresses.length === 0,
        },
      ]);
    }

    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      city: "",
      type: "home",
    });
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddModal(true);
  };

  const renderAddressCard = (address) => (
    <View
      key={address.id}
      className="bg-white rounded-2xl p-4 mb-3 border-2 border-border"
    >
      {address.isDefault && (
        <View className="bg-primary px-3 py-1 rounded-full self-start mb-3">
          <Text className="text-xs text-white font-semibold">Mặc định</Text>
        </View>
      )}

      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-base font-bold text-text">
              {address.name}
            </Text>
            <View className="w-1 h-1 bg-textGray rounded-full mx-2" />
            <Text className="text-sm text-textGray">{address.phone}</Text>
          </View>
          <View className="flex-row items-start mb-2">
            <Ionicons name="location-outline" size={16} color="#999999" />
            <Text className="text-sm text-text flex-1 ml-2 leading-5">
              {address.address}, {address.ward}, {address.district},{" "}
              {address.city}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className={`px-2 py-0.5 rounded ${
                address.type === "home" ? "bg-blue-100" : "bg-orange-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  address.type === "home" ? "text-blue-600" : "text-orange-600"
                }`}
              >
                {address.type === "home" ? "Nhà riêng" : "Văn phòng"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row gap-2 border-t border-border pt-3">
        {!address.isDefault && (
          <TouchableOpacity
            className="flex-1 border border-primary rounded-lg py-2 items-center"
            onPress={() => handleSetDefault(address.id)}
          >
            <Text className="text-primary font-semibold text-sm">
              Đặt làm mặc định
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 border border-border rounded-lg py-2 items-center"
          onPress={() => handleEdit(address)}
        >
          <Text className="text-text font-semibold text-sm">Chỉnh sửa</Text>
        </TouchableOpacity>
        {!address.isDefault && (
          <TouchableOpacity
            className="border border-red-500 rounded-lg px-4 py-2 items-center"
            onPress={() => handleDelete(address.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
            <Text className="text-xl font-bold text-text">Địa chỉ của tôi</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {addresses.map((address) => renderAddressCard(address))}

        <TouchableOpacity
          className="bg-white border-2 border-dashed border-primary rounded-2xl p-6 items-center"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle-outline" size={48} color="#2E86AB" />
          <Text className="text-primary font-bold text-base mt-2">
            Thêm địa chỉ mới
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl pt-4 pb-8 max-h-[90%]">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />

            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="text-xl font-bold text-text">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Họ và tên <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-sm text-text"
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Số điện thoại <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-sm text-text"
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                />
              </View>

              {/* City/Province */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Tỉnh/Thành phố <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity className="bg-background rounded-xl px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-sm text-text">
                    {formData.city || "Chọn Tỉnh/Thành phố"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </TouchableOpacity>
              </View>

              {/* District */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Quận/Huyện <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity className="bg-background rounded-xl px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-sm text-text">
                    {formData.district || "Chọn Quận/Huyện"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </TouchableOpacity>
              </View>

              {/* Ward */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Phường/Xã <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity className="bg-background rounded-xl px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-sm text-text">
                    {formData.ward || "Chọn Phường/Xã"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </TouchableOpacity>
              </View>

              {/* Address Detail */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Địa chỉ cụ thể <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-sm text-text min-h-20"
                  placeholder="Số nhà, tên đường..."
                  multiline
                  textAlignVertical="top"
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                />
              </View>

              {/* Address Type */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-text mb-2">
                  Loại địa chỉ
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className={`flex-1 border-2 rounded-xl py-3 items-center ${
                      formData.type === "home"
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    onPress={() => setFormData({ ...formData, type: "home" })}
                  >
                    <Ionicons
                      name="home-outline"
                      size={24}
                      color={formData.type === "home" ? "#2E86AB" : "#999999"}
                    />
                    <Text
                      className={`text-sm font-semibold mt-1 ${
                        formData.type === "home"
                          ? "text-primary"
                          : "text-textGray"
                      }`}
                    >
                      Nhà riêng
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 border-2 rounded-xl py-3 items-center ${
                      formData.type === "office"
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    onPress={() => setFormData({ ...formData, type: "office" })}
                  >
                    <Ionicons
                      name="business-outline"
                      size={24}
                      color={formData.type === "office" ? "#2E86AB" : "#999999"}
                    />
                    <Text
                      className={`text-sm font-semibold mt-1 ${
                        formData.type === "office"
                          ? "text-primary"
                          : "text-textGray"
                      }`}
                    >
                      Văn phòng
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center mt-2"
                onPress={handleSaveAddress}
              >
                <Text className="text-white font-bold text-base">
                  {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
