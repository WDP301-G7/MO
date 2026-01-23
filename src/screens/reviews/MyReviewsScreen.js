import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function MyReviewsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("all"); // all, pending, reviewed

  const reviews = [
    {
      id: 1,
      productName: "Gọng kính Rayban RB5154",
      productImage:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      rating: 5,
      comment:
        "Sản phẩm rất tốt, chất lượng cao. Đeo rất thoải mái và phong cách. Nhân viên tư vấn nhiệt tình.",
      date: "15/01/2024",
      status: "reviewed",
      helpful: 24,
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=100&h=100&fit=crop",
      ],
    },
    {
      id: 2,
      productName: "Kính mát Aviator Classic",
      productImage:
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=200&fit=crop",
      rating: 4,
      comment:
        "Gọng đẹp, chất liệu tốt nhưng hơi nặng một chút. Nhìn chung vẫn hài lòng.",
      date: "10/01/2024",
      status: "reviewed",
      helpful: 12,
      images: [],
    },
    {
      id: 3,
      productName: "Gọng kính Titanium Premium",
      productImage:
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=200&h=200&fit=crop",
      rating: 0,
      comment: "",
      date: "20/01/2024",
      status: "pending",
      helpful: 0,
      images: [],
    },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (activeTab === "all") return true;
    return review.status === activeTab;
  });

  const tabs = [
    { key: "all", label: "Tất cả", count: reviews.length },
    {
      key: "pending",
      label: "Chờ đánh giá",
      count: reviews.filter((r) => r.status === "pending").length,
    },
    {
      key: "reviewed",
      label: "Đã đánh giá",
      count: reviews.filter((r) => r.status === "reviewed").length,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">Đánh giá của tôi</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white px-5 py-3 flex-row border-b border-border">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-2 items-center border-b-2 ${
              activeTab === tab.key ? "border-primary" : "border-transparent"
            }`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? "text-primary" : "text-textGray"
              }`}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredReviews.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <Ionicons name="chatbox-outline" size={80} color="#CCCCCC" />
            <Text className="text-lg font-bold text-text mt-4">
              Chưa có đánh giá
            </Text>
            <Text className="text-sm text-textGray text-center mt-2">
              {activeTab === "pending"
                ? "Bạn chưa có sản phẩm nào cần đánh giá"
                : "Bạn chưa đánh giá sản phẩm nào"}
            </Text>
          </View>
        ) : (
          <View className="px-5 py-5">
            {filteredReviews.map((review) => (
              <View
                key={review.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row mb-3">
                  <Image
                    source={{ uri: review.productImage }}
                    className="w-20 h-20 rounded-lg"
                  />
                  <View className="flex-1 ml-3">
                    <Text
                      className="text-sm font-bold text-text mb-1"
                      numberOfLines={2}
                    >
                      {review.productName}
                    </Text>
                    <Text className="text-xs text-textGray">{review.date}</Text>
                  </View>
                </View>

                {review.status === "pending" ? (
                  <TouchableOpacity
                    className="bg-primary rounded-xl py-3 items-center"
                    onPress={() =>
                      alert("Mở form đánh giá sản phẩm: " + review.productName)
                    }
                  >
                    <Text className="text-white font-bold">Viết đánh giá</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View className="flex-row mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={18}
                          color="#F18F01"
                        />
                      ))}
                    </View>

                    <Text className="text-sm text-text leading-5 mb-3">
                      {review.comment}
                    </Text>

                    {review.images.length > 0 && (
                      <View className="flex-row gap-2 mb-3">
                        {review.images.map((img, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: img }}
                            className="w-16 h-16 rounded-lg"
                          />
                        ))}
                      </View>
                    )}

                    <View className="flex-row items-center justify-between border-t border-border pt-3">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="thumbs-up-outline"
                          size={16}
                          color="#999999"
                        />
                        <Text className="text-xs text-textGray ml-1">
                          {review.helpful} người thấy hữu ích
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          alert("Chỉnh sửa đánh giá: " + review.productName)
                        }
                      >
                        <Text className="text-xs text-primary font-semibold">
                          Chỉnh sửa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
