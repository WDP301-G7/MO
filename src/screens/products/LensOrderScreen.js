import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  getProducts,
  formatPrice,
  getProductImages,
} from "../../services/productService";
import { createOrder } from "../../services/orderService";
import { getProfile } from "../../services/authService";
import { getProductAvailableQuantity } from "../../services/inventoryService";
import {
  getMyMembership,
  getTierColor,
} from "../../services/membershipService";

export default function LensOrderScreen({ navigation, route }) {
  const { selectedFrame, selectedLensFromProduct, fromCart, cartItems } =
    route?.params || {};
  const [step, setStep] = useState(fromCart ? 2 : 1);
  const [selectedLensType, setSelectedLensType] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(
    selectedFrame?.id || null,
  );
  const [requireAppointment, setRequireAppointment] = useState(false);

  // Dropdown states
  const [lensDropdownOpen, setLensDropdownOpen] = useState(false);
  const [frameDropdownOpen, setFrameDropdownOpen] = useState(false);

  // API data states
  const [lensProducts, setLensProducts] = useState([]);
  const [frameProducts, setFrameProducts] = useState([]);
  const [lensImages, setLensImages] = useState({});
  const [membership, setMembership] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockMap, setStockMap] = useState({});
  const fetchedStockIds = useRef(new Set());

  useEffect(() => {
    loadProducts();
    loadUserData();
    getMyMembership().then((r) => {
      if (r.success) setMembership(r.data);
    });
  }, []);

  // Fetch tồn kho tẻẳng tính khi mở dropdown tòng kính
  useEffect(() => {
    if (!lensDropdownOpen || lensProducts.length === 0) return;
    const unfetched = lensProducts.filter(
      (p) => !p.isPreorder && !fetchedStockIds.current.has(p.id),
    );
    if (unfetched.length === 0) return;
    unfetched.forEach((p) => fetchedStockIds.current.add(p.id));
    let cancelled = false;
    Promise.all(
      unfetched.map((p) =>
        getProductAvailableQuantity(p.id).then((r) => ({
          id: p.id,
          qty: r.success ? (r.data?.availableQuantity ?? 0) : Infinity,
        })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setStockMap((prev) => {
        const next = { ...prev };
        results.forEach(({ id, qty }) => {
          next[id] = qty;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [lensDropdownOpen, lensProducts]);

  // Fetch tồn kho khi mở dropdown gọ ng kính
  useEffect(() => {
    if (!frameDropdownOpen || frameProducts.length === 0) return;
    const unfetched = frameProducts.filter(
      (p) => !p.isPreorder && !fetchedStockIds.current.has(p.id),
    );
    if (unfetched.length === 0) return;
    unfetched.forEach((p) => fetchedStockIds.current.add(p.id));
    let cancelled = false;
    Promise.all(
      unfetched.map((p) =>
        getProductAvailableQuantity(p.id).then((r) => ({
          id: p.id,
          qty: r.success ? (r.data?.availableQuantity ?? 0) : Infinity,
        })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setStockMap((prev) => {
        const next = { ...prev };
        results.forEach(({ id, qty }) => {
          next[id] = qty;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [frameDropdownOpen, frameProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Tròng kính = category 00000000-0000-0000-0000-000000000002
      const lensResult = await getProducts({
        categoryId: "00000000-0000-0000-0000-000000000002",
        limit: 50,
      });
      if (lensResult.success) {
        setLensProducts(lensResult.data);
        // Fetch images for all lens products in parallel
        const imageResults = await Promise.all(
          lensResult.data.map((p) =>
            getProductImages(p.id).then((r) => ({ id: p.id, r })),
          ),
        );
        const imgMap = {};
        imageResults.forEach(({ id, r }) => {
          if (r.success && r.data?.length > 0) {
            const sorted = [...r.data].sort((a, b) =>
              b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
            );
            imgMap[id] = sorted[0].imageUrl;
          }
        });
        setLensImages(imgMap);
      }

      // Gọng kính = category 00000000-0000-0000-0000-000000000001
      const frameResult = await getProducts({
        categoryId: "00000000-0000-0000-0000-000000000001",
        limit: 50,
      });
      if (frameResult.success) {
        setFrameProducts(frameResult.data);
        // Fetch images for frame products and merge into lensImages map
        const frameImageResults = await Promise.all(
          frameResult.data.map((p) =>
            getProductImages(p.id).then((r) => ({ id: p.id, r })),
          ),
        );
        const frameImgMap = {};
        frameImageResults.forEach(({ id, r }) => {
          if (r.success && r.data?.length > 0) {
            const sorted = [...r.data].sort((a, b) =>
              b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
            );
            frameImgMap[id] = sorted[0].imageUrl;
          }
        });
        setLensImages((prev) => ({ ...prev, ...frameImgMap }));
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const result = await getProfile();
      if (result.success) {
        setUserData(result.data);
      }
    } catch (error) {
      // Silent error
    }
  };

  // Use products from API (lensProducts and frameProducts loaded in useEffect)

  // Auto-select if coming from ProductDetail with lens
  useEffect(() => {
    if (selectedLensFromProduct && lensProducts.length > 0) {
      const matchedLens = lensProducts.find(
        (lens) => lens.id === selectedLensFromProduct.id,
      );
      if (matchedLens) {
        setSelectedLensType(matchedLens.id);
        setRequireAppointment(matchedLens.isPreorder || false);
      }
    }
  }, [selectedLensFromProduct, lensProducts]);

  const isProductAvailable = (product) => {
    if (!product) return false;
    if (product.isPreorder === true) return true;
    // Use stockMap if loaded, otherwise assume available (loads lazily when dropdown opens)
    if (stockMap[product.id] === undefined) return true;
    return stockMap[product.id] > 0;
  };

  const getTotalAmount = () => {
    let total = 0;
    if (selectedFrameId) {
      const frame = frameProducts.find((f) => f.id === selectedFrameId);
      total += formatPrice(frame?.price) || 0;
    }
    if (selectedLensType) {
      const lens = lensProducts.find((l) => l.id === selectedLensType);
      total += formatPrice(lens?.price) || 0;
    }
    return total;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedLensType) {
        Alert.alert("Thông báo", "Vui lòng chọn loại tròng kính");
        return;
      }
      const lens = lensProducts.find((l) => l.id === selectedLensType);
      const frame = frameProducts.find((f) => f.id === selectedFrameId);

      if (!selectedFrameId) {
        Alert.alert("Thông báo", "Vui lòng chọn gọng kính");
        return;
      }

      // Check inventory for non-preorder items
      if (!lens.isPreorder) {
        const lensInventory = await getProductAvailableQuantity(lens.id);
        if (
          !lensInventory.success ||
          !(lensInventory.data?.availableQuantity > 0)
        ) {
          Alert.alert(
            "Thông báo",
            "Tròng kính đã chọn hiện đang hết hàng. Vui lòng chọn sản phẩm khác.",
          );
          return;
        }
      }

      if (!frame.isPreorder) {
        const frameInventory = await getProductAvailableQuantity(frame.id);
        if (
          !frameInventory.success ||
          !(frameInventory.data?.availableQuantity > 0)
        ) {
          Alert.alert(
            "Thông báo",
            "Gọng kính đã chọn hiện đang hết hàng. Vui lòng chọn sản phẩm khác.",
          );
          return;
        }
      }

      // Check if any product is preorder and require appointment
      const hasPreorder = lens?.isPreorder || frame?.isPreorder;
      setRequireAppointment(hasPreorder);

      setStep(2);
    } else if (step === 2) {
      const selectedFrame = frameProducts.find((f) => f.id === selectedFrameId);
      const selectedLens = lensProducts.find((l) => l.id === selectedLensType);

      if (!selectedFrame || !selectedLens) {
        Alert.alert("Lỗi", "Không tìm thấy sản phẩm đã chọn");
        return;
      }

      const totalAmount = getTotalAmount();
      const discountPercent = membership?.discountPercent || 0;
      const discountAmount = Math.floor((totalAmount * discountPercent) / 100);
      const paymentAmount = totalAmount - discountAmount;

      // Determine order type based on whether any product is preorder
      const hasPreorder = selectedLens?.isPreorder || selectedFrame?.isPreorder;
      const orderTypeForBackend = hasPreorder ? "PRE_ORDER" : "IN_STOCK";

      // Navigate đến VNPayPaymentScreen với thông tin order
      navigation.navigate("VNPayPayment", {
        orderData: {
          items: [
            {
              productId: selectedFrame.id,
              quantity: 1,
              price: selectedFrame.price.toString(),
            },
            {
              productId: selectedLens.id,
              quantity: 1,
              price: selectedLens.price.toString(),
            },
          ],
          deliveryMethod: "PICKUP_AT_STORE",
          paymentMethod: "VNPAY",
          ...(userData?.phone ? { phoneNumber: userData.phone } : {}),
          note: "Đơn hàng tròng + gọng kính (không cần đơn thuốc)",
        },
        totalAmount: paymentAmount,
        paymentAmount: paymentAmount,
        orderType: "lens_with_frame",
      });
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-2">
        Bước 1: Chọn sản phẩm
      </Text>
      <Text className="text-sm text-textGray mb-4">
        Chọn loại tròng kính và gọng kính
      </Text>

      {/* ── TRÒNG KÍNH ── */}
      <TouchableOpacity
        onPress={() => setLensDropdownOpen(!lensDropdownOpen)}
        className="flex-row items-center justify-between bg-blue-50 rounded-xl px-4 py-3 mb-3"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3">
            <Ionicons name="ellipse-outline" size={18} color="#2E86AB" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-primary">
              Loại tròng kính
            </Text>
            <Text className="text-xs text-primary mt-0.5">
              {lensProducts.length} sản phẩm
            </Text>
          </View>
        </View>
        <Ionicons
          name={lensDropdownOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="#2E86AB"
        />
      </TouchableOpacity>

      {selectedLensType && (
        <View className="bg-green-50 rounded-xl p-3 mb-3 flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <View className="flex-1 ml-2">
            <Text className="text-sm text-green-800">
              Đã chọn:{" "}
              <Text className="font-bold">
                {lensProducts.find((l) => l.id === selectedLensType)?.name ||
                  "Tròng kính"}
              </Text>
            </Text>
          </View>
        </View>
      )}

      {/* Info if coming from ProductDetail */}
      {selectedLensFromProduct && lensDropdownOpen && (
        <View className="bg-green-50 rounded-xl p-3 mb-3 flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <View className="flex-1 ml-2">
            <Text className="text-sm text-green-800">
              {`Bạn đã chọn `}
              <Text className="font-bold">{selectedLensFromProduct.name}</Text>
              {` từ trang sản phẩm`}
            </Text>
          </View>
        </View>
      )}

      {lensDropdownOpen &&
        lensProducts.map((lens) => {
          const available = isProductAvailable(lens);
          const isSelected = selectedLensType === lens.id;
          const lensImageUrl =
            lensImages[lens.id] ||
            lens.images?.[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=200&fit=crop";
          return (
            <TouchableOpacity
              key={lens.id}
              className={`bg-white rounded-2xl mb-3 overflow-hidden border-2 ${
                isSelected ? "border-primary" : "border-gray-100"
              } ${!available ? "opacity-50" : ""}`}
              onPress={() => available && setSelectedLensType(lens.id)}
              disabled={!available}
            >
              <Image
                source={{ uri: lensImageUrl }}
                className="w-full h-36"
                resizeMode="cover"
              />
              {isSelected && (
                <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-1 flex-row items-center">
                  <Ionicons name="checkmark" size={12} color="#fff" />
                  <Text className="text-white text-xs font-bold ml-1">
                    Đã chọn
                  </Text>
                </View>
              )}
              <View className="p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center flex-wrap mb-1">
                      <Text className="text-base font-bold text-text mr-2">
                        {lens.name}
                      </Text>
                      {lens.brand && (
                        <View className="bg-accent px-2 py-0.5 rounded-full">
                          <Text className="text-xs text-white font-semibold">
                            {lens.brand}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-lg font-bold text-primary mb-1">
                      {`${formatPrice(lens.price).toLocaleString("vi-VN")}đ`}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={
                          !available
                            ? "close-circle"
                            : lens.isPreorder
                              ? "time"
                              : "checkmark-circle"
                        }
                        size={13}
                        color={
                          !available
                            ? "#EF4444"
                            : lens.isPreorder
                              ? "#F18F01"
                              : "#10B981"
                        }
                      />
                      <Text className="text-xs text-textGray ml-1">
                        {!available
                          ? "Hết hàng"
                          : lens.isPreorder
                            ? `Đặt trước (${lens.leadTimeDays || 7} ngày)`
                            : "Sẵn hàng"}
                      </Text>
                    </View>
                    {lens.description ? (
                      <Text
                        className="text-xs text-textGray mt-2"
                        numberOfLines={2}
                      >
                        {lens.description}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center mt-1 shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

      {/* ── GỌNG KÍNH ── */}
      <TouchableOpacity
        onPress={() => setFrameDropdownOpen(!frameDropdownOpen)}
        className="flex-row items-center justify-between bg-orange-50 rounded-xl px-4 py-3 mt-4 mb-3"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3">
            <Ionicons name="glasses-outline" size={18} color="#F18F01" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-accent">
              Chọn gọng kính
            </Text>
            <Text className="text-xs text-accent mt-0.5">
              {frameProducts.filter((f) => isProductAvailable(f)).length} sản
              phẩm
            </Text>
          </View>
        </View>
        <Ionicons
          name={frameDropdownOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="#F18F01"
        />
      </TouchableOpacity>

      {selectedFrameId && (
        <View className="bg-orange-50 rounded-xl p-3 mb-3 flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#F18F01" />
          <View className="flex-1 ml-2">
            <Text className="text-sm text-orange-800">
              Đã chọn:{" "}
              <Text className="font-bold">
                {frameProducts.find((f) => f.id === selectedFrameId)?.name ||
                  "Gọng kính"}
              </Text>
            </Text>
          </View>
        </View>
      )}

      {frameDropdownOpen &&
        frameProducts.map((frame) => {
          const imageUrl =
            frame.images?.[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop";
          const available = isProductAvailable(frame);
          const isSelected = selectedFrameId === frame.id;

          return (
            <TouchableOpacity
              key={frame.id}
              className={`bg-white rounded-2xl mb-3 overflow-hidden border-2 ${
                isSelected ? "border-accent" : "border-gray-100"
              } ${!available ? "opacity-50" : ""}`}
              onPress={() => available && setSelectedFrameId(frame.id)}
              disabled={!available}
            >
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-36"
                resizeMode="cover"
              />
              {isSelected && (
                <View className="absolute top-2 right-2 bg-accent rounded-full px-2 py-1 flex-row items-center">
                  <Ionicons name="checkmark" size={12} color="#fff" />
                  <Text className="text-white text-xs font-bold ml-1">
                    Đã chọn
                  </Text>
                </View>
              )}
              <View className="p-4 flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center flex-wrap mb-1">
                    <Text className="text-base font-bold text-text mr-2">
                      {frame.name}
                    </Text>
                    {frame.brand && (
                      <View className="bg-accent px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-white font-semibold">
                          {frame.brand}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-lg font-bold text-primary">
                    {`${formatPrice(frame.price).toLocaleString("vi-VN")}đ`}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className={`w-2 h-2 rounded-full mr-1.5 ${available ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <Text
                      className={`text-xs ${available ? "text-green-600" : "text-red-600"}`}
                    >
                      {available ? "Còn hàng" : "Hết hàng"}
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mt-1 shrink-0 ${
                    isSelected ? "border-accent bg-accent" : "border-border"
                  }`}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
    </View>
  );

  const renderStep2 = () => {
    const selectedLens = lensProducts.find((l) => l.id === selectedLensType);
    const selectedFrame = frameProducts.find((f) => f.id === selectedFrameId);
    const hasPreorder = selectedLens?.isPreorder || selectedFrame?.isPreorder;
    const subtotal = getTotalAmount();
    const discountPercent = membership?.discountPercent || 0;
    const discountAmount = Math.floor((subtotal * discountPercent) / 100);
    const totalAmount = subtotal - discountAmount;

    return (
      <View>
        <Text className="text-lg font-bold text-text mb-2">
          Bước 2: Xác nhận đơn hàng
        </Text>
        <Text className="text-sm text-textGray mb-4">
          Kiểm tra thông tin trước khi thanh toán
        </Text>

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-base font-bold text-text mb-3">
            Chi tiết đơn hàng
          </Text>

          {selectedFrame && (
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <View className="flex-row items-center flex-1 mr-2">
                {lensImages[selectedFrame.id] ? (
                  <Image
                    source={{ uri: lensImages[selectedFrame.id] }}
                    className="w-12 h-12 rounded-lg mr-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-lg mr-3 bg-gray-100 items-center justify-center">
                    <Ionicons name="image-outline" size={20} color="#CCCCCC" />
                  </View>
                )}
                <Text className="text-sm text-text flex-1" numberOfLines={2}>
                  {selectedFrame.name}
                </Text>
              </View>
              <Text className="text-sm font-bold text-text">
                {`${formatPrice(selectedFrame.price).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          )}

          {selectedLens && (
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <View className="flex-row items-center flex-1 mr-2">
                {lensImages[selectedLens.id] ? (
                  <Image
                    source={{ uri: lensImages[selectedLens.id] }}
                    className="w-12 h-12 rounded-lg mr-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-lg mr-3 bg-gray-100 items-center justify-center">
                    <Ionicons name="image-outline" size={20} color="#CCCCCC" />
                  </View>
                )}
                <Text className="text-sm text-text flex-1" numberOfLines={2}>
                  {selectedLens.name}
                </Text>
              </View>
              <Text className="text-sm font-bold text-text">
                {`${formatPrice(selectedLens.price).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          )}

          {discountAmount > 0 && (
            <>
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-sm text-textGray">Tạm tính</Text>
                <Text className="text-sm text-text">
                  {`${subtotal.toLocaleString("vi-VN")}đ`}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <View className="flex-row items-center">
                  <Text className="text-sm text-green-600">
                    Ưu đãi thành viên
                  </Text>
                  {membership?.tier && (
                    <View
                      className="ml-2 px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: getTierColor(membership.tier) + "20",
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: getTierColor(membership.tier) }}
                      >
                        {`${membership.tier} -${discountPercent}%`}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm font-semibold text-green-600">
                  {`-${discountAmount.toLocaleString("vi-VN")}đ`}
                </Text>
              </View>
            </>
          )}

          <View className="flex-row justify-between items-center pt-3">
            <Text className="text-base font-bold text-text">Tổng cộng</Text>
            <Text className="text-xl font-bold text-primary">
              {`${totalAmount.toLocaleString("vi-VN")}đ`}
            </Text>
          </View>
        </View>

        {/* Payment Options */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-base font-bold text-text mb-3">
            Phương thức thanh toán
          </Text>

          <View className="border-2 rounded-xl p-4 mb-3 border-primary bg-primary/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-text mb-1">
                  Thanh toán toàn bộ
                </Text>
                <Text className="text-sm text-textGray">
                  {`${totalAmount.toLocaleString("vi-VN")}đ`}
                </Text>
              </View>
              <View className="w-6 h-6 rounded-full border-2 items-center justify-center border-primary bg-primary">
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* Important Note */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4 flex-row">
          <Ionicons name="information-circle" size={24} color="#2E86AB" />
          <Text className="flex-1 text-sm text-blue-800 ml-2">
            <Text className="font-bold">Lưu ý:{"\n"}</Text>
            {`• Đơn hàng bao gồm 1 gọng + 1 tròng kính\n• Thanh toán qua VNPay\n• Quý khách vui lòng đến cửa hàng để nhận hàng\n• Shop sẽ liên hệ để xác nhận đơn hàng`}
          </Text>
        </View>
      </View>
    );
  };

  const maxSteps = 2;

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-sm text-textGray mt-4">Đang tải sản phẩm...</Text>
      </View>
    );
  }

  // No products available
  if (lensProducts.length === 0 || frameProducts.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-5">
        <Ionicons name="eye-off-outline" size={64} color="#CCCCCC" />
        <Text className="text-lg text-text font-bold mt-4 mb-2">
          Không có sản phẩm
        </Text>
        <Text className="text-sm text-textGray text-center mb-6">
          Hiện chưa có tròng hoặc gọng kính nào khả dụng
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Đặt tròng kính + gọng
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View className="flex-row items-center justify-between">
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((num) => (
            <View key={num} className="flex-row items-center flex-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step >= num ? "bg-primary" : "bg-border"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step >= num ? "text-white" : "text-textGray"
                  }`}
                >
                  {num}
                </Text>
              </View>
              {num < maxSteps && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white border-t border-border px-5 py-4">
        <View className="flex-row gap-3">
          {step > 1 && (
            <TouchableOpacity
              className="flex-1 bg-background rounded-xl py-4 items-center"
              onPress={() => setStep(step - 1)}
            >
              <Text className="text-text font-bold text-base">Quay lại</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 bg-primary rounded-xl py-4 items-center flex-row justify-center"
            onPress={handleNext}
          >
            <Text className="text-white font-bold text-base">
              {step === maxSteps ? "Thanh toán" : "Tiếp theo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
