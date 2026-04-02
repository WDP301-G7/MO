import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getProducts, getProductImages } from "../../services/productService";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

export default function VirtualTryOnSelectScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Fetch all FRAME products (only frames have 3D models for try-on)
      const result = await getProducts({ type: "FRAME", limit: 50 });
      if (result.success) {
        const withModel = (result.data || []).filter((p) => !!p.model3dUrl);
        setProducts(withModel);

        // Load images in parallel
        const imgMap = {};
        await Promise.all(
          withModel.map(async (p) => {
            const r = await getProductImages(p.id);
            if (r.success && r.data?.length > 0) {
              const sorted = [...r.data].sort((a, b) =>
                b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
              );
              imgMap[p.id] = sorted[0].imageUrl;
            }
          }),
        );
        setImages(imgMap);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product) => {
    navigation.navigate("VirtualTryOn", {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: images[product.id] || null,
        model3dUrl: product.model3dUrl,
        model3dSizeBytes: product.model3dSizeBytes || null,
      },
      model3dUrl: product.model3dUrl,
      model3dSizeBytes: product.model3dSizeBytes || null,
    });
  };

  const renderProduct = ({ item }) => {
    const img = images[item.id];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect(item)}
        activeOpacity={0.82}
      >
        {img ? (
          <Image
            source={{ uri: img }}
            style={styles.cardImg}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImg, styles.cardImgEmpty]}>
            <Ionicons name="glasses-outline" size={36} color="#CCC" />
          </View>
        )}
        <View style={styles.cardOverlay}>
          <View style={styles.arBadge}>
            <Ionicons name="scan" size={11} color="#fff" />
            <Text style={styles.arBadgeTxt}>AR</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardBrand} numberOfLines={1}>
            {item.brand || ""}
          </Text>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardPrice}>
            {Number(item.price).toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <View style={styles.tryBtn}>
          <Ionicons name="camera" size={14} color="#7C3AED" />
          <Text style={styles.tryBtnTxt}>Thử ngay</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thử kính ảo AR</Text>
          <Text style={styles.headerSub}>Chọn gọng kính để thử</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingTxt}>Đang tải sản phẩm...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="glasses-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTxt}>
            Chưa có sản phẩm hỗ trợ thử kính AR
          </Text>
          <Text style={styles.emptySub}>
            Các sản phẩm có mô hình 3D sẽ xuất hiện ở đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Ionicons name="cube-outline" size={16} color="#7C3AED" />
              <Text style={styles.listHeaderTxt}>
                {products.length} sản phẩm hỗ trợ AR
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  headerSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingTxt: { marginTop: 12, color: "#9CA3AF", fontSize: 14 },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTxt: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },

  list: { padding: 16 },
  row: { justifyContent: "space-between", marginBottom: 16 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  listHeaderTxt: { fontSize: 13, color: "#7C3AED", fontWeight: "600" },

  card: {
    width: CARD_W,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImg: { width: "100%", height: CARD_W * 0.85, backgroundColor: "#F3F4F6" },
  cardImgEmpty: { alignItems: "center", justifyContent: "center" },
  cardOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  arBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  arBadgeTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
  cardBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  cardBrand: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  cardName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E86AB",
    marginTop: 4,
  },
  tryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginHorizontal: 12,
    marginBottom: 10,
  },
  tryBtnTxt: { fontSize: 13, fontWeight: "600", color: "#7C3AED" },
});
