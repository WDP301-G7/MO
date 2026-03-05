import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PRODUCT_CONDITION_LABELS } from "../../services/returnService";

/**
 * ProductConditionSelector - Component to select product condition
 */
export default function ProductConditionSelector({
  value,
  onChange,
  disabled = false,
}) {
  const conditions = [
    { value: "NEW", ...PRODUCT_CONDITION_LABELS.NEW },
    { value: "LIKE_NEW", ...PRODUCT_CONDITION_LABELS.LIKE_NEW },
    { value: "GOOD", ...PRODUCT_CONDITION_LABELS.GOOD },
    { value: "DEFECTIVE", ...PRODUCT_CONDITION_LABELS.DEFECTIVE },
  ];

  return (
    <View style={styles.container}>
      {conditions.map((condition) => (
        <TouchableOpacity
          key={condition.value}
          style={[
            styles.conditionItem,
            value === condition.value && styles.conditionItemActive,
            disabled && styles.conditionItemDisabled,
          ]}
          onPress={() => !disabled && onChange(condition.value)}
          disabled={disabled}
        >
          <Text style={styles.conditionIcon}>{condition.icon}</Text>
          <View style={styles.conditionInfo}>
            <Text
              style={[
                styles.conditionLabel,
                value === condition.value && styles.conditionLabelActive,
              ]}
            >
              {condition.label}
            </Text>
            <Text style={styles.conditionDescription}>
              {condition.description}
            </Text>
          </View>
          {value === condition.value && (
            <Ionicons name="checkmark-circle" size={24} color="#F18F01" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  conditionItemActive: {
    borderColor: "#F18F01",
    borderWidth: 2,
    backgroundColor: "#FFF8EF",
  },
  conditionItemDisabled: {
    opacity: 0.5,
  },
  conditionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  conditionLabelActive: {
    fontWeight: "700",
    color: "#F18F01",
  },
  conditionDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
});
