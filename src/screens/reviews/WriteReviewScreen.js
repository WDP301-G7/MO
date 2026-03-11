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
import * as FileSystem from "expo-file-system/legacy";
import {
  createReview,
  updateReview,
  isReviewEditable,
} from "../../services/reviewService";
import { getProductImages } from "../../services/productService";

export default function WriteReviewScreen({ navigation, route }) {
  const {
    orderItem,
    isEdit = false,
    existingReview = null,
  } = route.params || {};

  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  // existingImages: already-uploaded images from server [{id, imageUrl, ...}]
  // newImages: local files just picked by user [{uri, type, name}]
  const [existingImages, setExistingImages] = useState(
    isEdit ? existingReview?.images || [] : [],
  );
  const [newImages, setNewImages] = useState([]);
  const [productImageUri, setProductImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch product thumbnail
    const pid = orderItem?.productId || orderItem?.product?.id;
    if (pid) {
      getProductImages(pid).then((result) => {
        if (result.success && result.data?.length > 0) {
          const sorted = [...result.data].sort((a, b) =>
            b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
          );
          setProductImageUri(sorted[0].imageUrl);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Check if review is still editable
    if (isEdit && existingReview) {
      if (!isReviewEditable(existingReview.createdAt)) {
        Alert.alert(
          "Không thể sửa",
          "Đánh giá chỉ có thể sửa trong vòng 7 ngày sau khi tạo",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      }
    }
  }, []);

  const pickImages = async () => {
    const totalImages = existingImages.length + newImages.length;
    if (totalImages >= 3) {
      Alert.alert("Giới hạn", "Chỉ được tải lên tối đa 3 ảnh");
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Cần cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newImages2 = result.assets.slice(
          0,
          3 - existingImages.length - newImages.length,
        );

        // Check file size (5MB max per image)
        const validImages = [];
        for (const asset of newImages2) {
          if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
            Alert.alert("Lỗi", "Mỗi ảnh không được vượt quá 5MB");
            continue;
          }

          // Get file extension from URI
          const uriParts = asset.uri.split(".");
          const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

          // Determine MIME type based on extension - only allow JPEG, PNG, WebP
          let mimeType = null;
          let extension = null;

          if (fileExtension === "png") {
            mimeType = "image/png";
            extension = "png";
          } else if (fileExtension === "webp") {
            mimeType = "image/webp";
            extension = "webp";
          } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
            mimeType = "image/jpeg";
            extension = "jpg";
          } else {
            // Unsupported file type
            Alert.alert(
              "Định dạng không hỗ trợ",
              `Chỉ hỗ trợ ảnh định dạng JPEG, PNG và WebP. File "${fileExtension}" không được hỗ trợ.`,
            );
            continue;
          }

          validImages.push({
            uri: asset.uri,
            type: mimeType,
            name: `review-${Date.now()}-${validImages.length}.${extension}`,
          });
        }

        if (validImages.length > 0) {
          setNewImages((prev) => [...prev, ...validImages]);
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá");
      return;
    }

    if (comment.length > 1000) {
      Alert.alert(
        "Thông báo",
        "Nội dung đánh giá không được vượt quá 1000 ký tự",
      );
      return;
    }

    try {
      setLoading(true);

      const reviewData = {
        rating,
        comment: comment.trim(),
      };

      if (isEdit) {
        // Detect whether the image set changed at all
        const originalImageCount = existingReview?.images?.length || 0;
        const imagesChanged =
          newImages.length > 0 || existingImages.length !== originalImageCount;

        let allImagesToUpload = [];
        if (imagesChanged) {
          // Re-download remaining existing images to local files, then merge with new picks
          if (existingImages.length > 0) {
            const downloadedExisting = await Promise.all(
              existingImages.map(async (img, i) => {
                const localUri = `${FileSystem.cacheDirectory}existing-${Date.now()}-${i}.jpg`;
                await FileSystem.downloadAsync(img.imageUrl, localUri);
                return {
                  uri: localUri,
                  type: "image/jpeg",
                  name: `existing-${Date.now()}-${i}.jpg`,
                };
              }),
            );
            allImagesToUpload = [...downloadedExisting, ...newImages];
          } else {
            allImagesToUpload = newImages;
          }
        }
        await updateReview(
          existingReview.id,
          reviewData,
          allImagesToUpload,
          imagesChanged,
        );
        Alert.alert("Thành công", "Đã cập nhật đánh giá", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
              // Refresh parent screen if callback exists
              if (route.params?.onRefresh) {
                route.params.onRefresh();
              }
            },
          },
        ]);
      } else {
        // Create new review
        reviewData.orderItemId = orderItem.id;

        await createReview(reviewData, newImages);
        Alert.alert("Thành công", "Đã gửi đánh giá thành công!", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
              // Refresh parent screen if callback exists
              if (route.params?.onRefresh) {
                route.params.onRefresh();
              }
            },
          },
        ]);
      }
    } catch (error) {
      let errorMessage = "Không thể gửi đánh giá";
      let errorTitle = "Lỗi";

      if (error.response?.status === 503) {
        errorTitle = "Máy chủ đang bận";
        errorMessage =
          "Máy chủ đang bận hoặc đang bảo trì. Vui lòng thử lại sau vài phút.";
      } else if (error.response?.status === 400) {
        // Try to extract validation error details
        const validationDetails = error.response?.data?.error?.details;
        if (
          validationDetails &&
          Array.isArray(validationDetails) &&
          validationDetails.length > 0
        ) {
          const firstError = validationDetails[0];
          errorMessage =
            firstError.message ||
            error.response?.data?.message ||
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        } else {
          errorMessage =
            error.response?.data?.message ||
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy đơn hàng hoặc sản phẩm này.";
      } else if (error.response?.status === 409) {
        errorMessage = "Sản phẩm này đã được đánh giá rồi.";
      } else if (error.code === "ECONNABORTED") {
        errorTitle = "Hết thời gian chờ";
        errorMessage = "Kết nối bị gián đoạn. Vui lòng thử lại.";
      } else if (error.message.includes("Network Error")) {
        errorTitle = "Lỗi mạng";
        errorMessage =
          "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối internet.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text flex-1">
              {isEdit ? "Sửa đánh giá" : "Viết đánh giá"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View className="bg-white p-5 mb-2">
          <View className="flex-row">
            {productImageUri ? (
              <Image
                source={{ uri: productImageUri }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
                className="bg-gray-100"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center">
                <Ionicons
                  name={
                    orderItem?.product?.type === "FRAME"
                      ? "glasses-outline"
                      : "eye-outline"
                  }
                  size={32}
                  color="#2E86AB"
                />
              </View>
            )}
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-text mb-1">
                {orderItem?.product?.name || "Sản phẩm"}
              </Text>
              <Text className="text-sm text-textGray">
                {orderItem?.product?.type === "FRAME"
                  ? "Gọng kính"
                  : "Tròng kính"}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        <View className="bg-white p-5 mb-2">
          <Text className="text-base font-semibold text-text mb-4">
            Đánh giá của bạn
          </Text>
          <View className="flex-row justify-center items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="p-2"
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? "#FFD700" : "#CCCCCC"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-center text-textGray text-sm mt-2">
            {rating === 1 && "Rất không hài lòng"}
            {rating === 2 && "Không hài lòng"}
            {rating === 3 && "Bình thường"}
            {rating === 4 && "Hài lòng"}
            {rating === 5 && "Rất hài lòng"}
          </Text>
        </View>

        {/* Comment */}
        <View className="bg-white p-5 mb-2">
          <Text className="text-base font-semibold text-text mb-3">
            Chia sẻ thêm về trải nghiệm của bạn
          </Text>
          <TextInput
            className="border border-border rounded-xl p-4 text-base text-text"
            placeholder="Viết nhận xét của bạn về sản phẩm... (không bắt buộc)"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={6}
            maxLength={1000}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
            style={{ minHeight: 120 }}
          />
          <Text className="text-xs text-textGray text-right mt-2">
            {comment.length}/1000 ký tự
          </Text>
        </View>

        {/* Images */}
        <View className="bg-white p-5 mb-6">
          <Text className="text-base font-semibold text-text mb-3">
            Thêm hình ảnh (Không bắt buộc)
          </Text>
          <Text className="text-sm text-textGray mb-4">
            Tối đa 3 ảnh, mỗi ảnh không quá 5MB
          </Text>

          <View className="flex-row flex-wrap">
            {/* Existing server images */}
            {existingImages.map((image, index) => (
              <View key={`existing-${index}`} className="relative mr-3 mb-3">
                <Image
                  source={{ uri: image.imageUrl }}
                  style={{ width: 96, height: 96, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  onPress={() => removeImage(index, true)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}

            {/* New local images */}
            {newImages.map((image, index) => (
              <View key={`new-${index}`} className="relative mr-3 mb-3">
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: 96, height: 96, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  onPress={() => removeImage(index, false)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}

            {existingImages.length + newImages.length < 3 && (
              <TouchableOpacity
                className="w-24 h-24 rounded-xl border-2 border-dashed border-border items-center justify-center"
                onPress={pickImages}
              >
                <Ionicons name="camera" size={32} color="#CCCCCC" />
                <Text className="text-xs text-textGray mt-2">Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Note */}
        {!isEdit && (
          <View className="bg-blue-50 mx-5 p-4 rounded-xl mb-6">
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#2E86AB" />
              <Text className="flex-1 text-sm text-primary ml-2">
                Bạn có thể sửa đánh giá trong vòng 7 ngày sau khi gửi
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white px-5 py-4 border-t border-border">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            loading ? "bg-gray-300" : "bg-primary"
          }`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              {isEdit ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
