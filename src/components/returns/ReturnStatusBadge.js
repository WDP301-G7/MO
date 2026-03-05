import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RETURN_STATUS_LABELS } from "../../services/returnService";

/**
 * ReturnStatusBadge - Component to display return status badge
 */
export default function ReturnStatusBadge({ status, size = "medium" }) {
  const config = RETURN_STATUS_LABELS[status] || {
    label: status,
    color: "#999",
    description: "",
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 11,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 13,
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
    },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.color },
        {
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: sizeStyles[size].fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "white",
    fontWeight: "600",
  },
});
