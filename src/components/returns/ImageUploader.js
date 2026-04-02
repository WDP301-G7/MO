import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * ImageUploader - Component for uploading and managing images
 */
export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 5,
  disabled = false,
}) {
  const [processing, setProcessing] = React.useState(false);

  /**
   * Convert image to JPEG format (to handle HEIC from iOS)
   */
  const convertToJpeg = async (imageUri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(imageUri, [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return manipResult;
    } catch (error) {
      throw error;
    }
  };

  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert("Thông báo", `Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục",
      );
      return;
    }

    try {
      setProcessing(true);

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        // Convert all images to JPEG
        const convertedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const converted = await convertToJpeg(asset.uri);
            return {
              uri: converted.uri,
              width: converted.width,
              height: converted.height,
              type: "image/jpeg",
              mimeType: "image/jpeg",
              fileName: `image_${Date.now()}.jpg`,
            };
          }),
        );

        onChange([...images, ...convertedImages]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  const takePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert("Thông báo", `Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Vui lòng cấp quyền truy cập camera để tiếp tục",
      );
      return;
    }

    try {
      setProcessing(true);

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        // Convert to JPEG
        const asset = result.assets[0];
        const converted = await convertToJpeg(asset.uri);

        const newImage = {
          uri: converted.uri,
          width: converted.width,
          height: converted.height,
          type: "image/jpeg",
          mimeType: "image/jpeg",
          fileName: `photo_${Date.now()}.jpg`,
        };

        onChange([...images, newImage]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = (index) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa ảnh này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          onChange(images.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const showImageOptions = () => {
    Alert.alert(
      "Chọn ảnh",
      "Bạn muốn lấy ảnh từ đâu?",
      [
        {
          text: "Thư viện",
          onPress: pickImage,
        },
        {
          text: "Chụp ảnh",
          onPress: takePhoto,
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Ảnh chứng minh</Text>
        <Text style={styles.count}>
          {images.length}/{maxImages} ảnh
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Existing images */}
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: image.uri || image.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {!disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Add image button */}
        {images.length < maxImages && !disabled && (
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={showImageOptions}
            disabled={processing}
          >
            {processing ? (
              <>
                <ActivityIndicator size="small" color="#F18F01" />
                <Text style={styles.addImageText}>Đang xử lý...</Text>
              </>
            ) : (
              <>
                <Ionicons name="camera-outline" size={32} color="#999" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.hint}>
        Ảnh sẽ tự động chuyển sang định dạng JPG (tối đa 5MB/ảnh)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  count: {
    fontSize: 13,
    color: "#6B7280",
  },
  scrollView: {
    marginBottom: 8,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 12,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
