import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ReturnTypeSelector - Component to select return type (RETURN/EXCHANGE/WARRANTY)
 */
export default function ReturnTypeSelector({
  value,
  onChange,
  disabled = false,
}) {
  const types = [
    {
      value: "RETURN",
      icon: "💰",
      label: "Trả hàng",
      description: "Hoàn tiền",
      color: "#F18F01",
    },
    {
      value: "EXCHANGE",
      icon: "🔄",
      label: "Đổi hàng",
      description: "Đổi sản phẩm khác",
      color: "#2196F3",
    },
    {
      value: "WARRANTY",
      icon: "🛡️",
      label: "Bảo hành",
      description: "Sửa chữa/thay thế",
      color: "#4CAF50",
    },
  ];

  return (
    <View style={styles.container}>
      {types.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeButton,
            value === type.value && [
              styles.typeButtonActive,
              { borderColor: type.color },
            ],
            disabled && styles.typeButtonDisabled,
          ]}
          onPress={() => !disabled && onChange(type.value)}
          disabled={disabled}
        >
          <Text style={styles.typeIcon}>{type.icon}</Text>
          <Text
            style={[
              styles.typeLabel,
              value === type.value && styles.typeLabelActive,
            ]}
          >
            {type.label}
          </Text>
          <Text style={styles.typeDescription}>{type.description}</Text>

          {value === type.value && (
            <View style={[styles.checkmark, { backgroundColor: type.color }]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 16,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  typeButtonActive: {
    borderWidth: 2,
    backgroundColor: "#F8FAFC",
  },
  typeButtonDisabled: {
    opacity: 0.5,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  typeLabelActive: {
    fontWeight: "700",
    color: "#111",
  },
  typeDescription: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
