import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReturnStatusBadge from "./ReturnStatusBadge";
import { RETURN_TYPE_LABELS } from "../../services/returnService";

/**
 * ReturnCard - Component to display return request card
 */
export default function ReturnCard({ returnItem, onPress }) {
  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTypeInfo = () => {
    return (
      RETURN_TYPE_LABELS[returnItem.type] || {
        label: returnItem.type,
        icon: "📦",
      }
    );
  };

  const typeInfo = getTypeInfo();

  // Get first return item for display
  const firstItem = returnItem.returnItems?.[0];
  const itemsCount = returnItem.returnItems?.length || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
          <View>
            <Text style={styles.typeLabel}>{typeInfo.label}</Text>
            <Text style={styles.orderId}>
              Đơn hàng: {returnItem.orderId?.slice(0, 8)}...
            </Text>
          </View>
        </View>
        <ReturnStatusBadge status={returnItem.status} size="small" />
      </View>

      {/* Product Info */}
      {firstItem && (
        <View style={styles.productInfo}>
          <Image
            source={{
              uri:
                firstItem.product?.images?.[0]?.imageUrl ||
                "https://via.placeholder.com/60",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {firstItem.product?.name || "Sản phẩm"}
            </Text>
            <Text style={styles.productQuantity}>
              Số lượng: {firstItem.quantity}
            </Text>
            {itemsCount > 1 && (
              <Text style={styles.moreItems}>
                +{itemsCount - 1} sản phẩm khác
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Reason */}
      <View style={styles.reasonContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.reason} numberOfLines={2}>
          {returnItem.reason}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.date}>{formatDate(returnItem.createdAt)}</Text>
        </View>

        {/* Chỉ hiển thị tiền hoàn lại cho loại "Trả hàng hoàn tiền" */}
        {returnItem.type === "RETURN" && returnItem.refundAmount && (
          <Text style={styles.amount}>
            {formatCurrency(returnItem.refundAmount)}
          </Text>
        )}

        {returnItem.type === "RETURN" &&
          returnItem.priceDifference !== null &&
          returnItem.priceDifference !== undefined && (
            <Text
              style={[
                styles.amount,
                returnItem.priceDifference > 0
                  ? styles.amountPositive
                  : styles.amountNegative,
              ]}
            >
              {returnItem.priceDifference > 0 ? "+" : ""}
              {formatCurrency(returnItem.priceDifference)}
            </Text>
          )}
      </View>

      {/* Arrow icon */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9CA3AF"
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  orderId: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  productInfo: {
    flexDirection: "row",
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: "#6B7280",
  },
  moreItems: {
    fontSize: 12,
    color: "#F18F01",
    fontWeight: "500",
    marginTop: 2,
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  reason: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F18F01",
  },
  amountPositive: {
    color: "#F44336",
  },
  amountNegative: {
    color: "#4CAF50",
  },
  arrow: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
});
